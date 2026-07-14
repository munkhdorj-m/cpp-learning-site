# Self-hosting Judge0

Drops C++ compile latency from ~1500ms (RapidAPI) to ~200–400ms, removes all rate limits, and costs ~$5/month for a small VPS.

## Why self-host

| | RapidAPI hosted | Self-hosted |
|--|--|--|
| Latency per submission | 1–2 seconds | 200–400ms |
| Daily quota | 50 (free) / 1000 ($10) / 5000 ($25) | unlimited |
| Cost | $0–$25/mo | ~$5/mo VPS |
| Setup time | 5 min | ~30 min, one time |
| Maintenance | none | rare (one server) |

For 300 students with class periods that burn 100+ submissions, self-hosting is the right answer.

---

## Prerequisites

- **A Linux server** — Ubuntu 22.04 LTS recommended. Must be Linux (Windows/macOS hosts will not work — Judge0's sandbox needs Linux kernel features). 2 GB RAM minimum, 4 GB recommended. ~20 GB disk.
- **Recommended providers** (Singapore region is closest to Mongolia):
  - **Hetzner Cloud** — CX22 (Singapore), ~$4.50/mo. Best price/performance.
  - **Vultr** — $6/mo High Frequency, Tokyo or Singapore.
  - **DigitalOcean** — $6/mo Basic Droplet, Singapore.
  - Or **a Linux PC at your school** that's always on — free.
- **An SSH client** to connect to the server. On Windows 11, the built-in terminal (`ssh user@ip`) works fine. PuTTY also works.

---

## Step 1: Spin up the server

Sign up at your chosen provider, create an Ubuntu 22.04 server in the Singapore region, and add your SSH key during creation. Note the public IP.

Connect:

```bash
ssh root@YOUR_SERVER_IP
```

(If using Hetzner you may need to ssh as `root` first time, then create a regular user. For simplicity below we'll stay as root — fine for a single-purpose server.)

---

## Step 2: Install Docker

```bash
# Update packages
apt-get update && apt-get upgrade -y

# Install Docker the official way
curl -fsSL https://get.docker.com | sh

# Verify
docker --version
docker compose version
```

---

## Step 3: Apply the kernel tweaks Judge0 requires

Judge0's sandbox (`isolate`) needs specific kernel settings. Without these you'll get cryptic errors.

```bash
# Apply for current boot
sysctl -w kernel.perf_event_paranoid=1
sysctl -w net.core.somaxconn=4096
sysctl -w net.netfilter.nf_conntrack_max=2097152

# Persist across reboots
cat <<'EOF' >> /etc/sysctl.conf

# Judge0 requirements
kernel.perf_event_paranoid=1
net.core.somaxconn=4096
net.netfilter.nf_conntrack_max=2097152
EOF
```

---

## Step 4: Download Judge0

```bash
mkdir -p /opt/judge0 && cd /opt/judge0

# Latest stable Judge0 CE release (check https://github.com/judge0/judge0/releases for newer)
wget https://github.com/judge0/judge0/releases/download/v1.13.1/judge0-v1.13.1.zip
unzip judge0-v1.13.1.zip
cd judge0-v1.13.1
```

---

## Step 5: Configure secrets

Open `judge0.conf` and set these — pick long random strings (the `openssl` command below generates them):

```bash
# Generate two secure tokens
openssl rand -hex 32   # use this for AUTHN_TOKEN
openssl rand -hex 32   # use this for AUTHZ_TOKEN (optional, can leave blank)

# Generate two secure passwords
openssl rand -hex 16   # for POSTGRES_PASSWORD
openssl rand -hex 16   # for REDIS_PASSWORD
```

Then edit `judge0.conf`:

```bash
nano judge0.conf
```

Set:

```
AUTHN_HEADER=X-Auth-Token
AUTHN_TOKEN=<your-first-openssl-hex>

POSTGRES_HOST=db
POSTGRES_DB=judge0
POSTGRES_USER=judge0
POSTGRES_PASSWORD=<your-postgres-password>

REDIS_HOST=redis
REDIS_PASSWORD=<your-redis-password>
```

Save (Ctrl+O, Enter, Ctrl+X).

**Save `AUTHN_TOKEN` — you'll need it for the Next.js app in step 8.**

---

## Step 6: Start Judge0

Database and Redis need to start first, then everything else:

```bash
# Start DB + Redis
docker compose up -d db redis

# Wait 10 seconds for them to initialize
sleep 10

# Start the rest
docker compose up -d

# Watch the logs to confirm
docker compose logs -f --tail=50
# Ctrl+C to exit logs (containers keep running)
```

---

## Step 7: Test it

From your laptop (not the server):

```bash
# Health check (no auth)
curl http://YOUR_SERVER_IP:2358/about

# Compile-and-run a tiny C++ program (replace YOUR_TOKEN)
curl -X POST 'http://YOUR_SERVER_IP:2358/submissions?wait=true' \
  -H "X-Auth-Token: YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "source_code": "#include<iostream>\nint main(){std::cout<<\"hi\";}",
    "language_id": 54
  }'
```

Expected: a JSON response with `"stdout": "hi"` and `"status": {"description": "Accepted"}`. Should come back in well under a second.

If you get errors, run `docker compose logs server` on the server to see what happened. Most common issue: skipped step 3 (the sysctl commands).

---

## Step 8: Connect the Next.js app

Edit your local `.env.local`:

```bash
# Change from RapidAPI:
# JUDGE0_API_URL=https://judge0-ce.p.rapidapi.com
# JUDGE0_API_KEY=<rapidapi-key>
# JUDGE0_API_HOST=judge0-ce.p.rapidapi.com

# To your self-hosted:
JUDGE0_API_URL=http://YOUR_SERVER_IP:2358
JUDGE0_API_KEY=<your-AUTHN_TOKEN-from-step-5>
JUDGE0_API_HOST=                                # blank — only RapidAPI needs this
```

You'll also need to make the client send `X-Auth-Token` instead of `X-RapidAPI-Key` since you're talking to Judge0 directly now. **Tell me when you're at this step** and I'll update `lib/judge0.ts` to support both modes (a one-line auto-detect: if `JUDGE0_API_HOST` is empty, use `X-Auth-Token`, else use RapidAPI headers).

Restart `npm run dev` and hit `/ide`. You should see submissions return in 200–400ms instead of 1500ms.

---

## Step 9 (recommended): Lock it down

Right now port 2358 is open to the world. Anyone who finds your IP can hit Judge0 (auth token protects against use, but they can still hammer it). Two options:

**Option A — Firewall to your laptop only (simplest):**

```bash
# Replace YOUR_LAPTOP_IP with your home IP from https://whatismyipaddress.com
ufw allow ssh
ufw allow from YOUR_LAPTOP_IP to any port 2358
ufw enable
```

Downside: if your home IP changes, you lose access. Add your school's static IP too.

**Option B — Put it behind Vercel (production option):**

Once you deploy the Next.js app to Vercel, only Vercel needs access. Either:
- Allowlist Vercel's IP ranges in `ufw` (Vercel publishes them).
- Or set up Cloudflare Tunnel — Judge0 stays behind a private hostname, your Next.js calls it through Cloudflare.

Phase-2 problem. For now, option A is fine for development/testing.

---

## Maintenance

**Update Judge0 (every few months):**

```bash
cd /opt/judge0
docker compose down
# Download newer release zip from GitHub, unzip, copy your judge0.conf over
docker compose up -d db redis && sleep 10 && docker compose up -d
```

**Check it's still alive:**

```bash
curl http://YOUR_SERVER_IP:2358/about
docker compose ps   # all services should say "Up"
```

**See submission queue:**

```bash
docker compose logs workers --tail=50
```

---

## Troubleshooting

**`curl: (7) Failed to connect`** — port 2358 not open. Check `ufw status` or your cloud provider's firewall.

**Submissions return `Internal error` or hang in `Processing`** — kernel sysctl tweaks from step 3 weren't applied or didn't persist. Re-run them and `docker compose restart`.

**`docker compose up` fails on Hetzner CX22** — out of memory. Either bump to CX32 (4 GB RAM) or disable extra workers in `docker-compose.yml`.

**Slow submissions even after self-hosting** — check the server's CPU. Judge0 single-threaded compile takes ~200ms on a decent core. On a 1-vCPU shared server it can take 1s. Bump to a CPU-optimized plan.

---

## What's next

After it works locally, when you deploy the Next.js app to Vercel/Railway, you'll need Vercel → Judge0 to be reachable. Easiest: keep Judge0 on a public IP with firewall allowlisting Vercel. Or set up a private network (more work, more secure). We can wire that up in phase 3.
