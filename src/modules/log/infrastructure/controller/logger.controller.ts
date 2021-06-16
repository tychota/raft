import { injectable } from "tsyringe";
import merge from "deepmerge";

import { LogEntry, LogEntryData, LogEntryMetadata } from "@log/domain/logEntry.entity";
import { LogOrigin, UndefinedLogOrigin } from "@log/domain/logOrigin";
import { LogLevel } from "@log/domain/logLevel";

@injectable()
export class LoggerController {
  private origin: LogOrigin = new UndefinedLogOrigin();

  constructor(/* private readonly bus: UseCaseBus */) {}

  public setOrigin(origin: LogOrigin) {
    this.origin = origin;
  }

  public logEntries(entries: LogEntry[]) {
    entries.forEach((e) => console.log(e.metadata.time, e.level, e.localizedMessage, JSON.stringify(e.data)));
  }

  private getMetadata(customMetadata: Partial<LogEntryMetadata>): LogEntryMetadata {
    const baseMetadata = { time: process.hrtime.bigint() };
    return merge<LogEntryMetadata>({}, baseMetadata, customMetadata as any);
  }

  public debug(localizedMessage: string, data: LogEntryData = {}, customMetadata: Partial<LogEntryMetadata> = {}) {
    const entry = new LogEntry(this.origin, LogLevel.DEBUG, localizedMessage, data, this.getMetadata(customMetadata));
    this.logEntries([entry]);
  }

  public trace(localizedMessage: string, data: LogEntryData = {}, customMetadata: Partial<LogEntryMetadata> = {}) {
    const entry = new LogEntry(this.origin, LogLevel.TRACE, localizedMessage, data, this.getMetadata(customMetadata));
    this.logEntries([entry]);
  }

  public verbose(localizedMessage: string, data: LogEntryData = {}, customMetadata: Partial<LogEntryMetadata> = {}) {
    const entry = new LogEntry(this.origin, LogLevel.VERBOSE, localizedMessage, data, this.getMetadata(customMetadata));
    this.logEntries([entry]);
  }

  public info(localizedMessage: string, data: LogEntryData = {}, customMetadata: Partial<LogEntryMetadata> = {}) {
    const entry = new LogEntry(this.origin, LogLevel.INFO, localizedMessage, data, this.getMetadata(customMetadata));
    this.logEntries([entry]);
  }

  public warn(localizedMessage: string, data: LogEntryData = {}, customMetadata: Partial<LogEntryMetadata> = {}) {
    const entry = new LogEntry(this.origin, LogLevel.WARN, localizedMessage, data, this.getMetadata(customMetadata));
    this.logEntries([entry]);
  }

  public error(localizedMessage: string, data: LogEntryData = {}, customMetadata: Partial<LogEntryMetadata> = {}) {
    const entry = new LogEntry(this.origin, LogLevel.ERROR, localizedMessage, data, this.getMetadata(customMetadata));
    this.logEntries([entry]);
  }

  public critical(localizedMessage: string, data: LogEntryData = {}, customMetadata: Partial<LogEntryMetadata> = {}) {
    const entry = new LogEntry(this.origin, LogLevel.CRITICAL, localizedMessage, data, this.getMetadata(customMetadata));
    this.logEntries([entry]);
  }
}
