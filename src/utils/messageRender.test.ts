import { describe, expect, it } from "vitest";

import {
  classifyMessageUrls,
  extractUrls,
  isImageUrl,
  isVideoUrl,
  stripUrls,
} from "./messageRender";

describe("messageRender utilities", () => {
  it("extracts all URLs in order", () => {
    const text = "See https://a.example.com and https://b.example.com/file.pdf";

    expect(extractUrls(text)).toEqual([
      "https://a.example.com",
      "https://b.example.com/file.pdf",
    ]);
  });

  it("strips URLs and trims remaining text", () => {
    const text = "  Hello https://example.com/path  world  ";

    expect(stripUrls(text)).toBe("Hello world");
  });

  it("classifies by file extension for generic text messages", () => {
    const text = [
      "Look",
      "https://cdn.example.com/pic.JPG?size=2",
      "https://cdn.example.com/clip.webm",
      "https://cdn.example.com/readme.pdf",
    ].join(" ");

    const result = classifyMessageUrls(text, "text");

    expect(result.plainText).toBe("Look");
    expect(result.imageUrls).toEqual(["https://cdn.example.com/pic.JPG?size=2"]);
    expect(result.videoUrls).toEqual(["https://cdn.example.com/clip.webm"]);
    expect(result.fileUrls).toEqual(["https://cdn.example.com/readme.pdf"]);
  });

  it("respects explicit image message type", () => {
    const text = "https://cdn.example.com/photo.bin";

    const result = classifyMessageUrls(text, "image");

    expect(result.imageUrls).toEqual(["https://cdn.example.com/photo.bin"]);
    expect(result.videoUrls).toEqual([]);
    expect(result.fileUrls).toEqual([]);
  });

  it("respects explicit document message type", () => {
    const text = "https://cdn.example.com/a.png https://cdn.example.com/b.mp4";

    const result = classifyMessageUrls(text, "document");

    expect(result.fileUrls).toEqual([
      "https://cdn.example.com/a.png",
      "https://cdn.example.com/b.mp4",
    ]);
    expect(result.imageUrls).toEqual([]);
    expect(result.videoUrls).toEqual([]);
  });

  it("matches image/video URLs including query strings", () => {
    expect(isImageUrl("https://a.com/img.webp?v=1")).toBe(true);
    expect(isImageUrl("https://a.com/file.txt")).toBe(false);
    expect(isVideoUrl("https://a.com/movie.m4v?download=1")).toBe(true);
    expect(isVideoUrl("https://a.com/photo.jpg")).toBe(false);
  });
});
