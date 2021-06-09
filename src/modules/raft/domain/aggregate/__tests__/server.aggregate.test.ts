import "./utils";

import { logIndexV } from "../../valueObject/logIndex";
import { ServerId, serverIdV } from "../../valueObject/serverId";
import { termIndexV } from "../../valueObject/termIndex";

import { increase, ServerAggregate, ServerKind } from "../server.aggregate";

describe("ServerAggregate can be created", () => {
  it("from scratch", () => {
    // Given
    const serverId = serverIdV.check("1af0d407-d520-4fff-9312-cf6ac72521a8");
    const memberServerIds: ServerId[] = [];
    // When
    const server = ServerAggregate.fromScratch(serverId, memberServerIds);
    // Then
    // -- kind
    expect(server).toHaveKind(ServerKind.FOLLOWER);
    expect(server).toHaveConfig(serverId, []);

    // -- persistent state
    expect(server.term).toEqual(0);
    expect(server.serverVotedFor).toEqual(null);
    // -- volatile state
    expect(server.lastIndexCommitted).toEqual(0);
    expect(server.lastIndexProjected).toEqual(0);
    expect(server.logToReplicate).toEqual(undefined);
    expect(server.logReplicated).toEqual(undefined);
  });
  it("from scratch - with multiple server", () => {
    // Given
    const serverId = serverIdV.check("1af0d407-d520-4fff-9312-cf6ac72521a8");
    const memberServerIds: ServerId[] = [
      serverIdV.check("98b5cdac-4e4d-4668-9225-f0cf2a73ff4d"),
      serverIdV.check("656f0c36-b4f2-4b3f-8b1e-edf512b7098a"),
    ];
    // When
    const server = ServerAggregate.fromScratch(serverId, memberServerIds);
    // Then
    // -- kind
    expect(server.kind).toBe("FOLLOWER");
    // -- config
    expect(server.serverId).toBe(serverId);
    expect(server.memberServerIds).toEqual([
      "98b5cdac-4e4d-4668-9225-f0cf2a73ff4d",
      "656f0c36-b4f2-4b3f-8b1e-edf512b7098a",
    ]);
    // -- persistent state
    expect(server.term).toEqual(0);
    expect(server.serverVotedFor).toEqual(null);
    // -- volatile state
    expect(server.lastIndexCommitted).toEqual(0);
    expect(server.lastIndexProjected).toEqual(0);
    expect(server.logToReplicate).toEqual(undefined);
    expect(server.logReplicated).toEqual(undefined);
  });
});

