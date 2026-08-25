/**
 * Learn is read start-to-finish rather than scanned, so it marks itself as a
 * reading route and the ambient network turns itself down behind it. A marker
 * rather than a panel: nothing is drawn here, nothing boxes the content in.
 *
 * See `body:has(.reading-page)` in app/globals.css.
 */
export default function LearnLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="reading-page">{children}</div>;
}
