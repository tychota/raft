import { injectable, singleton } from "tsyringe";

interface VolatileData {
  lastIndexCommitted: number;
  lastIndexProjected: number;
  logsToReplicate: { [serverId: string]: number } | null;
  logsReplicated: { [serverId: string]: number } | null;
}

@singleton()
class VolatileDataStorage {
  private data: VolatileData | null = null;

  store(data: VolatileData) {
    this.data = data;
  }

  retrieve(): VolatileData | null {
    return this.data;
  }
}

@injectable()
export class VolatileStorageController {
  // TODO: store data really
  constructor(private readonly storage: VolatileDataStorage) {}

  async store(data: VolatileData) {
    this.storage.store(data);
  }

  async retrieve(): Promise<VolatileData | null> {
    const data = this.storage.retrieve();
    return data;
  }
}
