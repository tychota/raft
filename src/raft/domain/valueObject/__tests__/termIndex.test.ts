import { termIndexV } from "../termIndex";

describe("value object 'term'", () => {
  it("refuses strings", () => {
    // Given
    const rawData = "ABC";
    // When
    const isTerm = termIndexV.guard(rawData);
    // Then
    expect(isTerm).toBe(false);
  });
  it("refuses non integer", () => {
    // Given
    const rawData = 0.5;
    // When
    const isTerm = termIndexV.guard(rawData);
    // Then
    expect(isTerm).toBe(false);
  });
  it("refuses negative number", () => {
    // Given
    const rawData = -1;
    // When
    const isTerm = termIndexV.guard(rawData);
    // Then
    expect(isTerm).toBe(false);
  });
  it("accepts positive integer", () => {
    // Given
    const rawData = 10;
    // When
    const isTerm = termIndexV.guard(rawData);
    // Then
    expect(isTerm).toBe(true);
  });
});
