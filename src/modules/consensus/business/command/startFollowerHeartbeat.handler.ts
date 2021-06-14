import { inject } from "tsyringe";
import { DI } from "injection";

import { HandleCommand } from "@framework/cqrs";

import { IConsensusTimer } from "@consensus/infrastructure/consensus.timer";

import { StartFollowerHeartbeat } from "./startFollowerHeartbeat";

@HandleCommand(StartFollowerHeartbeat)
export class StartFollowerHeartbeatHandler {
  constructor(@inject(DI.ConsensusTimer) private readonly timer: IConsensusTimer) {}

  execute(command: StartFollowerHeartbeat) {
    this.timer.startFollowerTimeout(300);
  }
}
