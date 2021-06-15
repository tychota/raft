import { LogLevel } from "../valueObject/logLevel";
import { LogOrigin } from "../valueObject/logOrigin";

export class LogEntry {
  constructor(
    private readonly origin: LogOrigin,
    private readonly level: LogLevel,
    private readonly localizedMessage: string,
    private readonly data: Record<string, any>,
    private readonly metadata: Record<string, any>
  ) {}
}
