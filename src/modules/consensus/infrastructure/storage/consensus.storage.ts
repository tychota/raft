import { injectable } from "tsyringe";

import { PersistentStorageController } from "modules/storage/infrastructure/controller/persistentStorage.controller";
import { VolatileStorageController } from "modules/storage/infrastructure/controller/volatileStorage.controller";
import { ServerAggregate } from "@consensus/domain/server.aggregate";
import { randomUUID } from "crypto";

@injectable()
export class ConsensusStorage {
  constructor(private readonly persistentStorage: PersistentStorageController, private readonly volatileStorage: VolatileStorageController) {}

  async getAggregate(): Promise<ServerAggregate> {
    let persistentData = await this.persistentStorage.retrieve();
    if (!persistentData) {
      // TODO: peers should be retrieved from config service
      // TODO: id should be from RPC or config
      persistentData = { id: randomUUID(), peers: [], kind: "FOLLOWER", term: 0, serverVotedFor: null, logs: [] };
    }

    let volatileData = await this.volatileStorage.retrieve();
    if (!volatileData) {
      // TODO: logReplicated should be build from peers
      volatileData = { lastIndexCommitted: 0, lastIndexProjected: 0, logsReplicated: null, logsToReplicate: null };
    }

    return ServerAggregate.fromStored({
      ...persistentData,
      ...volatileData,
    });
  }

  async persistAggregate(aggregate: ServerAggregate) {
    const { id, kind, lastIndexCommitted, lastIndexProjected, logs, logsReplicated, logsToReplicate, peers, serverVotedFor, term } = aggregate;
    await this.persistentStorage.store({ id, kind, logs, peers, serverVotedFor, term });
    this.volatileStorage.store({ lastIndexCommitted, lastIndexProjected, logsReplicated, logsToReplicate });
  }
}
