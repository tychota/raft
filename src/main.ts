import "reflect-metadata";

import { container } from "tsyringe";
import { DI } from "./injection";

import { IConsensusController } from "@consensus/infrastructure/consensus.controller";
const controller = container.resolve<IConsensusController>(DI.ConsensusController);

controller.handleRequestVoteRPC();
