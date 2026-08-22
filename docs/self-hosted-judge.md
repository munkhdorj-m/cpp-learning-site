# Running our own judge (go-judge on a free Oracle VPS)

The hosted Judge0 free tier allows roughly 50 submissions a day. One class of
thirty students will use that up in the first ten minutes of a lesson. This is
how to run the sandbox ourselves instead.

## Why go-judge rather than self-hosted Judge0

Oracle's Always Free tier is generous only on **Arm** (Ampere A1: up to 4 cores
and 24 GB). Judge0's official Docker images are x86-only, and it also wants
PostgreSQL, Redis and a worker pool. go-judge is a single Go binary that builds
for arm64, needs no database, and starts in milliseconds.

The trade is that go-judge is a **sandbox, not a judge**: it runs one command
under limits and reports what happened. Compiling, running each test, comparing
output and deciding a verdict is done by us, in `lib/judge/go-judge.ts`.

## 1. The instance

Region: Tokyo, Osaka, Seoul or Singapore — all are 80–150 ms from Mongolia,
which is irrelevant for judging.

Shape: **VM.Standard.A1.Flex**, 1–2 OCPU, 6 GB is plenty. Image: Ubuntu 22.04 or
24.04 (arm64).

Two things will bite:

- **"Out of host capacity"** on A1 is normal, not a fault. Keep retrying, or
  script it — it can take days.
- **Idle reclamation.** Always Free compute can be taken back when it looks
  idle, and a school judge is idle most of the week. Upgrading the account to
  Pay As You Go keeps the Always Free resources free *and* stops reclamation.
  Do this before you depend on the box for a lesson.

## 2. Install what the sandbox runs

go-judge does not ship compilers; it runs the ones on the host.

```bash
sudo apt update
sudo apt install -y g++ python3
```

Check the paths match `EXEC` in `lib/judge/go-judge.ts`:

```bash
which g++ python3      # expect /usr/bin/g++ and /usr/bin/python3
```

## 3. Install go-judge

From <https://github.com/criyle/go-judge/releases>, take the asset named
exactly **`go-judge_<version>_linux_arm64`** (or `_linux_amd64v2` on an x86
box).

Watch the name. The same release also publishes `go-judge-init_…_linux_arm64`
and `go-judge-shell_…_linux_arm64`, which are helpers, not the server. Pattern
matching on "linux_arm64" picks `go-judge-init` first, and it fails with a
bare `exit status 2` and no message at all. The real binary is 10-15 MB; the
init helper is under 3 MB, which is the quickest way to tell them apart.

```bash
curl -L https://github.com/criyle/go-judge/releases/download/v1.12.2/go-judge_1.12.2_linux_arm64 -o go-judge
sudo install -m 755 go-judge /usr/local/bin/go-judge
/usr/local/bin/go-judge --help | head -5   # must print flags
```

Generate a token and keep it — the site needs the same value:

```bash
openssl rand -hex 32
```

`/etc/systemd/system/go-judge.service`:

```ini
[Unit]
Description=go-judge sandbox
After=network.target

[Service]
ExecStart=/usr/local/bin/go-judge \
  -http-addr 0.0.0.0:5050 \
  -auth-token YOUR_TOKEN_HERE \
  -parallelism 2
Restart=always
RestartSec=2

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now go-judge
sudo systemctl status go-judge
```

`-parallelism` should be at most the number of cores. Submissions queue rather
than fail when it is busy.

## 4. Lock it down

**This API executes arbitrary commands. Never leave it open.**

Oracle images ship with restrictive local firewall rules *and* a separate
security list in the console. Both must allow the port, and both should be
narrowed to the web host only. Skipping either is the usual reason "it works
locally but the site can't reach it".

1. **VCN security list / NSG** — ingress rule for TCP 5050, source restricted to
   the cPanel server's outbound IP, not `0.0.0.0/0`.
2. **On the instance:**

   ```bash
   sudo iptables -I INPUT 1 -p tcp --dport 5050 -s <CPANEL_IP> -j ACCEPT
   sudo iptables -A INPUT -p tcp --dport 5050 -j DROP
   sudo apt install -y iptables-persistent   # so it survives a reboot
   ```

