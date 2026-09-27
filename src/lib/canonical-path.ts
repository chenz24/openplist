/** Normalize page aliases in one step, always keeping redirects origin-relative. */
export function canonicalPathname(pathname: string): string {
  const path = pathname.replace(/^\/en(?=\/|$)/, "");
  return `/${path.replace(/^\/+|\/+$/g, "")}`;
}
