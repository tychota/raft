import * as r from "runtypes";
import { serverIdV } from "./serverId";

export const peersV = r.Array(serverIdV);
export type Peers = r.Static<typeof peersV>;
