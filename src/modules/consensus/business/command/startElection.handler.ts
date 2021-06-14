import { HandleCommand } from "@framework/cqrs";

import { StartElection } from "./startElection";

@HandleCommand(StartElection)
export class StartElectionHandler {
  constructor() {}

  execute(command: StartElection) {
    console.log("TADA");
  }
}
