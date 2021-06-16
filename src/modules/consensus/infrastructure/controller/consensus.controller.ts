import { injectable } from "tsyringe";

import { UseCaseBus } from "@framework/cqrs";

import { HandleRequestVoteRPC } from "@consensus/business/handleRequestVoteRPC";
import { StartFollowerHeartbeat } from "@consensus/business/startFollowerHeartbeat";
import { StartElection } from "@consensus/business/startElection";

import { ConsensusEventEmitter } from "@consensus/infrastructure/consensus.emitter";
import { PostCommandHook, PostQueryHook, PreCommandHook, PreQueryHook } from "framework/cqrs/hooks";
import { LoggerController } from "@log/infrastructure/logger.controller";
import { LogOrigin, ArchitectureLayer } from "@log/domain/logOrigin";

export interface IConsensusController {
  handleRequestVoteRPC(): Promise<void>;
}
class ConsensusControllerLog extends LogOrigin {
  constructor() {
    super("CONSENSUS", ArchitectureLayer.INFRASTRUCTURE, "consensus.controller.ts");
  }
}
@injectable()
export class ConsensusController implements IConsensusController {
  constructor(private readonly bus: UseCaseBus, private readonly emitter: ConsensusEventEmitter, private readonly logger: LoggerController) {
    this.logger.setOrigin(new ConsensusControllerLog());
    this.bus.registerLocalHook(
      new PreQueryHook((query, metadata) => {
        this.logger.verbose("START_QUERY", { query: query.constructor.name }, { time: metadata.processTime });
      })
    );
    this.bus.registerLocalHook(
      new PostQueryHook((query, metadata) => {
        this.logger.verbose("FINNISH_QUERY", { query: query.constructor.name }, { time: metadata.processTime, spendTime: metadata.queryTime });
      })
    );
    this.bus.registerLocalHook(
      new PreCommandHook((command, metadata) => {
        this.logger.verbose("START_COMMAND", { command: command.constructor.name }, { time: metadata.processTime });
      })
    );
    this.bus.registerLocalHook(
      new PostCommandHook((command, metadata) => {
        this.logger.verbose("FINNISH_COMMAND", { command: command.constructor.name }, { time: metadata.processTime, spendTime: metadata.queryTime });
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
