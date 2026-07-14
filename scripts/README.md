# SPOJ → Supabase import pipeline

Three stages. Each writes its output to `scripts/data/` so you can rerun a
later stage without redoing the earlier ones.

```
1. scrape-spoj.mjs    → data/spoj-rgb7/<code>.json        (statements + samples)
2. build-tests.mjs    → data/spoj-rgb7-built/<code>.json  (LLM ref + validated tests)
3. import-problems.mjs                                    (Supabase bulk insert)
```

## 1. Scrape

```bash
node scripts/scrape-spoj.mjs
```

Opens a visible Chromium. If Cloudflare shows a challenge, solve it once —
the same browser session is reused for every subsequent fetch. Re-runs skip
problems already in `data/spoj-rgb7/`.

## 2. Build reference solutions + tests

```bash
# Add DEEPSEEK_API_KEY=sk-... to .env.local first.
# Get a key at https://platform.deepseek.com/api_keys
node scripts/build-tests.mjs

# subset
node scripts/build-tests.mjs --only ABC,DEF
node scripts/build-tests.mjs --limit 5
```

For each scraped problem this calls DeepSeek (`deepseek-chat`) and asks
for:

- cleaned Markdown statement (MN + EN)
- a C++17 reference solution
- 8–12 extra test inputs

The script compiles the reference with local g++, validates it produces the
exact sample outputs, then captures expected outputs for the extras by
running the reference. Problems whose reference fails on the samples are
**not** marked OK and will be skipped by the importer.

Outputs land in `data/spoj-rgb7-built/<code>.json` with `status` ∈
`{ok, ref_wrong_on_samples, compile_error, no_tool_call, llm_error}`. Open
any non-ok one to see what went wrong.

Rough cost: ~$0.001–$0.005 per problem with DeepSeek (statement-dependent).
For 613 problems, total spend is typically under $3.

## 3. Import

```bash
node scripts/import-problems.mjs --dry-run   # safe preview
node scripts/import-problems.mjs             # real insert
```

Reads `.env.local` for `NEXT_PUBLIC_SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY`.
Inserts one `problems` row per `status: "ok"` and the matching `test_cases`
rows (samples + extras). Idempotent on slug — re-running skips already-imported
problems.

## What to do with the rejects

After step 2 you'll have some `ref_wrong_on_samples` and `compile_error`
files. The fastest fix path:

- `compile_error`: open the file, the `data.reference_cpp` is right there.
  Re-prompt Claude with the error, or fix by hand and rerun just that file.
- `ref_wrong_on_samples`: the reference produced different output than the
  sample. Either the LLM misread the problem or the samples include hidden
  whitespace / multiple-answer cases. Inspect `sampleResults[]`.
