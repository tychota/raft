import { HandleCommand } from "@framework/cqrs";
import { ArchitectureLayer, LogOrigin } from "@log/domain/logOrigin";
import { LoggerController } from "@log/infrastructure/logger.controller";
import { ConsensusStorage } from "@consensus/infrastructure/consensus.storage";
import { ConsensusTimer } from "@consensus/infrastructure/consensus.timer";

import { autoInjectable } from "tsyringe";

import { StartElection } from "./startElection";

class StartElectionHandlerLog extends LogOrigin {
  constructor() {
    super("CONSENSUS", ArchitectureLayer.BUSINESS, "startElection.handler.ts");
  }
}

const tempSendRPC = () => Promise.resolve(Math.random() < 0.6);
@HandleCommand(StartElection)
@autoInjectable()
export class StartElectionHandler {
  constructor(private readonly logger: LoggerController, private readonly storage: ConsensusStorage, private readonly timer: ConsensusTimer) {
    this.logger.setOrigin(new StartElectionHandlerLog());
  }

  async execute(command: StartElection) {
    this.timer.clearFollowerTimeout();
    const aggregate = await this.storage.getAggregate();
    this.logger.debug("AGGREGATE", { aggregate });
    aggregate.startElection();
    this.logger.debug("AGGREGATE", { aggregate });
    await this.storage.persistAggregate(aggregate);
    // TODO: randomize
    const electionTimeout = this.timer.waitElectionTimeout(250).then(() => false);
    // TODO: send RPC
    const hasMajority = (values: boolean[]) => {
      const success = values.filter((v) => v === true);
      return success.length > values.length / 2;
    };
    const rpcAnswer = Promise.all([tempSendRPC(), tempSendRPC(), tempSendRPC()]).then(hasMajority);
    const winElection = await Promise.race([electionTimeout, rpcAnswer]);
    this.logger.debug("WIN_ELECTION", { winElection });
    if (winElection) {
      const aggregate = await this.storage.getAggregate();
      aggregate.winElection();
      await this.storage.persistAggregate(aggregate);
    } else {
      // TODO
    }
  }
}
