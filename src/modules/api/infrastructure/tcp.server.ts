import { injectable } from "tsyringe";

import { createServer, Socket, Server, AddressInfo } from "net";
import { LoggerController } from "@log/infrastructure/logger.controller";

import { ArchitectureLayer, LogOrigin } from "@log/domain/logOrigin";

class TcpServerLog extends LogOrigin {
  constructor() {
    super("API", ArchitectureLayer.INFRASTRUCTURE, "tcp.server.ts");
  }
}

@injectable()
export class TcpServer {
  private readonly net: Server;

  constructor(private readonly logger: LoggerController) {
    this.logger.setOrigin(new TcpServerLog());

    this.net = createServer();

    this.net.on("close", this.onClose);
    this.net.on("connection", this.onConnection);
  }

  private onClose = () => {
    this.logger.info("TCP_SERVER_CLOSED");
  };

  private onConnection = (socket: Socket) => {
    this.logger.verbose("TCP_SERVER_INFO", {
      address: this.net.address() as AddressInfo,
      localPort: socket.localPort,
      localAddress: socket.localAddress,
    });
    this.logger.verbose("TCP_CLIENT_INFO", {
      remotePort: socket.remotePort,
      remoteAddress: socket.remoteAddress,
      remoteFamily: socket.remoteFamily,
    });
    socket.setEncoding("utf8");
    socket.on("data", (data) => this.onData(data, socket));
  };

  private onData = (data: Buffer, socket: Socket) => {
    this.logger.trace("TCP_SERVER_DATA_RECEIVED", { data: data });
  };

  listen() {
    this.logger.info("TCP_SERVER_LISTEN");
    this.net.listen("2222");
  }
}
