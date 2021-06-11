import { serverIdV } from "../serverId";

describe("value object 'term'", () => {
  it("refuses number", () => {
    // Given
    const rawData = 12;
    // When
    const isTerm = serverIdV.guard(rawData);
    // Then
    expect(isTerm).toBe(false);
  });
  it("refuses random string", () => {
    // Given
    const rawData = "test";
    // When
    const isTerm = serverIdV.guard(rawData);
    // Then
    expect(isTerm).toBe(false);
  });
  it("accepts uuid string", () => {
    // Given
    const rawData = "1af0d407-d520-4fff-9312-cf6ac72521a8";
    // When
    const isTerm = serverIdV.guard(rawData);
    // Then
    expect(isTerm).toBe(true);
  });
});
