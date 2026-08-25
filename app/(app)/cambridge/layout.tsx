/**
 * Same reasoning as the learn section: the Cambridge topic pages are syllabus
 * prose, read rather than scanned, so they mark themselves as a reading route
 * and the ambient network drops back behind them.
 *
 * See `body:has(.reading-page)` in app/globals.css.
 */
export default function CambridgeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="reading-page">{children}</div>;
}
