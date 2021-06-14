import { container, Lifecycle } from "tsyringe";
import { registerCommandHandler } from "@framework/cqrs";

export enum DI {
  ConsensusController = "ConsensusController",
  ConsensusEventEmitter = "ConsensusEventEmitter",
  ConsensusTimer = "ConsensusTimer",
}

import { ConsensusController, IConsensusController } from "@consensus/infrastructure/consensus.controller";
container.register<IConsensusController>(DI.ConsensusController, { useClass: ConsensusController });

import { ConsensusEventEmitter, IConsensusEventEmitter } from "@consensus/infrastructure/consensus.emitter";
container.register<IConsensusEventEmitter>(DI.ConsensusEventEmitter, { useClass: ConsensusEventEmitter }, { lifecycle: Lifecycle.Singleton });

import { ConsensusTimer, IConsensusTimer } from "@consensus/infrastructure/consensus.timer";
container.register<IConsensusTimer>(DI.ConsensusTimer, { useClass: ConsensusTimer }, { lifecycle: Lifecycle.Singleton });

import { HandleRequestVoteRPCHandler } from "@consensus/business/handleRequestVoteRPC.handler";
registerCommandHandler(HandleRequestVoteRPCHandler);

import { StartElectionHandler } from "@consensus/business/startElection.handler";
registerCommandHandler(StartElectionHandler);

import { StartFollowerHeartbeatHandler } from "@consensus/business/startFollowerHeartbeat.handler";
registerCommandHandler(StartFollowerHeartbeatHandler);
