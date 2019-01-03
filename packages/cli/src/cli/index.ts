import cliProgram from './program';

export function runCli(): void {
  cliProgram().parse(process.argv);
}
