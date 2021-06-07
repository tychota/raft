import * as r from "runtypes";

// The validator is checking that:
// - add a brand
export const logCommandV = r.String.withBrand("LogCommand");
export type LogCommand = r.Static<typeof logCommandV>;
