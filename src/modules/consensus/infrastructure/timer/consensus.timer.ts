import { inject } from "tsyringe";
import { DI } from "injection";
import { IConsensusEventEmitter } from "../eventEmitter/consensus.emitter";

export interface IConsensusTimer {
  startFollowerTimeout(timeoutTime: number): void;
  restartFollowerTimeout(timeoutTime: number): void;
  clearFollowerTimeout(): void;
}

export class ConsensusTimer {
  private followerTimeout?: NodeJS.Timeout;

  constructor(@inject(DI.ConsensusEventEmitter) private readonly emitter: IConsensusEventEmitter) {}

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
