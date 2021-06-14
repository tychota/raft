import { registerCommandHandler } from "@framework/cqrs";


import { HandleRequestVoteRPCHandler } from "@consensus/business/handleRequestVoteRPC.handler";
registerCommandHandler(HandleRequestVoteRPCHandler);

import { StartElectionHandler } from "@consensus/business/startElection.handler";
registerCommandHandler(StartElectionHandler);

import { StartFollowerHeartbeatHandler } from "@consensus/business/startFollowerHeartbeat.handler";
registerCommandHandler(StartFollowerHeartbeatHandler);
