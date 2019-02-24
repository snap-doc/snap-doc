import chalk from 'chalk';
import * as commander from 'commander';
import generateDocs from '../commands/generate-docs';
import runDoctests from '../commands/run-doctests';

const NO_CMD_TXT = chalk.blue(`Please choose from one of the commands below`);

function invalidCommandHelp(): void {
  commander.help(
    hlp => `
${NO_CMD_TXT}

${hlp}`,
  );
}

export function run(): void {
  const generateCommand = commander
    .command('generate <path>')
    .description('Generate documentation from a TS or JS project')
    .alias('g')
    .option('--force', 'Overwrite any existing content found in the output directory')
    .action(async pth => {
      generateDocs(pth, generateCommand);
    });
  const docTestsCommand = commander
    .command('doctest <path>')
    .description('Run doctests')
    .action(async pth => {
      runDoctests(pth, docTestsCommand);
    });
  commander.action(invalidCommandHelp);

  commander.parse(process.argv);

  if (process.argv.length < 3) {
    invalidCommandHelp();
  }
}
