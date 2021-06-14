import { singleton } from "tsyringe";
import { ConsensusEventEmitter } from "../eventEmitter/consensus.emitter";

@singleton()
export class ConsensusTimer {
  private followerTimeout?: NodeJS.Timeout;

  constructor(private readonly emitter: ConsensusEventEmitter) {}

  startFollowerTimeout = (timeoutTime: number) => {
    this.followerTimeout = setTimeout(() => this.emitter.emit("followerHeartbeatTimeout"), timeoutTime);
  };

  restartFollowerTimeout = (timeoutTime: number) => {
    this.followerTimeout && clearTimeout(this.followerTimeout);
    this.followerTimeout = setTimeout(() => this.emitter.emit("followerHeartbeatTimeout"), timeoutTime);
  };

  clearFollowerTimeout = () => {
    this.followerTimeout && clearTimeout(this.followerTimeout);
  };
}
