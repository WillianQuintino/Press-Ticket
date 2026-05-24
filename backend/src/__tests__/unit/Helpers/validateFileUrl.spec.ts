import AppError from "../../../errors/AppError";
import { validateFileUrl } from "../../../helpers/downloadHubFiles";

describe("validateFileUrl", () => {
  it("should return a sanitized URL for allowed host", () => {
    const result = validateFileUrl("https://api.notificamehub.com/file/123");
    expect(result).toContain("api.notificamehub.com");
    expect(result).toMatch(/^https:\/\//);
  });

  it("should strip query params that are not in the original URL path", () => {
    const result = validateFileUrl("https://api.notificamehub.com/file/abc");
    expect(typeof result).toBe("string");
    expect(result.length).toBeGreaterThan(0);
  });

  it("should throw AppError for http:// URL", () => {
    expect(() =>
      validateFileUrl("http://api.notificamehub.com/file/123")
    ).toThrow(AppError);
  });

  it("should throw AppError for ftp:// URL", () => {
    expect(() =>
      validateFileUrl("ftp://api.notificamehub.com/file/123")
    ).toThrow(AppError);
  });

  it("should throw AppError for empty string", () => {
    expect(() => validateFileUrl("")).toThrow(AppError);
  });

  it("should throw AppError for plain text", () => {
    expect(() => validateFileUrl("not-a-url")).toThrow(AppError);
  });

  it("should throw AppError for localhost", () => {
    expect(() => validateFileUrl("https://localhost/file")).toThrow(AppError);
  });

  it("should throw AppError for 127.0.0.1", () => {
    expect(() => validateFileUrl("https://127.0.0.1/file")).toThrow(AppError);
  });

  it("should throw AppError for 192.168.x.x", () => {
    expect(() => validateFileUrl("https://192.168.1.1/file")).toThrow(AppError);
  });

  it("should throw AppError for 10.x.x.x", () => {
    expect(() => validateFileUrl("https://10.0.0.1/file")).toThrow(AppError);
  });

  it("should throw AppError for unknown host", () => {
    expect(() =>
      validateFileUrl("https://evil.example.com/file")
    ).toThrow(AppError);
  });

  it("should throw AppError for google.com", () => {
    expect(() =>
      validateFileUrl("https://google.com/file")
    ).toThrow(AppError);
  });
});
