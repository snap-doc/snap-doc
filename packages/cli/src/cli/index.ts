import chalk from 'chalk';
import * as commander from 'commander';
import * as debug from 'debug';

const log = debug('snap-doc:cli');

const NO_CMD_TXT = chalk.blue(`Please choose from one of the commands below`);

export function run(): void {
  commander
    .command('generate <path>')
    .description('Generate documentation from a TS or JS project')
    .alias('g')
    .action(pth => {
      log(`Generating docs at path: ${pth}`);
    });

  commander.action(() => {
    commander.help(
      hlp => `
${NO_CMD_TXT}

${hlp}`
    );
  });

  commander.parse(process.argv);
}
