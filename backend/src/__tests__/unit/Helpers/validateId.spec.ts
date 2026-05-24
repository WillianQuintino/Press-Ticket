import AppError from "../../../errors/AppError";
import { validateId } from "../../../helpers/validateId";

describe("validateId", () => {
  it("should return a positive integer when value is a valid number string", () => {
    expect(validateId("1")).toBe(1);
    expect(validateId("42")).toBe(42);
    expect(validateId("999")).toBe(999);
  });

  it("should return a positive integer when value is already a number", () => {
    expect(validateId(1)).toBe(1);
    expect(validateId(100)).toBe(100);
  });

  it("should use default field name 'id' in error message", () => {
    try {
      validateId("abc");
    } catch (err) {
      expect(err).toBeInstanceOf(AppError);
      expect((err as AppError).message).toBe("id inválido");
    }
  });

  it("should use custom field name in error message", () => {
    try {
      validateId("abc", "whatsappId");
    } catch (err) {
      expect(err).toBeInstanceOf(AppError);
      expect((err as AppError).message).toBe("whatsappId inválido");
    }
  });

  it("should throw AppError 400 for string 'abc'", () => {
    expect(() => validateId("abc")).toThrow(AppError);
  });

  it("should throw AppError 400 for zero", () => {
    expect(() => validateId(0)).toThrow(AppError);
  });

  it("should throw AppError 400 for negative number", () => {
    expect(() => validateId(-1)).toThrow(AppError);
    expect(() => validateId("-5")).toThrow(AppError);
  });

  it("should throw AppError 400 for float", () => {
    expect(() => validateId(1.5)).toThrow(AppError);
    expect(() => validateId("1.5")).toThrow(AppError);
  });

  it("should throw AppError 400 for empty string", () => {
    expect(() => validateId("")).toThrow(AppError);
  });

  it("should throw AppError 400 for null", () => {
    expect(() => validateId(null)).toThrow(AppError);
  });

  it("should throw AppError 400 for undefined", () => {
    expect(() => validateId(undefined)).toThrow(AppError);
  });

  it("should throw AppError 400 for object", () => {
    expect(() => validateId({})).toThrow(AppError);
  });

  it("should throw AppError 400 for array", () => {
    expect(() => validateId([])).toThrow(AppError);
  });

  it("should have statusCode 400 on AppError", () => {
    try {
      validateId("invalid");
    } catch (err) {
      expect(err).toBeInstanceOf(AppError);
      expect((err as AppError).statusCode).toBe(400);
    }
  });
});
