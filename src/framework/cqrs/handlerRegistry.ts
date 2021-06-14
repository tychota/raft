import { container, singleton } from "tsyringe";
import { Command, CommandHandler, Constructor, Query, QueryHandler } from "./interface";

@singleton()
export class HandlerRegistry {
  private commands = new Map<Constructor<Command>, Constructor<CommandHandler<Command>>>();
  private queries = new Map<Constructor<Query>, Constructor<QueryHandler<Query>>>();

  registerCommandHandler = (commandClass: Constructor<Command>, handlerClass: Constructor<CommandHandler<Command>>) => {
    this.commands.set(commandClass, handlerClass);
  };

  getCommandHandler = <C extends Command>(command: C): CommandHandler<C> => {
    const commandClass = command.constructor as Constructor<Command>;
    const commandHandlerClass = this.commands.get(commandClass);
    if (!commandHandlerClass) throw new Error(`No command handler registered for command ${command.constructor.name}`);
    return container.resolve(commandHandlerClass);
  };

  registerQueryHandler = (queryClass: Constructor<Query>, handlerClass: Constructor<QueryHandler<Query>>) => {
    this.queries.set(queryClass, handlerClass);
  };

  getQueryHandler = <C extends Query>(query: C): QueryHandler<C> => {
    const queryClass = query.constructor as Constructor<Query>;
    const queryHandlerClass = this.queries.get(queryClass);
    if (!queryHandlerClass) throw new Error(`No query handler registered for query ${query.constructor.name}`);
    return container.resolve(queryHandlerClass);
  };
}
