import { candidateIdV } from "../server";

describe("value object 'candidateId'", () => {
  it("refuses number", () => {
    // Given
    const rawData = 42.5;
    // When
    const isTerm = candidateIdV.guard(rawData);
    // Then
    expect(isTerm).toBe(false);
  });
  it("refuses boolean", () => {
    // Given
    const rawData = false;
    // When
    const isTerm = candidateIdV.guard(rawData);
    // Then
    expect(isTerm).toBe(false);
  });
  it("refuses non UUID string", () => {
    // Given
    const rawData = "A non uuid string";
    // When
    const isTerm = candidateIdV.guard(rawData);
    // Then
    expect(isTerm).toBe(false);
  });
  it("accepts UUID string", () => {
    // Given
    const rawData = "3109d410-2b66-4653-8b7e-dd5c1f96baee";
    // When
    const isTerm = candidateIdV.guard(rawData);
    // Then
    expect(isTerm).toBe(true);
  });
});
