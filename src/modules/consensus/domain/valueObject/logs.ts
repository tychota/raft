import * as r from "runtypes";
import { logEntryV } from "./logEntry";

export const logsV = r.Array(logEntryV);
export type Logs = r.Static<typeof logsV>;
