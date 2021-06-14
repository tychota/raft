import { HandleCommand } from "@framework/cqrs";

import { HandleRequestVoteRPC } from "./handleRequestVoteRPC";

@HandleCommand(HandleRequestVoteRPC)
export class HandleRequestVoteRPCHandler {
  constructor() {}

  execute(command: HandleRequestVoteRPC) {
    console.log("TADA");
  }
}
