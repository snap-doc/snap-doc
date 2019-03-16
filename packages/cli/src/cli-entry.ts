import chalk from 'chalk';
import * as commander from 'commander';
import generateDocs from './commands/generate-docs';
import runDoctests from './commands/run-doctests';

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
    .option('--force', 'Overwrite any existing content found in the output directory [true]')
    .option(
      '-e|--emitters [emitters]',
      'Documentation emitters to use [md]',
      (emitterNames: string) => emitterNames.trim().split(/\s*,\s*/),
    )
    .action(pth => {
      const { force, emitters } = generateCommand.opts();
      if (typeof force !== 'boolean') throw new Error(`Invalid value for --force: ${force}`);
      if (!Array.isArray(emitters)) throw new Error(`Invalid value for --emitters: ${emitters}`);
      if (emitters.length === 0) throw new Error(`Must specify at least one emitter`);
      generateDocs(pth, { force, emitters });
    });

  commander
    .command('doctest <path>')
    .description('Run doctests')
    .action(pth => {
      runDoctests(pth);
    });

  commander.action(invalidCommandHelp);

  commander.parse(process.argv);

  if (process.argv.length < 3) {
    invalidCommandHelp();
  }
}
