// Where uploaded files live, and the rules about what may be stored.
//
// This is the first feature on the site that accepts a file from a person, so
// the rules are written down here rather than spread across the routes that
// use them.
//
// Three things matter and each has bitten real sites:
//
//   1. The name the browser sends is attacker-controlled. "../../server.js",
//      a name ending in a NUL byte, and a name that is three hundred dots are
//      all valid strings in a multipart part. Nothing derived from it ever
//      reaches the filesystem: the stored name is generated here, and the
//      original is kept only in the database, for showing back to a human.
//
//   2. Files are NOT served from public/. Anything under public/ is world
//      readable to anyone who guesses the path, and an assignment PDF may be
//      next week's test. app/api/uploads/[id]/route.ts checks the session and
//      the class before it sends a byte.
//
//   3. Serving a file from our own origin means the browser trusts it with our
//      cookies. An "image" that is really HTML, or an SVG with a <script> in
//      it, becomes stored XSS on cs.ub.mn. Only a short list of types is ever
//      shown inline; everything else downloads, and every response carries
//      nosniff.

import { randomUUID } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";

/**
 * 10 MB. Comfortable for a PDF worksheet, a phone photo of handwritten work,
 * or a zip of source files; small enough that a class of thirty handing in one
 * file each is a few hundred megabytes against 17 GB free.
 */
export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

/**
 * What a person may upload, and what may be shown inline.
 *
 * `inline` is the dangerous column. A type is only in it when the browser
 * cannot be talked into running script from it: images and PDFs render in
 * their own sandboxed viewers, whereas SVG is XML that may contain <script>
 * and HTML is obviously executable. Both of those are allowed as uploads —
 * a student may legitimately hand in a web page — but they always download.
 */
const TYPES: Record<string, { ext: string; inline: boolean }> = {
  "image/png": { ext: "png", inline: true },
  "image/jpeg": { ext: "jpg", inline: true },
  "image/webp": { ext: "webp", inline: true },
  "image/gif": { ext: "gif", inline: true },
  "application/pdf": { ext: "pdf", inline: true },

  "image/svg+xml": { ext: "svg", inline: false },
  "text/html": { ext: "html", inline: false },
  "text/plain": { ext: "txt", inline: false },
  "text/markdown": { ext: "md", inline: false },
  "text/csv": { ext: "csv", inline: false },
  "application/json": { ext: "json", inline: false },
  "application/zip": { ext: "zip", inline: false },
  "application/x-zip-compressed": { ext: "zip", inline: false },
  "application/octet-stream": { ext: "bin", inline: false },
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": {
    ext: "docx",
    inline: false,
  },
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": {
    ext: "pptx",
    inline: false,
  },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": {
    ext: "xlsx",
    inline: false,
  },
};

/** Source files arrive with all sorts of types, or none. Judge by extension. */
const CODE_EXTENSIONS = new Set([
  "py", "cpp", "cc", "c", "h", "hpp", "java", "js", "ts", "sql", "txt", "md",
  "csv", "json", "html", "css",
]);

export function isAllowedType(mime: string, filename: string): boolean {
  if (TYPES[mime]) return true;
  const ext = filename.split(".").pop()?.toLowerCase() ?? "";
  return CODE_EXTENSIONS.has(ext);
}

/** Never trusted for a path — only for the Content-Type we send back. */
export function servesInline(mime: string): boolean {
  return TYPES[mime]?.inline ?? false;
}

/**
 * A filename safe to show a human.
 *
 * Not used for storage. Strips anything that could be read as a path, control
 * characters, and the leading dots that hide a file.
 */
export function displayName(raw: string): string {
  const base = raw.split(/[\\/]/).pop() ?? "file";
  const cleaned = base
    .replace(/[\u0000-\u001f\u007f]/g, "")
    .replace(/^\.+/, "")
    .trim();
  return cleaned.slice(0, 200) || "file";
}

/** The extension we will store under, from the type or the name. */
function extensionFor(mime: string, filename: string): string {
  const known = TYPES[mime]?.ext;
  if (known) return known;
  const ext = filename.split(".").pop()?.toLowerCase() ?? "";
  return /^[a-z0-9]{1,8}$/.test(ext) ? ext : "bin";
}

/**
 * Where the bytes go.
 *
 * Set UPLOAD_DIR to a path OUTSIDE the application directory on the server.
 * The deploy is `tar -xzf` over ~/cppjudge, and while tar does not delete what
 * it is not replacing, keeping student work inside a directory that a deploy
 * writes into is asking for it. The default is only for local development.
 */
export function uploadDir(): string {
  return process.env.UPLOAD_DIR || path.join(process.cwd(), "var", "uploads");
}

/**
 * Resolve a stored name to a full path, refusing anything that escapes.
 *
 * `stored_name` comes from our own database and is generated by this module,
 * so this should never fire — which is exactly why it is worth asserting. A
 * bug elsewhere that let a name through would otherwise be a file read of
 * anything the node process can see.
 */
export function pathForStored(storedName: string): string {
  if (!/^[a-f0-9-]{36}\.[a-z0-9]{1,8}$/.test(storedName)) {
    throw new Error("refusing a stored name that this module did not generate");
  }
  const dir = uploadDir();
  const full = path.join(dir, storedName);
  if (path.dirname(path.resolve(full)) !== path.resolve(dir)) {
    throw new Error("refusing a stored path outside the upload directory");
  }
  return full;
}

export interface StoredFile {
  storedName: string;
  bytes: number;
}

/** Write the bytes and hand back what the `uploads` row needs. */
export async function storeFile(
  data: Buffer,
  mime: string,
  filename: string,
): Promise<StoredFile> {
  if (data.byteLength === 0) throw new Error("The file is empty.");
  if (data.byteLength > MAX_UPLOAD_BYTES) {
    throw new Error(
      `That file is ${(data.byteLength / 1048576).toFixed(1)} MB. The limit is ${MAX_UPLOAD_BYTES / 1048576} MB.`,
    );
  }
  if (!isAllowedType(mime, filename)) {
    throw new Error("That kind of file is not accepted.");
  }

  const storedName = `${randomUUID()}.${extensionFor(mime, filename)}`;
  const dir = uploadDir();
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(pathForStored(storedName), data);
  return { storedName, bytes: data.byteLength };
}

/** Best effort: a missing file is not worth failing a delete over. */
export async function removeFile(storedName: string): Promise<void> {
  try {
    await fs.unlink(pathForStored(storedName));
  } catch {
    // Already gone, or never written. The row is what matters.
  }
}

export async function readFile(storedName: string): Promise<Buffer> {
  return fs.readFile(pathForStored(storedName));
}

/** "2.4 MB", for showing next to a filename. */
export function humanSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}
