import "reflect-metadata";
import "@di";

import { container } from "tsyringe";

import { ConsensusController } from "@consensus/infrastructure/consensus.controller";
const controller = container.resolve(ConsensusController);

import { createServer } from "net";
const server = createServer();
server.listen();
