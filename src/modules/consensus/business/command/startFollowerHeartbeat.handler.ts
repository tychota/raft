import { HandleCommand } from "@framework/cqrs";

import { ConsensusTimer } from "@consensus/infrastructure/consensus.timer";

import { StartFollowerHeartbeat } from "./startFollowerHeartbeat";

@HandleCommand(StartFollowerHeartbeat)
export class StartFollowerHeartbeatHandler {
  constructor(private readonly timer: ConsensusTimer) {}

  async execute(command: StartFollowerHeartbeat) {
    this.timer.startFollowerTimeout(300);
  }
}
