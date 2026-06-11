/**
 * Pure YouTube URL parsing. Only the canonical 11-character video ID is
 * stored; URLs are parsed at input time and rebuilt for display/embedding.
 */

const VIDEO_ID_RE = /^[A-Za-z0-9_-]{11}$/;

/**
 * Extract the canonical video ID from the common YouTube URL shapes
 * (watch, youtu.be, shorts, embed, live — with or without scheme/www/m.),
 * or null for anything that isn't a valid YouTube video link.
 */
export function parseYouTubeVideoId(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  let url: URL;
  try {
    url = new URL(trimmed.includes("://") ? trimmed : `https://${trimmed}`);
  } catch {
    return null;
  }

  if (url.protocol !== "https:" && url.protocol !== "http:") return null;

  const host = url.hostname.toLowerCase().replace(/^(www\.|m\.)/, "");
  const segments = url.pathname.split("/").filter(Boolean);

  let candidate: string | null = null;
  if (host === "youtu.be") {
    candidate = segments[0] ?? null;
  } else if (host === "youtube.com" || host === "youtube-nocookie.com") {
    if (url.pathname === "/watch") {
      candidate = url.searchParams.get("v");
    } else if (
      segments[0] === "shorts" ||
      segments[0] === "embed" ||
      segments[0] === "live"
    ) {
      candidate = segments[1] ?? null;
    }
  }

  return candidate && VIDEO_ID_RE.test(candidate) ? candidate : null;
}

/** Canonical watch URL, used to round-trip a stored ID back into a form. */
export function youTubeWatchUrl(videoId: string): string {
  return `https://www.youtube.com/watch?v=${videoId}`;
}

/** Privacy-enhanced embed URL for the challenge page player. */
export function youTubeEmbedUrl(videoId: string): string {
  return `https://www.youtube-nocookie.com/embed/${videoId}`;
}
