import { injectable } from "tsyringe";

import { Command, CommandHandler, Constructor, Query, QueryHandler } from "./interface";
import { HandlerRegistry } from "./handlerRegistry";
import { CQRSHook, PostCommandHook, PostQueryHook, PreCommandHook, PreQueryHook } from "./hooks";

@injectable()
export class UseCaseBus {
  constructor(private readonly registry: HandlerRegistry) {}

  private localHooks: CQRSHook[] = [];

  registerLocalHook(hook: CQRSHook) {
    this.localHooks.push(hook);
  }

  registerCommandHandler(commandClass: Constructor<Command>, handlerClass: Constructor<CommandHandler<Command>>) {
    this.registry.registerCommandHandler(commandClass, handlerClass);
  }

  async dispatchCommand(command: Command) {
    const startTime = this.beforeCommand(command);
    const commandHandlerInstance = this.registry.getCommandHandler(command);
    await commandHandlerInstance.execute(command);
    this.afterCommand(command, startTime);
  }

  registerQueryHandler(queryClass: Constructor<Query>, handlerClass: Constructor<QueryHandler<Query>>) {
    this.registry.registerQueryHandler(queryClass, handlerClass);
  }

  async dispatchQuery<QueryReturn>(query: Query): Promise<QueryReturn> {
    const startTime = this.beforeQuery(query);
    const queryHandler = this.registry.getQueryHandler(query);
    const response = await queryHandler.execute<QueryReturn>(query);
    this.afterQuery(query, response, startTime);
    return response;
  }

  private beforeQuery(query: Query) {
    const hooks = this.localHooks.filter((h) => h instanceof PreQueryHook) as PreQueryHook[];
    const time = process.hrtime.bigint();
    hooks.map((h) => h.execute(query, { processTime: time }));
    return time;
  }

  private afterQuery(query: Query, response: unknown, startTime: bigint) {
    const hooks = this.localHooks.filter((h) => h instanceof PostQueryHook) as PostQueryHook[];
    const time = process.hrtime.bigint();
    hooks.map((h) => h.execute(query, { processTime: time, queryTime: time - startTime, response }));
    return time;
  }

  private beforeCommand(command: Command) {
    const hooks = this.localHooks.filter((h) => h instanceof PreCommandHook) as PreCommandHook[];
    const time = process.hrtime.bigint();
    hooks.map((h) => h.execute(command, { processTime: time }));
    return time;
  }

  private afterCommand(command: Command, startTime: bigint) {
    const hooks = this.localHooks.filter((h) => h instanceof PostCommandHook) as PostCommandHook[];
    const time = process.hrtime.bigint();
    hooks.map((h) => h.execute(command, { processTime: time, queryTime: time - startTime }));
    return time;
  }
}

export const registerCommandHandler = (handlerClass: Constructor<CommandHandler<Command>>) => {
  new handlerClass();
};
