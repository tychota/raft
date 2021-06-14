import { Command, Query } from "./interface";

type PreQueryHookFn = (query: Query, metadata: { processTime: bigint }) => void;
export class PreQueryHook {
  constructor(private hook: PreQueryHookFn) {}
  execute(...args: Parameters<PreQueryHookFn>) {
    return this.hook(...args);
  }
}
type PostQueryHookFn = (query: Query, metadata: { response: any; processTime: bigint; queryTime: bigint }) => void;
export class PostQueryHook {
  constructor(private hook: PostQueryHookFn) {}
  execute(...args: Parameters<PostQueryHookFn>) {
    return this.hook(...args);
  }
}
type PreCommandHookFn = (command: Command, metadata: { processTime: bigint }) => void;
export class PreCommandHook {
  constructor(private hook: PreCommandHookFn) {}
  execute(...args: Parameters<PreCommandHookFn>) {
    return this.hook(...args);
  }
}
type PostCommandHookFn = (command: Command, metadata: { processTime: bigint; queryTime: bigint }) => void;
export class PostCommandHook {
  constructor(private hook: PostCommandHookFn) {}
  execute(...args: Parameters<PostCommandHookFn>) {
    return this.hook(...args);
  }
}
export type CQRSHook = PreQueryHook | PostQueryHook | PreCommandHook | PostCommandHook;