Find the outbound IP from the cPanel side with `curl -s ifconfig.me`. On shared
hosting it can change; if it does, the token is what still protects you, so
treat the token as essential rather than a nicety.

### Shared hosting probably blocks the port

cPanel servers usually run an egress firewall (CSF) that permits outbound
traffic only to a short list of ports — 80, 443, 25, 53 and a few more. Port
5050 is not on it, so the web host cannot reach the sandbox no matter how the
Oracle side is configured.

The symptom is specific enough to identify: from the web host, an outbound
connection is **refused instantly** rather than timing out, and it is refused
on *every* port including 22, even though 22 is open to the world in the
security list and sshd is running. A block on Oracle's side gives a timeout,
not a refusal. Meanwhile HTTPS calls keep working, which is the giveaway.

The fix is to serve the sandbox on a port the host allows:

```bash
sudo sed -i 's/-http-addr 0.0.0.0:5050/-http-addr 0.0.0.0:443/' /etc/systemd/system/go-judge.service
sudo systemctl daemon-reload && sudo systemctl restart go-judge
sudo iptables -I INPUT 1 -p tcp --dport 443 -s <CPANEL_IP> -j ACCEPT
sudo netfilter-persistent save
```

Add the matching ingress rule for 443, and set `GO_JUDGE_URL=http://<vps-ip>:443`.

**This is plain HTTP on port 443** — it satisfies the port filter but student
code and the token still cross the internet unencrypted. To finish the job
properly, point a hostname at the box (`judge.cs.ub.mn`), open port 80 so the
certificate can be issued, and put Caddy in front of go-judge for real TLS:

```
judge.cs.ub.mn {
    reverse_proxy 127.0.0.1:5050
}
```

go-judge then binds to `127.0.0.1:5050` only, and `GO_JUDGE_URL` becomes
`https://judge.cs.ub.mn`.

## 5. Point the site at it

In `.env.local` on the web host:

```
JUDGE_BACKEND=go-judge
JUDGE_FALLBACK=judge0
GO_JUDGE_URL=http://<vps-ip>:5050
GO_JUDGE_TOKEN=<the token from step 3>
```

Keep the `JUDGE0_*` values in place. `JUDGE_FALLBACK=judge0` means that if the
VPS is reclaimed, rebooted or firewalled off mid-lesson, submissions quietly go
back to Judge0 instead of failing. A judge that is merely *busy* is never
retried elsewhere — that would burn both quotas for nothing.

Restart the Node app (cPanel → Setup Node.js App → Restart).

## 6. Check it

```bash
npx tsx scripts/check-judge.mts
```

This runs the site's own judging code against whatever is configured and
confirms C++ compiles and runs, a wrong answer is marked wrong, a broken
program gives a compiler message, an endless loop is stopped, a crash is a
runtime error, Python works, and **the sandbox has no network access**. That
last one matters: if a student's program can reach the internet, the sandbox is
not isolated and should not be put in front of a class.

Exit code is non-zero if anything fails, so it can go in a deploy step.

## If something is wrong

| Symptom | Cause |
|---|---|
| `go-judge unreachable` | Port blocked. Check the security list *and* `iptables -L`. |
| `rejected the auth token` | `GO_JUDGE_TOKEN` differs from `-auth-token`. |
| Every submission is a compile error | `g++` is not installed, or not at `/usr/bin/g++`. |
| Python fails, C++ works | `python3` missing, or not at `/usr/bin/python3`. |
| `Internal Error` on every run | cgroups unavailable. go-judge needs cgroup v2 and to start as root. |
| `exit status 2`, nothing logged | Wrong binary — you have `go-judge-init`. Check the size: under 3 MB is the helper. |
| Connection *refused* instantly, on every port | The web host filters outbound ports, not Oracle. Serve on 443. |

Switching back is one line: set `JUDGE_BACKEND=judge0` and restart.
