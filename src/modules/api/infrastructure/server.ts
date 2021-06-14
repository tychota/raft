import { createServer, Socket, Server as NetServer } from "net";

export class Server {
  private readonly net: NetServer;
  constructor() {
    this.net = createServer();
    this.net.on("close", this.onClose);
    this.net.on("connection", this.onConnection);
  }

  onClose = () => {
    console.log("Server closed !");
  };

  onConnection = (socket: Socket) => {
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

    var rport = socket.remotePort;
    var raddr = socket.remoteAddress;
    var rfamily = socket.remoteFamily;

    console.log(`REMOTE Socket is listening at port ${socket.remotePort}`);
    console.log(`REMOTE Socket ip is ${socket.remoteAddress}`);
    console.log(`REMOTE Socket is family (IP4/IP6) is ${socket.remoteFamily}`);

    console.log("-------------------------------------------");

    socket.on("data", console.log);
  };

  listen() {
    this.net.listen("2222");
  }
}
