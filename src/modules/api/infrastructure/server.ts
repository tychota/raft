import { injectable } from "tsyringe";

import { createServer, Socket, Server as NetServer } from "net";

@injectable()
export class Server {
  private readonly net: NetServer;

  constructor() {
    this.net = createServer();
    this.net.on("close", this.onClose);
    this.net.on("connection", this.onConnection);
  }

  private onClose = () => {
    console.log("Server closed !");
  };

  private onConnection = (socket: Socket) => {
    this.logConnection(socket);
    socket.setEncoding("utf8");
    socket.on("data", (data) => this.onData(data, socket));
  };

  private onData = (data: Buffer, socket: Socket) => {
    var bread = socket.bytesRead;
    var bwrite = socket.bytesWritten;
    console.log("Bytes read : " + bread);
    console.log("Bytes written : " + bwrite);
    console.log("Data sent to server : " + data);

    //echo data
    var is_kernel_buffer_full = socket.write("Data ::" + data);
    if (is_kernel_buffer_full) {
      console.log("Data was flushed successfully from kernel buffer i.e written successfully!");
    } else {
      socket.pause();
    }
  };

  private logConnection = (socket: Socket) => {
    //this property shows the number of characters currently buffered to be written. (Number of characters is approximately equal to the number of bytes to be written, but the buffer may contain strings, and the strings are lazily encoded, so the exact number of bytes is not known.)
    //Users who experience large or growing bufferSize should attempt to "throttle" the data flows in their program with pause() and resume().

    console.log("Buffer size : " + socket.writableLength);

    console.log("---------server details -------------------");
    const address = this.net.address();
    if (address && typeof address !== "string") {
      console.log(`Server is listening at port ${address.port}`);
      console.log(`Server ip is ${address.address}`);
      console.log(`Server family (IP4/IP6) is ${address.family}`);
    }
    console.log(`Server is listening at LOCAL port ${socket.localPort}`);
    console.log(`Server LOCAL ip is  ${socket.localAddress}`);

    console.log("------------remote client info ------------");
    console.log(`REMOTE Socket is listening at port ${socket.remotePort}`);
    console.log(`REMOTE Socket ip is ${socket.remoteAddress}`);
    console.log(`REMOTE Socket is family (IP4/IP6) is ${socket.remoteFamily}`);
    console.log("-------------------------------------------");
  };

  listen() {
    this.net.listen("2222");
  }
}
