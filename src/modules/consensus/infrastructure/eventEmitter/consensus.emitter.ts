import EventEmitter from "events";

interface ConsensusEvents {
  followerHeartbeatTimeout: () => void;
  followerHeartbeatReceived: () => void;
}

export interface IConsensusEventEmitter {
  on<U extends keyof ConsensusEvents>(event: U, listener: ConsensusEvents[U]): this;
  emit<U extends keyof ConsensusEvents>(event: U, ...args: Parameters<ConsensusEvents[U]>): boolean;
}

export class ConsensusEventEmitter extends EventEmitter implements IConsensusEventEmitter {
  constructor() {
    super();
  }
}
