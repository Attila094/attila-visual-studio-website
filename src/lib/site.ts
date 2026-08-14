/** Canonical origin — single source for metadata, sitemap and robots.
 *
 *  The `.com` is the live host; `.hu` does not resolve, so every absolute URL
 *  built from here — the sitemap's entries, robots' pointer to it, and the
 *  link-preview card `metadataBase` turns into an absolute address — was
 *  naming a host no crawler could reach. */
export const SITE_URL = 'https://attilavisualstudio.com';
