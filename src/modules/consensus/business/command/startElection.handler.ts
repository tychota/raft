import { HandleCommand } from "@framework/cqrs";

import { StartElection } from "./startElection";

@HandleCommand(StartElection)
export class StartElectionHandler {
  constructor() {}

  async execute(command: StartElection) {
    console.log("TADA");
  }
}
