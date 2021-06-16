import { HandleCommand } from "@framework/cqrs";
import { ArchitectureLayer, LogOrigin } from "@log/domain/logOrigin";
import { LoggerController } from "@log/infrastructure/logger.controller";
import { autoInjectable } from "tsyringe";

import { StartElection } from "./startElection";

class StartElectionHandlerLog extends LogOrigin {
  constructor() {
    super("CONSENSUS", ArchitectureLayer.BUSINESS, "startElection.handler.ts");
  }
}
@HandleCommand(StartElection)
@autoInjectable()
export class StartElectionHandler {
  constructor(private readonly logger: LoggerController) {
    this.logger.setOrigin(new StartElectionHandlerLog());
  }

  async execute(command: StartElection) {
    this.logger.info("TADA");
  }
}
