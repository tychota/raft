import "reflect-metadata";
import "@consensus/cqrs";

import { container } from "tsyringe";

import { ConsensusController } from "@consensus/infrastructure/consensus.controller";
const controller = container.resolve(ConsensusController);

import { Server } from "@api/infrastructure/server";
const server = container.resolve(Server)
server.listen()
