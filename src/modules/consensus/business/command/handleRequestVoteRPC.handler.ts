import { HandleCommand } from "@framework/cqrs";

import { HandleRequestVoteRPC } from "./handleRequestVoteRPC";

@HandleCommand(HandleRequestVoteRPC)
export class HandleRequestVoteRPCHandler {
  constructor() {}

  async execute(command: HandleRequestVoteRPC) {
    console.log("TADA");
  }
}
