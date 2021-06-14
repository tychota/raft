import { inject, injectable } from "tsyringe";
import { DI } from "injection";

import { UseCaseBus } from "@framework/cqrs";

import { IConsensusEventEmitter } from "@consensus/infrastructure/consensus.emitter";

import { HandleRequestVoteRPC } from "@consensus/business/handleRequestVoteRPC";
import { StartFollowerHeartbeat } from "@consensus/business/startFollowerHeartbeat";
import { StartElection } from "@consensus/business/startElection";

export interface IConsensusController {
  handleRequestVoteRPC(): Promise<void>;
}

@injectable()
export class ConsensusController implements IConsensusController {
  constructor(private readonly bus: UseCaseBus, @inject(DI.ConsensusEventEmitter) private readonly emitter: IConsensusEventEmitter) {
    this.listen();
    this.startFollowerHeartbeat();
  }

  private listen() {
    this.emitter.on("followerHeartbeatReceived", this.startFollowerHeartbeat);
    this.emitter.on("followerHeartbeatTimeout", this.startElection);
  }

  private async startElection() {
    const command = new StartElection();
    await this.bus.dispatchCommand(command);
  }

  private async startFollowerHeartbeat() {
    const command = new StartFollowerHeartbeat();
    await this.bus.dispatchCommand(command);
  }

  async handleRequestVoteRPC() {
    const command = new HandleRequestVoteRPC();
    return this.bus.dispatchCommand(command);
  }
}
