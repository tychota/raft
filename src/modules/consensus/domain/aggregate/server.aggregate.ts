/**
 * Why
 * ===
 *
 * Consensus algorithm allow a collection of machines to work as a coherent group
 * that can survive failure of some of its members.
 *
 * Consensus algorithms arise in context of replicated state machine.
 * Replicated state machine are typically implemented using a replicated log.
 * Each server store a log containing a series of command, which the state machine
 * execute in order. Each log contains the same command in the same order, so each
 * state machine computes the same state.
 *
 * Keeping the replicated log consistent is the job of the consensus algorithm.
 *
 * What
 * ===
 *
 * A raft cluster contains several servers: 5 is typical.
 *
 * At any time, each server is either:
 * - leader
 * - follower
 * - candidate
 *
 * In normal operation there one leader and all other servers are followers.
 * The third state, candidate, is used to elect an new leader.
 *
 * The transition between states can be describe by a state machine.
 *
 *                          +----+
 *                          |    |
 * +----------+          +--+----v---+        +--------+
 * | FOLLOWER +--------->| CANDIDATE +------->| LEADER |
 * +----^--^--+          +----+------+        +---+----+
 *      |  |                  |                   |
 *      +--+------------------+                   |
 *         +--------------------------------------+
 *
 * This file describe the state machine.
 *
 */

import { PersistentDto } from "../dto/persistent.dto";
import { VolatileDto } from "../dto/volatile.dto";
import { LogEntry } from "../valueObject/logEntry";
import { LogIndex, logIndexV } from "../valueObject/logIndex";
import { logsV } from "../valueObject/logs";
import { Peers, peersV } from "../valueObject/peers";
import { PeersLogIndexes, peersLogIndexes } from "../valueObject/peersLogIndex";
import { ServerId, serverIdV } from "../valueObject/serverId";
import { TermIndex, termIndexV } from "../valueObject/termIndex";

export enum ServerKind {
  "LEADER" = "LEADER",
  "CANDIDATE" = "CANDIDATE",
  "FOLLOWER" = "FOLLOWER",
}

export class ServerAggregate {
  // -----------------------
  // --- persistent kind ---
  // -----------------------

  kind: ServerKind;

  // -------------------------
  // --- persistent config ---
  // -------------------------

  /**
   * The ServerId (unique id) identifying the running server
   *
   * @type {ServerId}
   * @memberof ServerAggregate
   */
  id: ServerId;
  /**
   * The other ServerIds (unique id) identifying the other servers running in the cluster
   *
   * @type {Peers}
   * @memberof ServerAggregate
   */
  peers: Peers;

  // ------------------------
  // --- persistent state ---
  // ------------------------

  /**
   * Latest term server has seen
   * - initialized to 0 on first boot,
   * - increasing monotonically
   *
   * @type {(TermIndex)}
   * @memberof ServerAggregate
   */
  term: TermIndex;
  /**
   * ServerId for candidate that received vote in current term (or null if none)
   *
   * NOTE: in Raft paper, this is named "votedFor"
   *
   * @type {(ServerId | null)}
   * @memberof ServerAggregate
   */
  serverVotedFor: ServerId | null;

  /**
   * Logs are the append only entries received by the server
   *
   * @type {LogEntry[]}
   * @memberof ServerAggregate
   */
  logs: LogEntry[];

  // ----------------------
  // --- volatile state ---
  // ----------------------

  /**
   * Index of the highest log entry known to be committed
   * - initialized to 0
   *
   * NOTE: in Raft paper, this is named "commitIndex"
   *
   * @type {LogIndex}
   * @memberof ServerAggregate
   */
  lastIndexCommitted: LogIndex;
  /**
   * Index of the highest log entry projected to state machine
   * - initialized to 0
   *
   * NOTE: in Raft paper, this is named "lastApplied"
   *
   * @type {LogIndex}
   * @memberof ServerAggregate
   */
  lastIndexProjected: LogIndex;

