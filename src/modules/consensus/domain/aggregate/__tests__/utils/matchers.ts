import "jest";
import { diff } from "jest-diff";

import { ServerId } from "../../../valueObject/serverId";
import { TermIndex } from "../../../valueObject/termIndex";
import { LogIndex } from "../../../valueObject/logIndex";

import { ServerAggregate, ServerKind } from "../../server.aggregate";

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeARaftServerOfKind(kind: ServerKind): R;
      toHaveRaftPeeringConfig(id: ServerId, peers: ServerId[]): R;
      toHaveVotedRaftServer(id: ServerId | null): R;
      toBeAtRaftTerm(term: TermIndex): R;
      toHaveHandledRaftLogsUntil(logIndexes: { committed: LogIndex; projected: LogIndex }): R;
    }
  }
}

export interface TypeWithArgs<T, A extends any[]> extends Function {
  new (...args: A): T;
}
const ensureServerAggregate = (instance: ServerAggregate) => {
  if (!(instance instanceof ServerAggregate)) {
    throw new Error("expected value to be a ServerAggregate");
  }
};

const passOK = { pass: true, message: () => "" };
const passKO = (message: string) => ({ pass: false, message: () => message });

function checker<V>(
  this: jest.MatcherContext,
  receivedValue: V,
  expectedValue: V,
  metadata: { matcher: string; received?: string; expected?: string; errorLog: string }
) {
  if (this.equals(receivedValue, expectedValue)) return { ok: true, message: "" };

  let message = "";
  const diffOptions = { expand: this.expand };
  const diffString = diff(expectedValue, receivedValue, diffOptions);

  message += metadata.errorLog;
  message += "\n\n";
  message += this.utils.matcherHint(metadata.matcher, metadata.received, metadata.expected, {});
  message += "\n\n";
  if (diffString && diffString.includes("- Expect")) {
    message += `Difference:\n\n${diffString}`;
  } else {
    message += `Expected: ${this.utils.printExpected(expectedValue)}`;
    message += "\n";
    message += `Received: ${this.utils.printReceived(receivedValue)}`;
  }
  return { ok: false, message };
}

expect.extend({
  toBeARaftServerOfKind(received: ServerAggregate, kind: ServerKind) {
    ensureServerAggregate(received);

    const metadata = {
      errorLog: "Server have incorrect kind.",
      expected: "kind",
      matcher: "toBeARaftServerOfKind",
    };
    const { ok, message } = checker.call(this, received.kind, kind, metadata);
    if (!ok) return passKO(message);
    return passOK;
  },

  toHaveRaftPeeringConfig(received: ServerAggregate, id: ServerId, peers: ServerId[]) {
    ensureServerAggregate(received);

    const metadata1 = {
      errorLog: "Server have incorrect serverId.",
      expected: "serverId",
      matcher: "toHaveVotedRaftServer",
    };
    const { ok: ok1, message: message1 } = checker.call(this, received.id, id, metadata1);
    if (!ok1) return passKO(message1);

    const metadata2 = {
      errorLog: "Server have incorrect peers.",
      expected: "serverIds",
      matcher: "toHaveVotedRaftServer",
    };
    const { ok: ok2, message: message2 } = checker.call(this, received.peers, peers, metadata2);
    if (!ok2) return passKO(message2);
    return passOK;
  },
  toHaveVotedRaftServer(received: ServerAggregate, id: ServerId | null) {
    ensureServerAggregate(received);

    const metadata = {
      errorLog: "Server have incorrect serverVotedFor.",
      expected: "serverId",
      matcher: "toHaveVotedRaftServer",
    };
    const { ok, message } = checker.call(this, received.serverVotedFor, id, metadata);
    if (!ok) return passKO(message);
    return passOK;
  },
  toBeAtRaftTerm(received: ServerAggregate, term: TermIndex) {
    ensureServerAggregate(received);

    const metadata = {
      errorLog: "Server have incorrect term.",
      expected: "term",
      matcher: "toBeAtRaftTerm",
    };
    const { ok, message } = checker.call(this, received.term, term, metadata);
    if (!ok) return passKO(message);
    return passOK;
  },
  toHaveHandledRaftLogsUntil(received: ServerAggregate, logIndexes: { committed: LogIndex; projected: LogIndex }) {
    ensureServerAggregate(received);

    const metadata1 = {
      errorLog: "Server have incorrect committed log index.",
      expected: "{committed: logIndex, projected: _}",
      matcher: "toHaveHandledRaftLogsUntil",
    };
    const { ok: ok1, message: message1 } = checker.call(this, received.lastIndexCommitted, logIndexes.committed, metadata1);
    if (!ok1) return passKO(message1);

    const metadata2 = {
      errorLog: "Server have incorrect projected log index.",
      expected: "{committed: _, projected: logIndex}",
      matcher: "toHaveHandledRaftLogsUntil",
    };
    const { ok: ok2, message: message2 } = checker.call(this, received.lastIndexCommitted, logIndexes.committed, metadata2);
    if (!ok2) return passKO(message2);
    return passOK;
  },
});
