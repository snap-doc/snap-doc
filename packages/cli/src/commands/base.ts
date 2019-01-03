import * as commander from 'commander';

export interface CliCommandOption<T = any> {
  flags: string;
  description: string;
  defaultValue?: T;
}

export interface CliCommand<A extends any[] = any[]> {
  name: string;
  description: string;
  buildAction: (program: commander.Command) => (...args: A) => void;
  alias?: string;
  arguments?: string;
  options?: CliCommandOption[];
}
