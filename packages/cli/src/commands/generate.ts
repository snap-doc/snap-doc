import chalk from 'chalk';
import * as commander from 'commander';
// tslint:disable-next-line:no-commented-code
// import * as execa from 'execa';
import * as fs from 'fs';
import * as path from 'path';
import { CliCommand } from './base';

function validateProjectOption(program: commander.Command): [boolean, string] {
  const { project } = program as any;
  if (typeof project !== 'string') {
    return [false, `${project}`];
  }
  const pth = path.isAbsolute(project) ? project : path.join(process.cwd(), project);
  return [fs.existsSync(pth) && fs.statSync(pth).isDirectory(), pth];
}

const cmd: CliCommand = {
  name: 'generate',
  alias: 'g',
  description: 'Generate snap-doc documentation',
  options: [
    {
      flags: '-p, --project [path to folder w/ tsconfig.json]',
      defaultValue: null,
      description: 'Path to a folder containing a `tsconfig.json`'
    }
  ],
  // tslint:disable-next-line:typedef
  buildAction(program: commander.Command) {
    return function generate(): void {
      const [isValid, projectPath] = validateProjectOption(program);
      if (!isValid) {
        const err = chalk.red(`🚨 Invalid path: ${projectPath} 🚨`);
        program.help(
          s => `
${err}

${s}`
        );
      }
      // tslint:disable-next-line
      console.log('VALID PATH! ', projectPath);
    };
  }
};

export default cmd;
