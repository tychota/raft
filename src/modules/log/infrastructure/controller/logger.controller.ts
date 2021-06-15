import { injectable } from "tsyringe";
import merge from "deepmerge";

import { UseCaseBus } from "@framework/cqrs";

import { LogEntry } from "@log/domain/logEntry.entity";
import { LogOrigin, UndefinedLogOrigin } from "@log/domain/logOrigin";
import { LogLevel } from "@log/domain/logLevel";

type Data = Record<string, any>;
type Metadata = Record<string, any>;

@injectable()
export class LoggerController {
  private origin: LogOrigin = new UndefinedLogOrigin();

  constructor(/* private readonly bus: UseCaseBus */) {}

  public setOrigin(origin: LogOrigin) {
    this.origin = origin;
  }

  public logEntries(entries: LogEntry[]) {
    console.log(entries);
  }

  private getMetadata(customMetadata: Metadata): Metadata {
    const baseMetadata = { time: process.hrtime.bigint() };
    return merge<Metadata>({}, baseMetadata, customMetadata);
  }

  public debug(localizedMessage: string, data: Data = {}, customMetadata: Metadata = {}) {
    const entry = new LogEntry(this.origin, LogLevel.DEBUG, localizedMessage, data, this.getMetadata(customMetadata));
    this.logEntries([entry]);
  }

  public trace(localizedMessage: string, data: Data = {}, customMetadata: Metadata = {}) {
    const entry = new LogEntry(this.origin, LogLevel.TRACE, localizedMessage, data, this.getMetadata(customMetadata));
    this.logEntries([entry]);
  }

  public verbose(localizedMessage: string, data: Data = {}, customMetadata: Metadata = {}) {
    const entry = new LogEntry(this.origin, LogLevel.VERBOSE, localizedMessage, data, this.getMetadata(customMetadata));
    this.logEntries([entry]);
  }

  public info(localizedMessage: string, data: Data = {}, customMetadata: Metadata = {}) {
    const entry = new LogEntry(this.origin, LogLevel.INFO, localizedMessage, data, this.getMetadata(customMetadata));
    this.logEntries([entry]);
  }

  public warn(localizedMessage: string, data: Data = {}, customMetadata: Metadata = {}) {
    const entry = new LogEntry(this.origin, LogLevel.WARN, localizedMessage, data, this.getMetadata(customMetadata));
    this.logEntries([entry]);
  }

  public error(localizedMessage: string, data: Data = {}, customMetadata: Metadata = {}) {
    const entry = new LogEntry(this.origin, LogLevel.ERROR, localizedMessage, data, this.getMetadata(customMetadata));
    this.logEntries([entry]);
  }

  public critical(localizedMessage: string, data: Data = {}, customMetadata: Metadata = {}) {
    const entry = new LogEntry(this.origin, LogLevel.CRITICAL, localizedMessage, data, this.getMetadata(customMetadata));
    this.logEntries([entry]);
  }
}
