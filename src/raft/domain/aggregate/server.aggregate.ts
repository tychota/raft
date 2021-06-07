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

import { LogIndex, logIndexV } from "../valueObject/logIndex";
import { ServerId } from "../valueObject/server";
import { TermIndex, termIndexV } from "../valueObject/termIndex";

enum ServerKind {
  "LEADER" = "LEADER",
  "CANDIDATE" = "CANDIDATE",
  "FOLLOWER" = "FOLLOWER",
}

type LogIndexByServerId = Record<string, LogIndex>;

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
  serverId: ServerId;
  /**
   * The other ServerIds (unique id) identifying the other servers running in the cluster
   *
   * @type {ServerId[]}
   * @memberof ServerAggregate
   */
  memberServerIds: ServerId[];

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
   * @type {(LogIndexByServerId | undefined)}
   * @memberof ServerAggregate
   */
  logToReplicate: LogIndexByServerId | undefined;
  /**
   * For each (other) servers, index of highest log entry known to be replicated
   * - initialized to 0
   *
   * NOTE: in Raft paper, this is named "matchIndex"
   *
   * @type {(LogIndexByServerId | undefined)}
   * @memberof ServerAggregate
   */
  logReplicated: LogIndexByServerId | undefined;

  // -------------------------------------
  // --- constructors and initializers ---
  // -------------------------------------

  private constructor(
    serverId: ServerId,
    memberServerIds: ServerId[],
    term: TermIndex,
    serverVotedFor: ServerId | null,
    lastIndexCommitted: LogIndex,
    lastIndexProjected: LogIndex,
    logToReplicate: LogIndexByServerId | undefined = undefined,
    logReplicated: LogIndexByServerId | undefined = undefined
  ) {
    this.serverId = serverId;
    this.memberServerIds = memberServerIds;
    this.kind = ServerKind.FOLLOWER;
    this.term = term;
    this.serverVotedFor = serverVotedFor;
    this.lastIndexCommitted = lastIndexCommitted;
    this.lastIndexProjected = lastIndexProjected;
    this.logToReplicate = logToReplicate;
    this.logReplicated = logReplicated;
  }

  public static fromScratch(id: ServerId, memberServerIds: ServerId[]) {
    const term = termIndexV.check(0);
    const serverVotedFor = null;
    const lastIndexCommitted = logIndexV.check(0);
    const lastIndexProjected = logIndexV.check(0);
    return new ServerAggregate(id, memberServerIds, term, serverVotedFor, lastIndexCommitted, lastIndexProjected);
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
    this.logToReplicate = this.buildMembersMap(nextIndex);
    this.logReplicated = this.buildMembersMap(logIndexV.check(0));
  }

  public cancelElection() {
    this.transition(ServerKind.CANDIDATE, ServerKind.FOLLOWER);
    this.serverVotedFor = null;
  }

  public removeElected() {
    this.transition(ServerKind.LEADER, ServerKind.FOLLOWER);
    this.logReplicated = undefined;
    this.logReplicated = undefined;
  }

  public becomeFollower() {
    switch (this.kind) {
      case ServerKind.CANDIDATE:
        this.cancelElection();
        break;
      case ServerKind.CANDIDATE:
        break;
    }
  }

  // -----------
  // --- rpc ---
  // -----------

  public requestVote(
    candidateTerm: TermIndex,
    candidateId: ServerId,
    candidateLastLogIndex: LogIndex,
    candidateLastLogTerm: TermIndex
  ): { term: TermIndex; voteGranted: boolean } | null {
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
    const isCandidateAhead = this.isNewLog(candidateLastLogTerm, candidateLastLogIndex);
    //
    if (canVoteFor && isCandidateAhead) {
      return { term: this.term, voteGranted: true };
    }

    return null;
  }

  // --- utils

  private voteForMe() {
    this.serverVotedFor = this.serverId;
  }

  private buildMembersMap<V>(initialValue: V): { [serverId: string]: V } {
    return this.memberServerIds.reduce((acc, id) => ({ ...acc, [id]: initialValue }), {});
  }

  private canVoteFor(candidateId: ServerId) {
    if (this.serverVotedFor === null) return true;
    if (this.serverVotedFor === candidateId) return true;
    return false;
  }

  private isNewLog(incomingLogTerm: TermIndex, incomingLogIndex: LogIndex) {
    if (incomingLogTerm > this.term) return true;
    if (incomingLogIndex > this.lastIndexCommitted) return true;
    return false;
  }

  private isFormerTerm(candidateTerm: TermIndex) {
    return candidateTerm < this.term;
  }

  private increaseTerm() {
    increase(this.term);
  }

  private transition(currentKind: ServerKind, targetKind: ServerKind) {
    if (this.kind !== currentKind) throw new Error("IncorrectKind");
    this.kind = targetKind;
  }
}

const increase = <T extends number>(previousValue: T): T => ((previousValue as number) + 1) as T;
