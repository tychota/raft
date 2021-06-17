import "./utils/matchers";

import { logIndexV } from "../../valueObject/logIndex";
import { ServerId, serverIdV } from "../../valueObject/serverId";
import { termIndexV } from "../../valueObject/termIndex";

import { ServerAggregate, ServerKind } from "../server.aggregate";

type ServerAction = "INIT_AS_FOLLOWER" | "START_ELECTION" | "WIN_ELECTION" | "CANCEL_ELECTION" | "RESTART_ELECTION" | "LOOSE_LEADERSHIP" | "ADD_LOG";

const applyAction = (server: ServerAggregate, action: ServerAction, actionIndex: number) => {
  switch (action) {
    case "INIT_AS_FOLLOWER":
      break;
    case "START_ELECTION":
      server.startElection();
      break;
    case "WIN_ELECTION":
      server.winElection();
      break;
    case "CANCEL_ELECTION":
      server.cancelElection();
      break;
    case "RESTART_ELECTION":
      server.restartElection();
      break;
    case "LOOSE_LEADERSHIP":
      server.looseLeadership();
      break;
  }
};

const fixtures = {
  SERVER_A: serverIdV.check("1af0d407-d520-4fff-9312-cf6ac72521a8"),
  SERVER_B: serverIdV.check("284fea2d-e7ad-4f7e-8a4e-c111f51420b7"),
  SERVER_C: serverIdV.check("3051168d-646e-45e1-ba71-d8b8f00f01b1"),

  generateServerA: (...actions: ServerAction[]) => {
    const server = ServerAggregate.fromScratch(fixtures.SERVER_A, [fixtures.SERVER_B, fixtures.SERVER_C]);
    actions.forEach((action, index) => applyAction(server, action, index));
    return server;
  },
  generateServerB: (...actions: ServerAction[]) => {
    const server = ServerAggregate.fromScratch(fixtures.SERVER_B, [fixtures.SERVER_A, fixtures.SERVER_C]);
    actions.forEach((action, index) => applyAction(server, action, index));
    return server;
  },
  generateServerC: (...actions: ServerAction[]) => {
    const server = ServerAggregate.fromScratch(fixtures.SERVER_C, [fixtures.SERVER_B, fixtures.SERVER_A]);
    actions.forEach((action, index) => applyAction(server, action, index));
    return server;
  },
};

const constants = {
  NO_SERVER: null,

  TERM_0: termIndexV.check(0),
  TERM_1: termIndexV.check(1),
  TERM_2: termIndexV.check(2),

  LOG_0: logIndexV.check(0),
  LOG_1: logIndexV.check(1),
  LOG_2: logIndexV.check(2),
};

describe("ServerAggregate can be created", () => {
  it("from scratch", () => {
    // Given
    const serverId = fixtures.SERVER_A;
    const memberServerIds: ServerId[] = [];
    // When
    const server = ServerAggregate.fromScratch(serverId, memberServerIds);
    // Then
    expect(server).toBeARaftServerOfKind(ServerKind.FOLLOWER);
    expect(server).toHaveVotedRaftServer(constants.NO_SERVER);
    expect(server).toHaveRaftPeeringConfig(serverId, memberServerIds);
    expect(server).toBeAtRaftTerm(constants.TERM_0);
    expect(server).toHaveHandledRaftLogsUntil({ committed: constants.LOG_0, projected: constants.LOG_0 });
  });
  it("from scratch - with multiple server", () => {
    const serverId = fixtures.SERVER_A;
    const memberServerIds: ServerId[] = [fixtures.SERVER_B, fixtures.SERVER_C];
    // When
    const server = ServerAggregate.fromScratch(serverId, memberServerIds);
    // Then
    expect(server).toBeARaftServerOfKind(ServerKind.FOLLOWER);
    expect(server).toHaveVotedRaftServer(constants.NO_SERVER);
    expect(server).toHaveRaftPeeringConfig(serverId, memberServerIds);
    expect(server).toBeAtRaftTerm(constants.TERM_0);
    expect(server).toHaveHandledRaftLogsUntil({ committed: constants.LOG_0, projected: constants.LOG_0 });
  });
});

