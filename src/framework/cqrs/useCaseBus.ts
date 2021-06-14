import { injectable } from "tsyringe";

import { Command, CommandHandler, Constructor, Query, QueryHandler } from "./interface";
import { HandlerRegistry } from "./handlerRegistry";

@injectable()
export class UseCaseBus {
  constructor(private readonly registry: HandlerRegistry) {}

  registerCommandHandler(commandClass: Constructor<Command>, handlerClass: Constructor<CommandHandler<Command>>) {
    this.registry.registerCommandHandler(commandClass, handlerClass);
  }

  async dispatchCommand(command: Command) {
    const commandHandlerInstance = this.registry.getCommandHandler(command);
    return commandHandlerInstance.execute(command);
  }

  registerQueryHandler(queryClass: Constructor<Query>, handlerClass: Constructor<QueryHandler<Query>>) {
    this.registry.registerQueryHandler(queryClass, handlerClass);
  }

  async dispatchQuery<QueryReturn>(query: Query): Promise<QueryReturn> {
    const queryHandler = this.registry.getQueryHandler(query);
    return queryHandler.execute<QueryReturn>(query);
  }
}

export const registerCommandHandler = (handlerClass: Constructor<CommandHandler<Command>>) => {
  new handlerClass();
};
