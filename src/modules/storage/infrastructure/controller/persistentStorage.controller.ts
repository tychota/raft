import { injectable, singleton } from "tsyringe";

interface PersistentData {
  kind: string;
  id: string;
  peers: string[];
  term: number;
  serverVotedFor: string | null;
  logs: { term: number; command: string }[];
}

@singleton()
class PersistentDataStorage {
  private data: PersistentData | null = null;

  store(data: PersistentData) {
    this.data = data;
  }

  retrieve(): PersistentData | null {
    return this.data;
  }
}

@injectable()
export class PersistentStorageController {
  // TODO: store data really
  constructor(private readonly storage: PersistentDataStorage) {}

  async store(data: PersistentData) {
    this.storage.store(data);
  }

  async retrieve(): Promise<PersistentData | null> {
    const data = this.storage.retrieve();
    return data;
  }
}
