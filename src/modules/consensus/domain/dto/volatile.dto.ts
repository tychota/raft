export interface VolatileDto {
  lastIndexCommitted: number;
  lastIndexProjected: number;
  logsToReplicate: { [serverId: string]: number } | null;
  logsReplicated: { [serverId: string]: number } | null;
}
