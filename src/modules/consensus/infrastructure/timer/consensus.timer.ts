import { singleton } from "tsyringe";
import { ConsensusEventEmitter } from "../eventEmitter/consensus.emitter";

@singleton()
export class ConsensusTimer {
  private followerHeartbeatTimeout?: NodeJS.Timeout;
  private candidateElectionTimeout?: NodeJS.Timeout;

  constructor(private readonly emitter: ConsensusEventEmitter) {}

  startFollowerTimeout = (timeoutTime: number) => {
    this.followerHeartbeatTimeout = setTimeout(() => this.emitter.emit("followerHeartbeatTimeout"), timeoutTime);
  };

  restartFollowerTimeout = (timeoutTime: number) => {
    this.followerHeartbeatTimeout && clearTimeout(this.followerHeartbeatTimeout);
    this.followerHeartbeatTimeout = setTimeout(() => this.emitter.emit("followerHeartbeatTimeout"), timeoutTime);
  };

  clearFollowerTimeout = () => {
    this.followerHeartbeatTimeout && clearTimeout(this.followerHeartbeatTimeout);
  };

  waitElectionTimeout = (timeoutTime: number) => {
    return new Promise<void>((resolve, _) => {
      setTimeout(() => resolve(), timeoutTime);
    });
  };
}