describe("ServerAggregate transition with success", () => {
  describe("from FOLLOWER kind", () => {
    describe("to CANDIDATE kind", () => {
      it("startElection() ", () => {
        // Given
        const server = fixtures.generateServerA("INIT_AS_FOLLOWER");
        // When
        server.startElection();
        // Then
        expect(server).toBeARaftServerOfKind(ServerKind.CANDIDATE);
        expect(server).toHaveVotedRaftServer(fixtures.SERVER_A);
        expect(server).toHaveRaftPeeringConfig(fixtures.SERVER_A, [fixtures.SERVER_B, fixtures.SERVER_C]);
        expect(server).toBeAtRaftTerm(constants.TERM_1);
        expect(server).toHaveHandledRaftLogsUntil({ committed: constants.LOG_0, projected: constants.LOG_0 });
      });
      it("becomeFollower() ", () => {
        // Given
        const server = fixtures.generateServerA("INIT_AS_FOLLOWER");
        // When
        server.becomeFollower();
        // Then
        expect(server).toBeARaftServerOfKind(ServerKind.FOLLOWER);
        expect(server).toHaveVotedRaftServer(constants.NO_SERVER);
        expect(server).toHaveRaftPeeringConfig(fixtures.SERVER_A, [fixtures.SERVER_B, fixtures.SERVER_C]);
        expect(server).toBeAtRaftTerm(constants.TERM_0);
        expect(server).toHaveHandledRaftLogsUntil({ committed: constants.LOG_0, projected: constants.LOG_0 });
      });
    });
  });
  describe("from CANDIDATE kind", () => {
    describe("to CANDIDATE kind", () => {
      it("restartElection() ", () => {
        // Given
        const server = fixtures.generateServerA("INIT_AS_FOLLOWER", "START_ELECTION");
        // When
        server.restartElection();
        // Then
        expect(server).toBeARaftServerOfKind(ServerKind.CANDIDATE);
        expect(server).toHaveVotedRaftServer(fixtures.SERVER_A);
        expect(server).toHaveRaftPeeringConfig(fixtures.SERVER_A, [fixtures.SERVER_B, fixtures.SERVER_C]);
        expect(server).toBeAtRaftTerm(constants.TERM_2);
        expect(server).toHaveHandledRaftLogsUntil({ committed: constants.LOG_0, projected: constants.LOG_0 });
      });
    });
    describe("to FOLLOWER kind", () => {
      it("cancelElection() ", () => {
        // Given
        const server = fixtures.generateServerA("INIT_AS_FOLLOWER", "START_ELECTION");
        // When
        server.cancelElection();
        // Then
        expect(server).toBeARaftServerOfKind(ServerKind.FOLLOWER);
        expect(server).toHaveVotedRaftServer(constants.NO_SERVER);
        expect(server).toHaveRaftPeeringConfig(fixtures.SERVER_A, [fixtures.SERVER_B, fixtures.SERVER_C]);
        expect(server).toBeAtRaftTerm(constants.TERM_1);
        expect(server).toHaveHandledRaftLogsUntil({ committed: constants.LOG_0, projected: constants.LOG_0 });
      });
      it("becomeFollower() ", () => {
        // Given
        const server = fixtures.generateServerA("INIT_AS_FOLLOWER", "START_ELECTION");
        // When
        server.becomeFollower();
        // Then
        expect(server).toBeARaftServerOfKind(ServerKind.FOLLOWER);
        expect(server).toHaveVotedRaftServer(constants.NO_SERVER);
        expect(server).toHaveRaftPeeringConfig(fixtures.SERVER_A, [fixtures.SERVER_B, fixtures.SERVER_C]);
        expect(server).toBeAtRaftTerm(constants.TERM_1);
        expect(server).toHaveHandledRaftLogsUntil({ committed: constants.LOG_0, projected: constants.LOG_0 });
      });
    });
    describe("to LEADER kind", () => {
      it("winElection() ", () => {
        // Given
        const server = fixtures.generateServerA("INIT_AS_FOLLOWER", "START_ELECTION");
        // When
        server.winElection();
        // Then
        expect(server).toBeARaftServerOfKind(ServerKind.LEADER);
        expect(server).toHaveVotedRaftServer(fixtures.SERVER_A);
        expect(server).toHaveRaftPeeringConfig(fixtures.SERVER_A, [fixtures.SERVER_B, fixtures.SERVER_C]);
        expect(server).toBeAtRaftTerm(constants.TERM_1);
        expect(server).toHaveHandledRaftLogsUntil({ committed: constants.LOG_0, projected: constants.LOG_0 });
      });
    });
  });
  describe("from LEADER kind", () => {
    describe("to FOLLOWER kind", () => {
      it("looseLeadership() ", () => {
        // Given
        const server = fixtures.generateServerA("INIT_AS_FOLLOWER", "START_ELECTION");
        server.winElection();
        // When
        server.looseLeadership();
        // Then
        expect(server).toBeARaftServerOfKind(ServerKind.FOLLOWER);
        expect(server).toHaveVotedRaftServer(constants.NO_SERVER);
        expect(server).toHaveRaftPeeringConfig(fixtures.SERVER_A, [fixtures.SERVER_B, fixtures.SERVER_C]);
        expect(server).toBeAtRaftTerm(constants.TERM_1);
        expect(server).toHaveHandledRaftLogsUntil({ committed: constants.LOG_0, projected: constants.LOG_0 });
      });
      it("becomeFollower() ", () => {
        // Given
        const server = fixtures.generateServerA("INIT_AS_FOLLOWER", "START_ELECTION");
        server.winElection();
        // When
        server.becomeFollower();
        // Then
        expect(server).toBeARaftServerOfKind(ServerKind.FOLLOWER);
        expect(server).toHaveVotedRaftServer(constants.NO_SERVER);
        expect(server).toHaveRaftPeeringConfig(fixtures.SERVER_A, [fixtures.SERVER_B, fixtures.SERVER_C]);
        expect(server).toBeAtRaftTerm(constants.TERM_1);
        expect(server).toHaveHandledRaftLogsUntil({ committed: constants.LOG_0, projected: constants.LOG_0 });
      });
    });
  });
});
describe("ServerAggregate prevents erroneous transitions", () => {
  describe("from FOLLOWER kind", () => {
    describe("to LEADER kind", () => {
      it("with winElection()", () => {
        // Given
        const server = fixtures.generateServerA("INIT_AS_FOLLOWER");
        // When
        const action = () => server.winElection();
        // Then
        expect(action).toThrow();
      });
    });
  });
});

