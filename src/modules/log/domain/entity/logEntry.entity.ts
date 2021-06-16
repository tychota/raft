import { LogLevel } from "../valueObject/logLevel";
import { LogOrigin } from "../valueObject/logOrigin";

export type LogEntryData = Record<string, any>;
export type LogEntryMetadata = Record<string, any> & { time: bigint };

export class LogEntry {
  constructor(
    public readonly origin: LogOrigin,
    public readonly level: LogLevel,
    public readonly localizedMessage: string,
    public readonly data: LogEntryData,
    public readonly metadata: LogEntryMetadata
  ) {}
}
