export { normalizeWebsite };
export type { Organization };

// The address is optional, each of its parts; `country` is an ISO code (`DE`, see `countries.ts`), `website` a full URL
// (`https://…`, see `normalizeWebsite()`).
type Organization = {
  id: string;
  name: string;
  description: string;
  street: string;
  zipCode: string;
  city: string;
  country: string;
  website: string;
};

// A website as it is stored: trimmed, with `https://` when it has no scheme; `''` stays empty. `undefined`: no valid
// web address (a scheme other than http(s), or a host without a dot).
function normalizeWebsite(value: string): string | undefined {
  const text = value.trim();

  if (text === '') {
    return '';
  }

  const url = URL.parse(/^[a-z][a-z\d+.-]*:/i.test(text) ? text : `https://${text}`);

  return url !== null && (url.protocol === 'https:' || url.protocol === 'http:') && url.hostname.includes('.')
    ? url.href
    : undefined;
}
