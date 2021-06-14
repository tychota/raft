import { injectable } from "tsyringe";

import { UseCaseBus } from "@framework/cqrs";

import { HandleRequestVoteRPC } from "@consensus/business/handleRequestVoteRPC";
import { StartFollowerHeartbeat } from "@consensus/business/startFollowerHeartbeat";
import { StartElection } from "@consensus/business/startElection";

import { ConsensusEventEmitter } from "@consensus/infrastructure/consensus.emitter";
import { PostCommandHook, PostQueryHook, PreCommandHook, PreQueryHook } from "framework/cqrs/hooks";

export interface IConsensusController {
  handleRequestVoteRPC(): Promise<void>;
}

@injectable()
export class ConsensusController implements IConsensusController {
  constructor(private readonly bus: UseCaseBus, private readonly emitter: ConsensusEventEmitter) {
    this.bus.registerLocalHook(
      new PreQueryHook((query, metadata) => {
        console.log(metadata.processTime, query.constructor.name);
      })
    );
    this.bus.registerLocalHook(
      new PostQueryHook((query, metadata) => {
        console.log(metadata.processTime, query.constructor.name, metadata.queryTime);
      })
    );
    this.bus.registerLocalHook(
      new PreCommandHook((command, metadata) => {
        console.log(metadata.processTime, command.constructor.name);
      })
    );
    this.bus.registerLocalHook(
      new PostCommandHook((command, metadata) => {
        console.log(metadata.processTime, command.constructor.name, metadata.queryTime);
      })
    );

    this.listen();
    this.startFollowerHeartbeat();
  }

  private listen() {
    this.emitter.on("followerHeartbeatReceived", this.startFollowerHeartbeat);
    this.emitter.on("followerHeartbeatTimeout", this.startElection);
  }

  private startElection = async () => {
    const command = new StartElection();
    await this.bus.dispatchCommand(command);
  };

  private startFollowerHeartbeat = async () => {
    const command = new StartFollowerHeartbeat();
    await this.bus.dispatchCommand(command);
  };

  handleRequestVoteRPC = async () => {
    const command = new HandleRequestVoteRPC();
    return this.bus.dispatchCommand(command);
  };
}
