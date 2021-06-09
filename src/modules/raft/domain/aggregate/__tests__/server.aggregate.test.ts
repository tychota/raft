import "./utils";

import { logIndexV } from "../../valueObject/logIndex";
import { ServerId, serverIdV } from "../../valueObject/serverId";
import { termIndexV } from "../../valueObject/termIndex";

import { increase, ServerAggregate, ServerKind } from "../server.aggregate";

const fixtures = {
  SERVER_A: serverIdV.check("1af0d407-d520-4fff-9312-cf6ac72521a8"),
  SERVER_B: serverIdV.check("284fea2d-e7ad-4f7e-8a4e-c111f51420b7"),
  SERVER_C: serverIdV.check("3051168d-646e-45e1-ba71-d8b8f00f01b1"),
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

const generateFollowerServer = () => {
  const server = ServerAggregate.fromScratch(fixtures.SERVER_A, [fixtures.SERVER_B, fixtures.SERVER_C]);
  return server;
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
        const server = generateFollowerServer();
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
        const server = generateFollowerServer();
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
        const server = generateFollowerServer();
        server.startElection();
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
        const server = generateFollowerServer();
        server.startElection();
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
        const server = generateFollowerServer();
        server.startElection();
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
        const server = generateFollowerServer();
        server.startElection();
        // When
        server.winElection();
        // Then
        expect(server).toBeARaftServerOfKind(ServerKind.LEADER);
        expect(server).toHaveVotedRaftServer(constants.NO_SERVER);
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
        const server = generateFollowerServer();
        server.startElection();
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
        const server = generateFollowerServer();
        server.startElection();
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
    describe("from CANDIDATE kind", () => {
      it("with winElection() expecting original CANDIDATE kind", () => {
        // Given
        const server = generateFollowerServer();
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

      // -- server
      const serverId = serverIdV.check("1af0d407-d520-4fff-9312-cf6ac72521a8");
      const memberServerIds: ServerId[] = [];
      const server = ServerAggregate.fromScratch(serverId, memberServerIds);

      // -- candidate
      const candidateTerm = termIndexV.check(2);
      const candidateId = serverIdV.check("e84fea2d-e7ad-4f7e-8a4e-c111f51420b7");
      const candidateLastLogIndex = logIndexV.check(1);
      const candidateLastLogTerm = termIndexV.check(1);

      // When
      const response = server.requestVote(candidateTerm, candidateId, candidateLastLogIndex, candidateLastLogTerm);

      // Then

      // -- state: kind
      expect(server.kind).toBe("FOLLOWER");
      // -- state: config
      expect(server.serverId).toBe(serverId);
      expect(server.memberServerIds).toEqual([]);
      // -- state: persistent state
      expect(server.term).toBe(2);
      expect(server.serverVotedFor).toBe(null);
      // -- state: volatile state
      expect(server.lastIndexCommitted).toBe(0);
      expect(server.lastIndexProjected).toBe(0);
      expect(server.logToReplicate).toBe(undefined);
      expect(server.logReplicated).toBe(undefined);

      // -- response
      expect(response.term).toBe(2);
      expect(response.voteGranted).toBe(false);
    });
    it("when candidateTerm < currentTerm ", () => {
      // Given

      // -- server
      const serverId = serverIdV.check("1af0d407-d520-4fff-9312-cf6ac72521a8");
      const memberServerIds: ServerId[] = [];
      const server = ServerAggregate.fromScratch(serverId, memberServerIds);
      server.startElection();
      server.cancelElection();

      // -- candidate
      const candidateTerm = termIndexV.check(0);
      const candidateId = serverIdV.check("e84fea2d-e7ad-4f7e-8a4e-c111f51420b7");
      const candidateLastLogIndex = logIndexV.check(0);
      const candidateLastLogTerm = termIndexV.check(0);

      // When
      const response = server.requestVote(candidateTerm, candidateId, candidateLastLogIndex, candidateLastLogTerm);

      // Then

      // -- state: kind
      expect(server.kind).toBe("FOLLOWER");
      // -- state: config
      expect(server.serverId).toBe(serverId);
      expect(server.memberServerIds).toEqual([]);
      // -- state: persistent state
      expect(server.term).toBe(1);
      expect(server.serverVotedFor).toBe(null);
      // -- state: volatile state
      expect(server.lastIndexCommitted).toBe(0);
      expect(server.lastIndexProjected).toBe(0);
      expect(server.logToReplicate).toBe(undefined);
      expect(server.logReplicated).toBe(undefined);

      // -- response
      expect(response.term).toBe(1);
      expect(response.voteGranted).toBe(false);
    });
    it("when candidateTerm ==== currentTerm & candidateLastTermIndex > currentTerm & candidateLastLogIndex > lastLogIndex", () => {
      // Given

      // -- server
      const serverId = serverIdV.check("1af0d407-d520-4fff-9312-cf6ac72521a8");
      const memberServerIds: ServerId[] = [];
      const server = ServerAggregate.fromScratch(serverId, memberServerIds);
      server.startElection();
      server.cancelElection();

      // -- candidate
      const candidateTerm = termIndexV.check(1);
      const candidateId = serverIdV.check("e84fea2d-e7ad-4f7e-8a4e-c111f51420b7");
      const candidateLastLogIndex = logIndexV.check(1);
      const candidateLastLogTerm = termIndexV.check(1);

      // When
      const response = server.requestVote(candidateTerm, candidateId, candidateLastLogIndex, candidateLastLogTerm);

      // Then

      // -- state: kind
      expect(server.kind).toBe("FOLLOWER");
      // -- state: config
      expect(server.serverId).toBe(serverId);
      expect(server.memberServerIds).toEqual([]);
      // -- state: persistent state
      expect(server.term).toBe(1);
      expect(server.serverVotedFor).toBe(null);
      // -- state: volatile state
      expect(server.lastIndexCommitted).toBe(0);
      expect(server.lastIndexProjected).toBe(0);
      expect(server.logToReplicate).toBe(undefined);
      expect(server.logReplicated).toBe(undefined);

      // -- response
      expect(response.term).toBe(1);
      expect(response.voteGranted).toBe(true);
    });
    it("when candidateTerm ==== currentTerm & candidateLastLogIndex === lastLogIndex", () => {
      // Given

      // -- server
      const serverId = serverIdV.check("1af0d407-d520-4fff-9312-cf6ac72521a8");
      const memberServerIds: ServerId[] = [];
      const server = ServerAggregate.fromScratch(serverId, memberServerIds);
      server.startElection();
      server.cancelElection();

      // -- candidate
      const candidateTerm = termIndexV.check(1);
      const candidateId = serverIdV.check("e84fea2d-e7ad-4f7e-8a4e-c111f51420b7");
      const candidateLastLogIndex = logIndexV.check(1);
      const candidateLastLogTerm = termIndexV.check(1);

      // When
      const response = server.requestVote(candidateTerm, candidateId, candidateLastLogIndex, candidateLastLogTerm);

      // Then

      // -- state: kind
      expect(server.kind).toBe("FOLLOWER");
      // -- state: config
      expect(server.serverId).toBe(serverId);
      expect(server.memberServerIds).toEqual([]);
      // -- state: persistent state
      expect(server.term).toBe(1);
      expect(server.serverVotedFor).toBe(null);
      // -- state: volatile state
      expect(server.lastIndexCommitted).toBe(0);
      expect(server.lastIndexProjected).toBe(0);
      expect(server.logToReplicate).toBe(undefined);
      expect(server.logReplicated).toBe(undefined);

      // -- response
      expect(response.term).toBe(1);
      expect(response.voteGranted).toBe(true);
    });
    it("when candidateTerm ==== currentTerm & when candidateLastLogIndex < lastLogIndex", () => {
      // Given

      // -- server
      const serverId = serverIdV.check("1af0d407-d520-4fff-9312-cf6ac72521a8");
      const memberServerIds: ServerId[] = [];
      const server = ServerAggregate.fromScratch(serverId, memberServerIds);
      server.startElection();
      server.cancelElection();
      server.lastIndexCommitted = increase(server.lastIndexCommitted);

      // -- candidate
      const candidateTerm = termIndexV.check(1);
      const candidateId = serverIdV.check("e84fea2d-e7ad-4f7e-8a4e-c111f51420b7");
      const candidateLastLogIndex = logIndexV.check(1);
      const candidateLastLogTerm = termIndexV.check(1);

      // When
      const response = server.requestVote(candidateTerm, candidateId, candidateLastLogIndex, candidateLastLogTerm);

      // Then

      // -- state: kind
      expect(server.kind).toBe("FOLLOWER");
      // -- state: config
      expect(server.serverId).toBe(serverId);
      expect(server.memberServerIds).toEqual([]);
      // -- state: persistent state
      expect(server.term).toBe(1);
      expect(server.serverVotedFor).toBe(null);
      // -- state: volatile state
      expect(server.lastIndexCommitted).toBe(1);
      expect(server.lastIndexProjected).toBe(0);
      expect(server.logToReplicate).toBe(undefined);
      expect(server.logReplicated).toBe(undefined);

      // -- response
      expect(response.term).toBe(1);
      expect(response.voteGranted).toBe(true);
    });
  });
  it("as candidate - when candidateTerm < currentTerm ", () => {
    // Given

    // -- server
    const serverId = serverIdV.check("1af0d407-d520-4fff-9312-cf6ac72521a8");
    const memberServerIds: ServerId[] = [];
    const server = ServerAggregate.fromScratch(serverId, memberServerIds);
    server.startElection();
    server.lastIndexCommitted = increase(server.lastIndexCommitted);

    // -- candidate
    const candidateTerm = termIndexV.check(1);
    const candidateId = serverIdV.check("e84fea2d-e7ad-4f7e-8a4e-c111f51420b7");
    const candidateLastLogIndex = logIndexV.check(0);
    const candidateLastLogTerm = termIndexV.check(1);

    // When
    const response = server.requestVote(candidateTerm, candidateId, candidateLastLogIndex, candidateLastLogTerm);

    // Then

    // -- state: kind
    expect(server.kind).toBe("CANDIDATE");
    // -- state: config
    expect(server.serverId).toBe(serverId);
    expect(server.memberServerIds).toEqual([]);
    // -- state: persistent state
    expect(server.term).toBe(1);
    expect(server.serverVotedFor).toBe(serverId);
    // -- state: volatile state
    expect(server.lastIndexCommitted).toBe(1);
    expect(server.lastIndexProjected).toBe(0);
    expect(server.logToReplicate).toBe(undefined);
    expect(server.logReplicated).toBe(undefined);

    // -- response
    expect(response.term).toBe(1);
    expect(response.voteGranted).toBe(false);
  });
  it("as candidate - when votedFor === serverId ", () => {
    // Given

    // -- server
    const serverId = serverIdV.check("1af0d407-d520-4fff-9312-cf6ac72521a8");
    const memberServerIds: ServerId[] = [];
    const server = ServerAggregate.fromScratch(serverId, memberServerIds);
    server.startElection();
    server.lastIndexCommitted = increase(server.lastIndexCommitted);

    // -- candidate
    const candidateTerm = termIndexV.check(1);
    const candidateId = serverIdV.check("1af0d407-d520-4fff-9312-cf6ac72521a8");
    const candidateLastLogIndex = logIndexV.check(0);
    const candidateLastLogTerm = termIndexV.check(1);

    // When
    const response = server.requestVote(candidateTerm, candidateId, candidateLastLogIndex, candidateLastLogTerm);

    // Then

    // -- state: kind
    expect(server.kind).toBe("CANDIDATE");
    // -- state: config
    expect(server.serverId).toBe(serverId);
    expect(server.memberServerIds).toEqual([]);
    // -- state: persistent state
    expect(server.term).toBe(1);
    expect(server.serverVotedFor).toBe(serverId);
    // -- state: volatile state
    expect(server.lastIndexCommitted).toBe(1);
    expect(server.lastIndexProjected).toBe(0);
    expect(server.logToReplicate).toBe(undefined);
    expect(server.logReplicated).toBe(undefined);

    // -- response
    expect(response.term).toBe(1);
    expect(response.voteGranted).toBe(true);
  });
  it("as candidate - when candidateTerm > currentTerm - when candidateLastLogTerm > lastIndexCommitted", () => {
    // Given

    // -- server
    const serverId = serverIdV.check("1af0d407-d520-4fff-9312-cf6ac72521a8");
    const memberServerIds: ServerId[] = [];
    const server = ServerAggregate.fromScratch(serverId, memberServerIds);
    server.startElection();

    // -- candidate
    const candidateTerm = termIndexV.check(2);
    const candidateId = serverIdV.check("e84fea2d-e7ad-4f7e-8a4e-c111f51420b7");
    const candidateLastLogIndex = logIndexV.check(0);
    const candidateLastLogTerm = termIndexV.check(2);

    // When
    const response = server.requestVote(candidateTerm, candidateId, candidateLastLogIndex, candidateLastLogTerm);

    // Then

    // -- state: kind
    expect(server.kind).toBe("FOLLOWER");
    // -- state: config
    expect(server.serverId).toBe(serverId);
    expect(server.memberServerIds).toEqual([]);
    // -- state: persistent state
    expect(server.term).toBe(2);
    expect(server.serverVotedFor).toBe(null);
    // -- state: volatile state
    expect(server.lastIndexCommitted).toBe(0);
    expect(server.lastIndexProjected).toBe(0);
    expect(server.logToReplicate).toBe(undefined);
    expect(server.logReplicated).toBe(undefined);

    // -- response
    expect(response.term).toBe(2);
    expect(response.voteGranted).toBe(false);
  });
  it("as candidate - when candidateTerm > currentTerm - when candidateLastLogTerm > lastIndexCommitted", () => {
    // Given

    // -- server
    const serverId = serverIdV.check("1af0d407-d520-4fff-9312-cf6ac72521a8");
    const memberServerIds: ServerId[] = [];
    const server = ServerAggregate.fromScratch(serverId, memberServerIds);
    server.startElection();

    // -- candidate
    const candidateTerm = termIndexV.check(2);
    const candidateId = serverIdV.check("e84fea2d-e7ad-4f7e-8a4e-c111f51420b7");
    const candidateLastLogIndex = logIndexV.check(1);
    const candidateLastLogTerm = termIndexV.check(2);

    // When
    const response = server.requestVote(candidateTerm, candidateId, candidateLastLogIndex, candidateLastLogTerm);

    // Then

    // -- state: kind
    expect(server.kind).toBe("FOLLOWER");
    // -- state: config
    expect(server.serverId).toBe(serverId);
    expect(server.memberServerIds).toEqual([]);
    // -- state: persistent state
    expect(server.term).toBe(2);
    expect(server.serverVotedFor).toBe(null);
    // -- state: volatile state
    expect(server.lastIndexCommitted).toBe(0);
    expect(server.lastIndexProjected).toBe(0);
    expect(server.logToReplicate).toBe(undefined);
    expect(server.logReplicated).toBe(undefined);

    // -- response
    expect(response.term).toBe(2);
    expect(response.voteGranted).toBe(false);
  });
  it("as candidate - when candidateTerm < currentTerm ", () => {
    // Given

    // -- server
    const serverId = serverIdV.check("1af0d407-d520-4fff-9312-cf6ac72521a8");
    const memberServerIds: ServerId[] = [];
    const server = ServerAggregate.fromScratch(serverId, memberServerIds);
    server.startElection();
    server.cancelElection();

    // -- candidate
    const candidateTerm = termIndexV.check(0);
    const candidateId = serverIdV.check("e84fea2d-e7ad-4f7e-8a4e-c111f51420b7");
    const candidateLastLogIndex = logIndexV.check(0);
    const candidateLastLogTerm = termIndexV.check(0);

    // When
    const response = server.requestVote(candidateTerm, candidateId, candidateLastLogIndex, candidateLastLogTerm);

    // Then

    // -- state: kind
    expect(server.kind).toBe("FOLLOWER");
    // -- state: config
    expect(server.serverId).toBe(serverId);
    expect(server.memberServerIds).toEqual([]);
    // -- state: persistent state
    expect(server.term).toBe(1);
    expect(server.serverVotedFor).toBe(null);
    // -- state: volatile state
    expect(server.lastIndexCommitted).toBe(0);
    expect(server.lastIndexProjected).toBe(0);
    expect(server.logToReplicate).toBe(undefined);
    expect(server.logReplicated).toBe(undefined);

    // -- response
    expect(response.term).toBe(1);
    expect(response.voteGranted).toBe(false);
  });
});
