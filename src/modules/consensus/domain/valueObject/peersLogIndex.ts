import * as r from "runtypes";
import { RuntypeBase } from "runtypes/lib/runtype";
import { logIndexV } from "./logIndex";
import { serverIdV } from "./serverId";

export const peersLogIndexes = r.Dictionary(logIndexV, serverIdV as RuntypeBase<string>);
export type PeersLogIndexes = r.Static<typeof peersLogIndexes>;
