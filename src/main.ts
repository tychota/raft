import "reflect-metadata";
import "@consensus/cqrs";

import { container } from "tsyringe";

import { ConsensusController } from "@consensus/infrastructure/consensus.controller";
const controller = container.resolve(ConsensusController);

import { Server } from "modules/api/infrastructure/server";
const server = new Server();
server.listen();
