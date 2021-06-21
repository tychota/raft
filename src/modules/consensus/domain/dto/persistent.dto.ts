export interface PersistentDto {
  kind: string;
  id: string;
  peers: string[];
  term: number;
  serverVotedFor: string | null;
  logs: { term: number; command: string }[];
}
