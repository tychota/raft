import { HandleCommand } from "@framework/cqrs";

import { ArchitectureLayer, LogOrigin } from "@log/domain/logOrigin";
import { LoggerController } from "@log/infrastructure/logger.controller";
import { autoInjectable, injectable } from "tsyringe";

import { HandleRequestVoteRPC } from "./handleRequestVoteRPC";

class HandleRequestVoteRPCLog extends LogOrigin {
  constructor() {
    super("CONSENSUS", ArchitectureLayer.BUSINESS, "handleRequestVoteRPC.handler.ts");
  }
}

@HandleCommand(HandleRequestVoteRPC)
@autoInjectable()
export class HandleRequestVoteRPCHandler {
  constructor(private readonly logger: LoggerController) {
    this.logger.setOrigin(new HandleRequestVoteRPCLog());
  }

  async execute(command: HandleRequestVoteRPC) {
    this.logger.info("TADA");
  }
}
