// Starter code, taken from a public GitHub repository.
//
// This is the GitHub Classroom idea, minus the part that does not fit a
// Mongolian secondary school: GitHub Classroom gives every student a private
// fork, which means every student needs a GitHub account, an email address and
// a working knowledge of git before they can write a line of Python.
//
// Instead the teacher imports the repo ONCE, when setting the task. The files
// are stored on the task, and each student gets their own copy in the site's
// own editor — where the judge, the plagiarism check and the marking already
// live. A class of thirty costs GitHub exactly one request rather than thirty,
// which also keeps us clear of the 60-per-hour limit on unauthenticated calls.

/** One file of starter code, as it will land in a student's editor. */
export interface StarterFile {
  /** Shown in the editor's file list. */
  name: string;
  language: "cpp" | "python";
  code: string;
}

/** Small on purpose: this is starter code, not a project to browse. */
export const MAX_STARTER_FILES = 4;
export const MAX_STARTER_BYTES = 60_000;

const LANGUAGE_BY_EXTENSION: Record<string, "cpp" | "python"> = {
  py: "python",
  cpp: "cpp",
  cc: "cpp",
  cxx: "cpp",
  c: "cpp",
  h: "cpp",
  hpp: "cpp",
};

export interface RepoRef {
  owner: string;
  repo: string;
  /** A branch, tag or commit. Empty means the repository's default. */
  ref: string;
  /** Only import below this directory, when the URL pointed at one. */
  dir: string;
}

/**
 * Read an owner/repo out of the URLs a teacher will actually paste.
 *
 * Handles the repository root, a /tree/branch link, and a link to a folder
 * inside the repo — which is what you get by navigating there and copying the
 * address bar, so it is the common case.
 */
export function parseRepoUrl(raw: string): RepoRef | null {
  let url: URL;
  try {
    url = new URL(raw.trim());
  } catch {
    return null;
  }
  if (url.hostname !== "github.com" && url.hostname !== "www.github.com") {
    return null;
  }

  const parts = url.pathname.split("/").filter(Boolean);
  if (parts.length < 2) return null;

  const owner = parts[0];
  const repo = parts[1].replace(/\.git$/, "");
  if (!/^[\w.-]+$/.test(owner) || !/^[\w.-]+$/.test(repo)) return null;

  // /owner/repo/tree/<ref>/<dir...>
  let ref = "";
  let dir = "";
  if (parts[2] === "tree" && parts[3]) {
    ref = parts[3];
    dir = parts.slice(4).join("/");
  }
  return { owner, repo, ref, dir };
}

interface TreeEntry {
  path: string;
  type: string;
  size?: number;
}

const API = "https://api.github.com";
const UA = "cs.ub.mn-school-assignments/1.0";

async function githubJson<T>(path: string): Promise<T> {
  const res = await fetch(API + path, {
    headers: {
      Accept: "application/vnd.github+json",
      "User-Agent": UA,
      // Set GITHUB_TOKEN to lift the 60-per-hour anonymous limit. Not
      // required: a teacher importing a handful of repos a week stays well
      // under it, and the students never call GitHub at all.
      ...(process.env.GITHUB_TOKEN
        ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` }
        : {}),
    },
    // A slow repo must not hold a form submission open forever.
    signal: AbortSignal.timeout(15_000),
  });
  if (res.status === 404) throw new Error("No public repository at that address.");
  if (res.status === 403) {
    throw new Error("GitHub is rate-limiting us. Try again in a few minutes.");
  }
  if (!res.ok) throw new Error(`GitHub said ${res.status}.`);
  return (await res.json()) as T;
}

/**
 * Fetch the source files a student should start from.
 *
 * Only the languages the site can run, only the files small enough to be
 * starter code, and only a few of them.
 */
export async function fetchStarterFiles(
  repoUrl: string,
): Promise<{ files: StarterFile[]; ref: RepoRef }> {
  const ref = parseRepoUrl(repoUrl);
  if (!ref) throw new Error("That does not look like a GitHub repository URL.");

  let branch = ref.ref;
  if (!branch) {
    const meta = await githubJson<{ default_branch: string }>(
      `/repos/${ref.owner}/${ref.repo}`,
    );
    branch = meta.default_branch;
  }

  const tree = await githubJson<{ tree: TreeEntry[]; truncated: boolean }>(
    `/repos/${ref.owner}/${ref.repo}/git/trees/${encodeURIComponent(branch)}?recursive=1`,
  );

  const wanted = tree.tree
    .filter((e) => e.type === "blob")
    .filter((e) => (ref.dir ? e.path.startsWith(ref.dir + "/") : true))
    .filter((e) => {
      const ext = e.path.split(".").pop()?.toLowerCase() ?? "";
      return ext in LANGUAGE_BY_EXTENSION;
    })
    .filter((e) => (e.size ?? 0) <= MAX_STARTER_BYTES)
    // Shallowest first: a repo's entry point is rarely six folders down.
    .sort((a, b) => a.path.split("/").length - b.path.split("/").length)
    .slice(0, MAX_STARTER_FILES);

  if (!wanted.length) {
    throw new Error(
      "No Python or C++ files small enough to be starter code were found there.",
    );
  }

  const files: StarterFile[] = [];
  let total = 0;
  for (const entry of wanted) {
    const url = `https://raw.githubusercontent.com/${ref.owner}/${ref.repo}/${encodeURIComponent(branch)}/${entry.path
      .split("/")
      .map(encodeURIComponent)
      .join("/")}`;
    const res = await fetch(url, {
      headers: { "User-Agent": UA },
      signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok) continue;
    const code = await res.text();
    total += code.length;
    if (total > MAX_STARTER_BYTES * MAX_STARTER_FILES) break;

    const ext = entry.path.split(".").pop()?.toLowerCase() ?? "";
    files.push({
      name: entry.path.split("/").pop()?.slice(0, 80) || "starter",
      language: LANGUAGE_BY_EXTENSION[ext],
      code: code.slice(0, MAX_STARTER_BYTES),
    });
  }

  if (!files.length) throw new Error("Those files could not be downloaded.");
  return { files, ref: { ...ref, ref: branch } };
}

/**
 * Read back what was stored on the task.
 *
 * Never throws: a task whose starter code is unreadable should offer no
 * starter code, not break the page it is on.
 */
export function parseStarterFiles(raw: string | null): StarterFile[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (f): f is StarterFile =>
          !!f &&
          typeof f.name === "string" &&
          typeof f.code === "string" &&
          (f.language === "cpp" || f.language === "python"),
      )
      .slice(0, MAX_STARTER_FILES)
      .map((f) => ({
        name: f.name.slice(0, 80),
        language: f.language,
        code: f.code.slice(0, MAX_STARTER_BYTES),
      }));
  } catch {
    return [];
  }
}
