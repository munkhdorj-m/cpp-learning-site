import { ExternalLink, FileText, Image as ImageIcon, Paperclip } from "lucide-react";

/**
 * The reading list on an assignment.
 *
 * Files go through /api/uploads/[id], never a public path, so a worksheet is
 * readable by the class it was set for and nobody else.
 */

export interface MaterialView {
  id: string;
  kind: "link" | "file";
  title: string;
  url: string | null;
  upload_id: string | null;
  mime: string | null;
  bytes: number | null;
}

function iconFor(m: MaterialView) {
  if (m.kind === "link") return ExternalLink;
  if (m.mime?.startsWith("image/")) return ImageIcon;
  if (m.mime === "application/pdf") return FileText;
  return Paperclip;
}

function size(bytes: number | null) {
  if (!bytes) return "";
  if (bytes < 1048576) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

export function MaterialList({ materials }: { materials: MaterialView[] }) {
  if (!materials.length) return null;

  return (
    <ul className="space-y-1.5">
      {materials.map((m) => {
        const Icon = iconFor(m);
        const href =
          m.kind === "link" ? (m.url ?? "#") : `/api/uploads/${m.upload_id}`;
        const external = m.kind === "link";
        return (
          <li key={m.id}>
            <a
              href={href}
              target="_blank"
              // noreferrer as well as noopener: a link a teacher pasted goes
              // to someone else's site, which has no business knowing which
              // assignment page a student came from.
              rel="noopener noreferrer"
              className="hud-hover flex items-center gap-2.5 rounded-lg border border-primary/15 px-3 py-2 transition-colors"
            >
              <Icon className="h-4 w-4 shrink-0 text-primary" />
              <span className="min-w-0 flex-1 truncate text-sm">{m.title}</span>
              {!external && (
                <span className="shrink-0 font-code text-[11px] text-muted-foreground">
                  {size(m.bytes)}
                </span>
              )}
              {external && (
                <span className="shrink-0 truncate font-code text-[11px] text-muted-foreground">
                  {(() => {
                    try {
                      return new URL(m.url ?? "").hostname.replace(/^www\./, "");
                    } catch {
                      return "";
                    }
                  })()}
                </span>
              )}
            </a>
          </li>
        );
      })}
    </ul>
  );
}
