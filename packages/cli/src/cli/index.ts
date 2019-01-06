import { createProgramFromTsConfig } from '@code-to-json/utils-ts';
import { generateDocumentationForProgram } from '@snap-doc/core';
import chalk from 'chalk';
import * as commander from 'commander';
import * as debug from 'debug';
import { existsSync, readFileSync, statSync } from 'fs';
const log = debug('snap-doc:cli');

const NO_CMD_TXT = chalk.blue(`Please choose from one of the commands below`);

function invalidCommandHelp(): void {
  commander.help(
    hlp => `
${NO_CMD_TXT}

${hlp}`
  );
}

export function run(): void {
  commander
    .command('generate <path>')
    .description('Generate documentation from a TS or JS project')
    .alias('g')
    .action(async pth => {
      log(`Generating docs at path: ${pth}`);
      const prog = await createProgramFromTsConfig(
        pth,
        f => readFileSync(f).toString(),
        f => existsSync(f) && statSync(f).isFile()
      );
      generateDocumentationForProgram(prog, { outpath: 'out' });
    });

  commander.action(invalidCommandHelp);

  commander.parse(process.argv);
  if (process.argv.length < 3) {
    invalidCommandHelp();
  }
}
