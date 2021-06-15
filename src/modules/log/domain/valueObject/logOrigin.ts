export enum ArchitectureLayer {
  INFRASTRUCTURE = "INFRA",
  BUSINESS = "BUSINESS",
  DOMAIN = "DOMAIN",
}

export abstract class LogOrigin {
  constructor(public readonly module?: string, public readonly layer?: ArchitectureLayer, public readonly file?: string) {}
}

export class UndefinedLogOrigin extends LogOrigin {
  constructor() {
    super();
  }
}
