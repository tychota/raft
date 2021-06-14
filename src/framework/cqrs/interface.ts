export type Constructor<T> = {
  new (...args: any[]): T;
};

export class Command {}
export interface CommandHandler<SpecificCommand extends Command> {
  execute(command: SpecificCommand): Promise<void>;
}

export class Query {}
export interface QueryHandler<SpecificQuery extends Query> {
  execute<QueryReturn>(query: SpecificQuery): Promise<QueryReturn>;
}
