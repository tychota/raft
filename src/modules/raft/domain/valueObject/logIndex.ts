import * as r from "runtypes";

// Ensure the term is an integer
const isInt = (x: unknown) => Number.isInteger(x);
const isPositive = (x: number) => x >= 0;
// The validator is checking that:
// - term is number
// - term is integer
// - term is positive
// - add a brand
export const logIndexV = r.Number.withConstraint(isInt).withConstraint(isPositive).withBrand("LogIndex");
export type LogIndex = r.Static<typeof logIndexV>;
