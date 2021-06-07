import * as r from "runtypes";

const UUIDRegex =
  /^[0-9A-F]{8}-[0-9A-F]{4}-[4][0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i;
// Ensure the term is an integer
const isUUID = (x: string) => UUIDRegex.test(x);
// The validator is checking that:
// - candidateId is a string
// - candidateId is an UUID
// - add a brand
export const serverIdV = r.String.withConstraint(isUUID).withBrand("serverId");
export type ServerId = r.Static<typeof serverIdV>;