describe("ServerAggregate transition with success", () => {
  describe("from FOLLOWER kind", () => {
    describe("to CANDIDATE kind", () => {
      it("startElection() ", () => {
        // Given
        const serverId = serverIdV.check("1af0d407-d520-4fff-9312-cf6ac72521a8");
        const memberServerIds: ServerId[] = [];
        const server = ServerAggregate.fromScratch(serverId, memberServerIds);
        // When
        server.startElection();
        // Then
        // -- kind
        expect(server.kind).toBe("CANDIDATE");
        // -- config
        expect(server.serverId).toBe(serverId);
        expect(server.memberServerIds).toEqual([]);
        // -- persistent state
        expect(server.term).toBe(1);
        expect(server.serverVotedFor).toBe(serverId);
        // -- volatile state
        expect(server.lastIndexCommitted).toBe(0);
        expect(server.lastIndexProjected).toBe(0);
        expect(server.logToReplicate).toEqual(undefined);
        expect(server.logReplicated).toEqual(undefined);
      });
      it("becomeFollower() ", () => {
        // Given
        const serverId = serverIdV.check("1af0d407-d520-4fff-9312-cf6ac72521a8");
        const memberServerIds: ServerId[] = [];
        const server = ServerAggregate.fromScratch(serverId, memberServerIds);
        // When
        server.becomeFollower();
        // Then
        // -- kind
        expect(server.kind).toBe("FOLLOWER");
        // -- config
        expect(server.serverId).toBe(serverId);
        expect(server.memberServerIds).toEqual([]);
        // -- persistent state
        expect(server.term).toBe(0);
        expect(server.serverVotedFor).toBe(null);
        // -- volatile state
        expect(server.lastIndexCommitted).toBe(0);
        expect(server.lastIndexProjected).toBe(0);
        expect(server.logToReplicate).toEqual(undefined);
        expect(server.logReplicated).toEqual(undefined);
      });
    });
  });
  describe("from CANDIDATE kind", () => {
    describe("to CANDIDATE kind", () => {
      it("restartElection() ", () => {
        // Given
        const serverId = serverIdV.check("1af0d407-d520-4fff-9312-cf6ac72521a8");
        const memberServerIds: ServerId[] = [];
        const server = ServerAggregate.fromScratch(serverId, memberServerIds);
        server.startElection();
        // When
        server.restartElection();
        // Then
        // -- kind
        expect(server.kind).toBe("CANDIDATE");
        // -- config
        expect(server.serverId).toBe(serverId);
        expect(server.memberServerIds).toEqual([]);
        // -- persistent state
        expect(server.term).toBe(2);
        expect(server.serverVotedFor).toBe(serverId);
        // -- volatile state
        expect(server.lastIndexCommitted).toBe(0);
        expect(server.lastIndexProjected).toBe(0);
        expect(server.logToReplicate).toEqual(undefined);
        expect(server.logReplicated).toEqual(undefined);
      });
    });
    describe("to FOLLOWER kind", () => {
      it("cancelElection() ", () => {
        // Given
        const serverId = serverIdV.check("1af0d407-d520-4fff-9312-cf6ac72521a8");
        const memberServerIds: ServerId[] = [];
        const server = ServerAggregate.fromScratch(serverId, memberServerIds);
        server.startElection();
        // When
        server.cancelElection();
        // Then
        // -- kind
        expect(server.kind).toBe("FOLLOWER");
        // -- config
        expect(server.serverId).toBe(serverId);
        expect(server.memberServerIds).toEqual([]);
        // -- persistent state
        expect(server.term).toBe(1);
        expect(server.serverVotedFor).toBe(null);
        // -- volatile state
        expect(server.lastIndexCommitted).toBe(0);
        expect(server.lastIndexProjected).toBe(0);
        expect(server.logToReplicate).toBe(undefined);
        expect(server.logReplicated).toBe(undefined);
      });
      it("becomeFollower() ", () => {
        // Given
        const serverId = serverIdV.check("1af0d407-d520-4fff-9312-cf6ac72521a8");
        const memberServerIds: ServerId[] = [];
        const server = ServerAggregate.fromScratch(serverId, memberServerIds);
        server.startElection();
        // When
        server.becomeFollower();
        // Then
        // -- kind
        expect(server.kind).toBe("FOLLOWER");
        // -- config
        expect(server.serverId).toBe(serverId);
        expect(server.memberServerIds).toEqual([]);
        // -- persistent state
        expect(server.term).toBe(1);
        expect(server.serverVotedFor).toBe(null);
        // -- volatile state
        expect(server.lastIndexCommitted).toBe(0);
        expect(server.lastIndexProjected).toBe(0);
        expect(server.logToReplicate).toBe(undefined);
        expect(server.logReplicated).toBe(undefined);
      });
    });
    describe("to LEADER kind", () => {
      it("winElection() ", () => {
        // Given
        const serverId = serverIdV.check("1af0d407-d520-4fff-9312-cf6ac72521a8");
        const memberServerIds: ServerId[] = [];
        const server = ServerAggregate.fromScratch(serverId, memberServerIds);
        server.startElection();
        // When
        server.winElection();
        // Then
        // -- kind
        expect(server.kind).toBe("LEADER");
        // -- config
        expect(server.serverId).toBe(serverId);
        expect(server.memberServerIds).toEqual([]);
        // -- persistent state
        expect(server.term).toBe(1);
        expect(server.serverVotedFor).toBe(serverId);
        // -- volatile state
        expect(server.lastIndexCommitted).toBe(0);
        expect(server.lastIndexProjected).toBe(0);
        expect(server.logToReplicate).toEqual({});
        expect(server.logReplicated).toEqual({});
      });
    });
  });
  describe("from LEADER kind", () => {
    describe("to FOLLOWER kind", () => {
      it("looseLeadership() ", () => {
        // Given
        const serverId = serverIdV.check("1af0d407-d520-4fff-9312-cf6ac72521a8");
        const memberServerIds: ServerId[] = [];
        const server = ServerAggregate.fromScratch(serverId, memberServerIds);
        server.startElection();
        server.winElection();
        // When
        server.looseLeadership();
        // Then
        // -- kind
        expect(server.kind).toBe("FOLLOWER");
        // -- config
        expect(server.serverId).toBe(serverId);
        expect(server.memberServerIds).toEqual([]);
        // -- persistent state
        expect(server.term).toBe(1);
        expect(server.serverVotedFor).toBe(serverId);
        // -- volatile state
        expect(server.lastIndexCommitted).toBe(0);
        expect(server.lastIndexProjected).toBe(0);
        expect(server.logToReplicate).toBe(undefined);
        expect(server.logReplicated).toBe(undefined);
      });
      it("becomeFollower() ", () => {
        // Given
        const serverId = serverIdV.check("1af0d407-d520-4fff-9312-cf6ac72521a8");
        const memberServerIds: ServerId[] = [];
        const server = ServerAggregate.fromScratch(serverId, memberServerIds);
        server.startElection();
        server.winElection();
        // When
        server.becomeFollower();
        // Then
        // -- kind
        expect(server.kind).toBe("FOLLOWER");
        // -- config
        expect(server.serverId).toBe(serverId);
        expect(server.memberServerIds).toEqual([]);
        // -- persistent state
        expect(server.term).toBe(1);
        expect(server.serverVotedFor).toBe(serverId);
        // -- volatile state
        expect(server.lastIndexCommitted).toBe(0);
        expect(server.lastIndexProjected).toBe(0);
        expect(server.logToReplicate).toBe(undefined);
        expect(server.logReplicated).toBe(undefined);
      });
    });
  });
});
describe("ServerAggregate prevents erroneous transitions", () => {
  describe("from FOLLOWER kind", () => {
    describe("from CANDIDATE kind", () => {
      it("with winElection() expecting original CANDIDATE kind", () => {
        // Given
        const serverId = serverIdV.check("1af0d407-d520-4fff-9312-cf6ac72521a8");
        const memberServerIds: ServerId[] = [];
        const server = ServerAggregate.fromScratch(serverId, memberServerIds);
        // When
        const action = () => server.winElection();
        // Then
        // -- kind
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
