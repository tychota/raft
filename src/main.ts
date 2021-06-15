import "reflect-metadata";
import "@consensus/cqrs";

import { container } from "tsyringe";

import { ConsensusController } from "@consensus/infrastructure/consensus.controller";
const controller = container.resolve(ConsensusController);

import { TcpServer } from "@api/infrastructure/tcp.server";
const server = container.resolve(TcpServer)
server.listen()
