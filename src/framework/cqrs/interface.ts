export type Constructor<T> = {
  new (...args: any[]): T;
};

export class Command {}
export interface CommandHandler<SpecificCommand extends Command> {
  execute(command: SpecificCommand): void;
}

export class Query {}
export interface QueryHandler<SpecificQuery extends Query> {
  execute<QueryReturn>(query: SpecificQuery): QueryReturn;
}
