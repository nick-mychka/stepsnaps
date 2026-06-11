import { describe, expect, it } from "vitest";

import { parseYouTubeVideoId } from "./youtube";

const ID = "dQw4w9WgXcQ";

describe("parseYouTubeVideoId", () => {
  it("parses a standard watch URL", () => {
    expect(parseYouTubeVideoId(`https://www.youtube.com/watch?v=${ID}`)).toBe(
      ID,
    );
  });

  it("parses a watch URL with extra query params", () => {
    expect(
      parseYouTubeVideoId(`https://www.youtube.com/watch?v=${ID}&t=30s`),
    ).toBe(ID);
  });

  it("parses a short youtu.be URL", () => {
    expect(parseYouTubeVideoId(`https://youtu.be/${ID}`)).toBe(ID);
    expect(parseYouTubeVideoId(`https://youtu.be/${ID}?si=abc123`)).toBe(ID);
  });

  it("parses shorts, embed, and live URLs", () => {
    expect(parseYouTubeVideoId(`https://www.youtube.com/shorts/${ID}`)).toBe(
      ID,
    );
    expect(parseYouTubeVideoId(`https://www.youtube.com/embed/${ID}`)).toBe(ID);
    expect(parseYouTubeVideoId(`https://www.youtube.com/live/${ID}`)).toBe(ID);
  });

  it("handles mobile, no-www, no-scheme, and nocookie hosts", () => {
    expect(parseYouTubeVideoId(`https://m.youtube.com/watch?v=${ID}`)).toBe(ID);
    expect(parseYouTubeVideoId(`youtube.com/watch?v=${ID}`)).toBe(ID);
    expect(parseYouTubeVideoId(`http://youtube.com/watch?v=${ID}`)).toBe(ID);
    expect(
      parseYouTubeVideoId(`https://www.youtube-nocookie.com/embed/${ID}`),
    ).toBe(ID);
  });

  it("trims surrounding whitespace", () => {
    expect(parseYouTubeVideoId(`  https://youtu.be/${ID}  `)).toBe(ID);
  });

  it("rejects empty and junk input", () => {
    expect(parseYouTubeVideoId("")).toBeNull();
    expect(parseYouTubeVideoId("   ")).toBeNull();
    expect(parseYouTubeVideoId("not a url")).toBeNull();
    expect(parseYouTubeVideoId("ftp://youtube.com/watch?v=" + ID)).toBeNull();
  });

  it("rejects non-YouTube URLs", () => {
    expect(parseYouTubeVideoId(`https://vimeo.com/${ID}`)).toBeNull();
    expect(
      parseYouTubeVideoId(`https://notyoutube.com/watch?v=${ID}`),
    ).toBeNull();
    expect(
      parseYouTubeVideoId(`https://fakeyoutu.be.evil.com/${ID}`),
    ).toBeNull();
  });

  it("rejects YouTube URLs without a valid video id", () => {
    expect(parseYouTubeVideoId("https://www.youtube.com/watch")).toBeNull();
    expect(parseYouTubeVideoId("https://www.youtube.com/")).toBeNull();
    expect(
      parseYouTubeVideoId("https://www.youtube.com/watch?v=tooshort"),
    ).toBeNull();
    expect(
      parseYouTubeVideoId("https://www.youtube.com/watch?v=way-too-long-id"),
    ).toBeNull();
    expect(
      parseYouTubeVideoId("https://www.youtube.com/playlist?list=PL123"),
    ).toBeNull();
  });

  it("does not accept a bare video id without a URL", () => {
    expect(parseYouTubeVideoId(ID)).toBeNull();
  });
});
