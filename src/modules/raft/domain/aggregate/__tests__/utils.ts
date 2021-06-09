import { ServerId } from "../../valueObject/serverId";
import { TermIndex } from "../../valueObject/termIndex";
import { ServerAggregate, ServerKind } from "../server.aggregate";

import { diff } from "jest-diff";

declare global {
  namespace jest {
    interface Matchers<R> {
      toHaveKind(kind: ServerKind): R;
      toHaveConfig(serverId: ServerId, members: ServerId[]): R;
    }
  }
}

export interface TypeWithArgs<T, A extends any[]> extends Function {
  new (...args: A): T;
}
const assertInstanceOfServerAggregate = (instance: ServerAggregate) => {
  if (!(instance instanceof ServerAggregate)) {
    throw new Error("expected value to be a ServerAggregate");
  }
};

expect.extend({
  toHaveKind(received: ServerAggregate, kind: ServerKind) {
    assertInstanceOfServerAggregate(received)
    this
    if (received.kind !== kind) {
      return { pass: false, message: () => `Expected a raft server of kind "${kind}", got kind "${received.kind}".` };
    }
    return { pass: true, message: () => "" };
  },
  toHaveConfig(received: ServerAggregate, serverId: ServerId, members: ServerId[]) {
    if (!(received instanceof ServerAggregate)) {
      throw new Error("expected value to be a ServerAggregate");
    }
    if (received.serverId !== serverId) {
      return {
        pass: false,
        message: () => `Expected a raft server with an id "${serverId}", got id "${received.serverId}".`,
      };
    }
    const options = {
      comment: "Deep equality",
      isNot: this.isNot,
      promise: this.promise,
    };
    if (!this.equals(received.memberServerIds, members)) {
      const diffString = diff(members, received.memberServerIds, {
        expand: this.expand,
      });
      return {
        pass: false,
        message: () =>
          this.utils.matcherHint("toHaveConfig", "expected", "_, members", options) +
          "\n\n" +
          (diffString && diffString.includes("- Expect")
            ? `Difference:\n\n${diffString}`
            : `Expected: ${this.utils.printExpected(members)}\n` + `Received: ${this.utils.printReceived(received)}`),
      };
    }
    return { pass: true, message: () => "" };
  },
  toBeAtTerm(received: ServerAggregate, term: TermIndex) {
    if (!(received instanceof ServerAggregate)) {
      throw new Error("expected value to be a ServerAggregate");
    }
    if (received.term !== term) {
      return {
        pass: false,
        message: () => `Expected a raft server with term "${term}", got kind "${received.term}".`,
      };
    }
    return { pass: true, message: () => "" };
  },
});