describe("ServerAggregate can respond to RequestVote RPC", () => {
  describe("as follower", () => {
    it("when candidateTerm > currentTerm ", () => {
      // Given
      const server = fixtures.generateServerA("INIT_AS_FOLLOWER");
      const otherServer = fixtures.generateServerB("INIT_AS_FOLLOWER", "START_ELECTION");

      // When
      const response = server.requestVote(otherServer.term, otherServer.id, constants.LOG_1, constants.TERM_1);

      // Then
      // --- server
      expect(server).toBeARaftServerOfKind(ServerKind.FOLLOWER);
      expect(server).toHaveVotedRaftServer(constants.NO_SERVER);
      expect(server).toHaveRaftPeeringConfig(fixtures.SERVER_A, [fixtures.SERVER_B, fixtures.SERVER_C]);
      expect(server).toBeAtRaftTerm(constants.TERM_1);
      expect(server).toHaveHandledRaftLogsUntil({ committed: constants.LOG_0, projected: constants.LOG_0 });
      // --- response
      expect(response).toEqual({ term: constants.TERM_1, voteGranted: false });
    });
    it("when candidateTerm < currentTerm ", () => {
      // Given
      const server = fixtures.generateServerA("INIT_AS_FOLLOWER", "START_ELECTION", "RESTART_ELECTION", "CANCEL_ELECTION");
      const otherServer = fixtures.generateServerB("INIT_AS_FOLLOWER", "START_ELECTION");

      // When
      const response = server.requestVote(otherServer.term, otherServer.id, constants.LOG_1, constants.TERM_1);

      // Then
      // --- server
      expect(server).toBeARaftServerOfKind(ServerKind.FOLLOWER);
      expect(server).toHaveVotedRaftServer(constants.NO_SERVER);
      expect(server).toHaveRaftPeeringConfig(fixtures.SERVER_A, [fixtures.SERVER_B, fixtures.SERVER_C]);
      expect(server).toBeAtRaftTerm(constants.TERM_2);
      expect(server).toHaveHandledRaftLogsUntil({ committed: constants.LOG_0, projected: constants.LOG_0 });
      // --- response
      expect(response).toEqual({ term: constants.TERM_2, voteGranted: false });
    });
    it("when candidateTerm == currentTerm", () => {
      // Given
      const server = fixtures.generateServerA("INIT_AS_FOLLOWER", "START_ELECTION", "CANCEL_ELECTION");
      const otherServer = fixtures.generateServerB("INIT_AS_FOLLOWER", "START_ELECTION");

      // When
      const response = server.requestVote(otherServer.term, otherServer.id, constants.LOG_1, constants.TERM_1);

      // Then
      // --- server
      expect(server).toBeARaftServerOfKind(ServerKind.FOLLOWER);
      expect(server).toHaveVotedRaftServer(constants.NO_SERVER);
      expect(server).toHaveRaftPeeringConfig(fixtures.SERVER_A, [fixtures.SERVER_B, fixtures.SERVER_C]);
      expect(server).toBeAtRaftTerm(constants.TERM_1);
      expect(server).toHaveHandledRaftLogsUntil({ committed: constants.LOG_0, projected: constants.LOG_0 });
      // --- response
      expect(response).toEqual({ term: constants.TERM_1, voteGranted: true });
    });
  });
  describe("as candidate", () => {
    it("when candidateTerm > currentTerm ", () => {
      // Given
      const server = fixtures.generateServerA("INIT_AS_FOLLOWER", "START_ELECTION");
      const otherServer = fixtures.generateServerB("INIT_AS_FOLLOWER", "START_ELECTION", "RESTART_ELECTION");

      // When
      const response = server.requestVote(otherServer.term, otherServer.id, constants.LOG_1, constants.TERM_1);

      // Then
      // --- server
      expect(server).toBeARaftServerOfKind(ServerKind.FOLLOWER);
      expect(server).toHaveVotedRaftServer(constants.NO_SERVER);
      expect(server).toHaveRaftPeeringConfig(fixtures.SERVER_A, [fixtures.SERVER_B, fixtures.SERVER_C]);
      expect(server).toBeAtRaftTerm(constants.TERM_2);
      expect(server).toHaveHandledRaftLogsUntil({ committed: constants.LOG_0, projected: constants.LOG_0 });
      // --- response
      expect(response).toEqual({ term: constants.TERM_2, voteGranted: false });
    });
    it("when candidateTerm < currentTerm ", () => {
      // Given
      const server = fixtures.generateServerA("INIT_AS_FOLLOWER", "START_ELECTION", "RESTART_ELECTION");
      const otherServer = fixtures.generateServerB("INIT_AS_FOLLOWER", "START_ELECTION");

      // When
      const response = server.requestVote(otherServer.term, otherServer.id, constants.LOG_1, constants.TERM_1);

      // Then
      // --- server
      expect(server).toBeARaftServerOfKind(ServerKind.CANDIDATE);
      expect(server).toHaveVotedRaftServer(fixtures.SERVER_A);
      expect(server).toHaveRaftPeeringConfig(fixtures.SERVER_A, [fixtures.SERVER_B, fixtures.SERVER_C]);
      expect(server).toBeAtRaftTerm(constants.TERM_2);
      expect(server).toHaveHandledRaftLogsUntil({ committed: constants.LOG_0, projected: constants.LOG_0 });
      // --- response
      expect(response).toEqual({ term: constants.TERM_2, voteGranted: false });
    });
    it("when candidateTerm == currentTerm", () => {
      // Given
      const server = fixtures.generateServerA("INIT_AS_FOLLOWER", "START_ELECTION");
      const otherServer = fixtures.generateServerB("INIT_AS_FOLLOWER", "START_ELECTION");

      // When
      const response = server.requestVote(otherServer.term, otherServer.id, constants.LOG_1, constants.TERM_1);

      // Then
      // --- server
      expect(server).toBeARaftServerOfKind(ServerKind.CANDIDATE);
      expect(server).toHaveVotedRaftServer(fixtures.SERVER_A);
      expect(server).toHaveRaftPeeringConfig(fixtures.SERVER_A, [fixtures.SERVER_B, fixtures.SERVER_C]);
      expect(server).toBeAtRaftTerm(constants.TERM_1);
      expect(server).toHaveHandledRaftLogsUntil({ committed: constants.LOG_0, projected: constants.LOG_0 });
      // --- response
      expect(response).toEqual({ term: constants.TERM_1, voteGranted: false });
    });
    describe("between same server", () => {
      // Given
      const server = fixtures.generateServerA("INIT_AS_FOLLOWER", "START_ELECTION");
      const otherServer = fixtures.generateServerA("INIT_AS_FOLLOWER", "START_ELECTION");

      // When
      const response = server.requestVote(otherServer.term, otherServer.id, constants.LOG_1, constants.TERM_1);

      // Then
      // --- server
      expect(server).toBeARaftServerOfKind(ServerKind.CANDIDATE);
      expect(server).toHaveVotedRaftServer(fixtures.SERVER_A);
      expect(server).toHaveRaftPeeringConfig(fixtures.SERVER_A, [fixtures.SERVER_B, fixtures.SERVER_C]);
      expect(server).toBeAtRaftTerm(constants.TERM_1);
      expect(server).toHaveHandledRaftLogsUntil({ committed: constants.LOG_0, projected: constants.LOG_0 });
      // --- response
      expect(response).toEqual({ term: constants.TERM_1, voteGranted: true });
    });
  });
});
