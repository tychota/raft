import EventEmitter from "events";
import { singleton } from "tsyringe";

interface ConsensusEvents {
  followerHeartbeatTimeout: () => void;
  followerHeartbeatReceived: () => void;
}

export interface IConsensusEventEmitter {
  on<U extends keyof ConsensusEvents>(event: U, listener: ConsensusEvents[U]): this;
  emit<U extends keyof ConsensusEvents>(event: U, ...args: Parameters<ConsensusEvents[U]>): boolean;
}
@singleton()
export class ConsensusEventEmitter extends EventEmitter implements IConsensusEventEmitter {
  constructor() {
    super();
  }
}
