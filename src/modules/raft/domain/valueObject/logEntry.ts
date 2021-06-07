import * as r from "runtypes";
import { logCommandV } from "./logCommand";
import { termIndexV } from "./termIndex";

// The validator is checking that:
// - add a brand
export const logEntryV = r.Record({ term: termIndexV, command: logCommandV });
export type LogEntry = r.Static<typeof logEntryV>;