  // ---------------------------------
  // --- volatile state for leader ---
  // ---------------------------------

  /**
   * For each (other) servers, index of the next log entry to send
   * - initialized to leader's last log index +1)
   *
   * NOTE: in Raft paper, this is named "nextIndex"
   *
   * @type {(PeersLogIndex | null)}
   * @memberof ServerAggregate
   */
  logsToReplicate: PeersLogIndexes | null;
  /**
   * For each (other) servers, index of highest log entry known to be replicated
   * - initialized to 0
   *
   * NOTE: in Raft paper, this is named "matchIndex"
   *
   * @type {(PeersLogIndex | null)}
   * @memberof ServerAggregate
   */
  logsReplicated: PeersLogIndexes | null;

  // -------------------------------------
  // --- constructors and initializers ---
  // -------------------------------------

  private constructor(
    serverId: ServerId,
    peers: Peers,
    term: TermIndex,
    serverVotedFor: ServerId | null,
    logs: LogEntry[],
    lastIndexCommitted: LogIndex,
    lastIndexProjected: LogIndex,
    logToReplicate: PeersLogIndexes | null = null,
    logReplicated: PeersLogIndexes | null = null
  ) {
    this.id = serverId;
    this.peers = peers;
    this.kind = ServerKind.FOLLOWER;
    this.term = term;
    this.serverVotedFor = serverVotedFor;
    this.logs = logs;
    this.lastIndexCommitted = lastIndexCommitted;
    this.lastIndexProjected = lastIndexProjected;
    this.logsToReplicate = logToReplicate;
    this.logsReplicated = logReplicated;
  }

  public static fromScratch(id: ServerId, peers: Peers) {
    const term = termIndexV.check(0);
    const serverVotedFor = null;
    const lastIndexCommitted = logIndexV.check(0);
    const lastIndexProjected = logIndexV.check(0);
    const logs: LogEntry[] = [];
    return new ServerAggregate(id, peers, term, serverVotedFor, logs, lastIndexCommitted, lastIndexProjected);
  }

  public static fromStored(data: VolatileDto & PersistentDto) {
    const id = serverIdV.check(data.id);
    const peers = peersV.check(data.peers);
    const term = termIndexV.check(data.term);
    const serverVotedFor = data.serverVotedFor === null ? null : serverIdV.check(data.serverVotedFor);
    const logs = logsV.check(data.logs);
    const lastIndexCommitted = logIndexV.check(data.lastIndexCommitted);
    const lastIndexProjected = logIndexV.check(data.lastIndexProjected);
    const logsToReplicate = data.logsToReplicate && peersLogIndexes.check(data.logsToReplicate);
    const logsReplicated = data.logsReplicated && peersLogIndexes.check(data.logsReplicated);
    return new ServerAggregate(id, peers, term, serverVotedFor, logs, lastIndexCommitted, lastIndexProjected, logsToReplicate, logsReplicated);
  }

  // ----------------------------
  // --- rules and invariants ---
  // ----------------------------

  // ($5.1)
  private isTermOutdated(externalTerm: TermIndex) {
    return this.term < externalTerm;
  }

  // ($5.1)
  private acceptNewTerm(externalTerm: TermIndex) {
    this.term = externalTerm;
    this.becomeFollower();
  }

  // ------------------
  // --- transition ---
  // ------------------

  public startElection() {
    this.transition(ServerKind.FOLLOWER, ServerKind.CANDIDATE);
    this.increaseTerm();
    this.voteForMe();
  }

  public restartElection() {
    this.transition(ServerKind.CANDIDATE, ServerKind.CANDIDATE);
    this.increaseTerm();
    this.voteForMe();
  }

  public winElection() {
    this.transition(ServerKind.CANDIDATE, ServerKind.LEADER);
    const nextIndex = increase(this.lastIndexCommitted);
    this.logsToReplicate = this.buildPeersMap(nextIndex);
    this.logsReplicated = this.buildPeersMap(logIndexV.check(0));
  }

