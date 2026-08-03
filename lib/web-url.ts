export interface WebUrl {
  href: string;
  hostname: string;
}

export function parseWebUrl(value: string): WebUrl | null {
  try {
    const url = new URL(value);

    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      return null;
    }

    return {
      href: url.toString(),
      hostname: url.hostname,
    };
  } catch {
    return null;
  }
}
