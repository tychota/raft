import { container, injectable } from "tsyringe";
import { Command, CommandHandler, Constructor, Query, QueryHandler } from "./interface";
import { UseCaseBus } from "./useCaseBus";

export function HandleCommand<C extends Command, H extends CommandHandler<C>>(commandClass: Constructor<C>): (handlerClass: Constructor<H>) => void {
  return function (handlerClass: Constructor<H>): void {
    injectable()(handlerClass);
    const bus = container.resolve(UseCaseBus);
    bus.registerCommandHandler(commandClass, handlerClass);
  };
}

export function HandleQuery<Q extends Query, H extends QueryHandler<Q>>(queryClass: Constructor<Q>): (handlerClass: Constructor<H>) => void {
  return function (handlerClass: Constructor<H>): void {
    injectable()(handlerClass);
    const bus = container.resolve(UseCaseBus);
    bus.registerQueryHandler(queryClass, handlerClass);
  };
}