  public cancelElection() {
    this.transition(ServerKind.CANDIDATE, ServerKind.FOLLOWER);
    this.removeVote();
  }

  public looseLeadership() {
    this.transition(ServerKind.LEADER, ServerKind.FOLLOWER);
    this.removeVote();
    this.logsToReplicate = null;
    this.logsReplicated = null;
  }

  public becomeFollower() {
    switch (this.kind) {
      case ServerKind.CANDIDATE:
        this.cancelElection();
        break;
      case ServerKind.FOLLOWER:
        break;
      case ServerKind.LEADER:
        this.looseLeadership();
        break;
    }
  }

  // -----------
  // --- RPC ---
  // -----------

  public requestVote(
    candidateTerm: TermIndex,
    candidateId: ServerId,
    candidateLastLogIndex: LogIndex,
    candidateLastLogTerm: TermIndex
  ): { term: TermIndex; voteGranted: boolean } {
    // ($5.1) If the term in the RPC is gritter than the candidate’s current term,
    // then the candidate returns to follower
    if (this.isTermOutdated(candidateTerm)) {
      this.acceptNewTerm(candidateTerm);
      return { term: this.term, voteGranted: false };
    }

    // ($5.2) If the term in the RPC is smaller than the candidate’s current term,
    // then the candidate rejects the RPC and continues in candidate state
    if (this.isFormerTerm(candidateTerm)) {
      return { term: this.term, voteGranted: false };
    }

    // ($5.2) Each server will vote for at most one candidate in a
    //given term, on a first-come-first-served basis
    const canVoteFor = this.canVoteFor(candidateId);
    // ($5.4) The restriction ensures that the leader for any given term
    // contains all of the entries committed in previous terms
    //const isCandidateAhead = this.isNewLog(candidateLastLogTerm, candidateLastLogIndex);
    const isCandidateAhead = true;
    //
    if (canVoteFor && isCandidateAhead) {
      return { term: this.term, voteGranted: true };
    }

    return { term: this.term, voteGranted: false };
  }

  // --- utils

  private voteForMe() {
    this.serverVotedFor = this.id;
  }
  private removeVote() {
    this.serverVotedFor = null;
  }

  private buildPeersMap<V>(initialValue: V): { [serverId: string]: V } {
    return this.peers.reduce((acc, id) => ({ ...acc, [id]: initialValue }), {});
  }

  private canVoteFor(candidateId: ServerId) {
    if (this.serverVotedFor === null) return true;
    if (this.serverVotedFor === candidateId) return true;
    return false;
  }

  // private isNewLog(incomingLogTerm: TermIndex, incomingLogIndex: LogIndex) {
  //   const ownLog: LogEntry | undefined = this.getLastCommittedLog();

  //   console.log(ownLog);

  //   if (ownLog === undefined) {
  //     return true;
  //   }

  //   const ownLogTerm = ownLog.term;

  //   console.log(ownLogTerm);

  //   if (incomingLogTerm === ownLogTerm) {
  //     return incomingLogIndex >= this.lastIndexCommitted;
  //   }

  //   return incomingLogTerm >= ownLogTerm;
  // }

  // private getLogAt(logIndex: LogIndex) {
  //   const arrayIndex = logIndex - 1;
  //   if (arrayIndex < 0) return undefined;
  //   return this.logs[arrayIndex];
  // }

  // private getLastCommittedLog() {
  //   return this.getLogAt(this.lastIndexCommitted);
  // }

  private isFormerTerm(candidateTerm: TermIndex) {
    return candidateTerm < this.term;
  }

  private increaseTerm() {
    this.term = increase(this.term);
    this.removeVote();
  }

  private transition(currentKind: ServerKind, targetKind: ServerKind) {
    if (this.kind !== currentKind) throw new Error("IncorrectKind");
    this.kind = targetKind;
  }
}

export const increase = <T extends number>(previousValue: T): T => ((previousValue as number) + 1) as T;
