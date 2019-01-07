import { createProgramFromTsConfig } from '@code-to-json/utils-ts';
import { DocGenerator } from '@snap-doc/core';
import { MarkdownFileEmitter } from '@snap-doc/markdown-emitter';
import { TempFolderCreator } from '@snap-doc/types';
import chalk from 'chalk';
import * as commander from 'commander';
import * as debug from 'debug';
import { existsSync, readFileSync, statSync } from 'fs';
import * as path from 'path';
import * as tmp from 'tmp';

const log = debug('snap-doc:cli');

const NO_CMD_TXT = chalk.blue(`Please choose from one of the commands below`);

function invalidCommandHelp(): void {
  commander.help(
    hlp => `
${NO_CMD_TXT}

${hlp}`
  );
}

const tmpGenerator: TempFolderCreator = () => {
  const folder = tmp.dirSync({ unsafeCleanup: true });
  return {
    name: folder.name,
    cleanup(): void {
      folder.removeCallback();
    }
  };
};

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
      const dg = new DocGenerator(
        prog,
        {
          tmp: tmpGenerator,
          logger: debug('snap-doc:doc-generator')
        },
        {
          emitter: new MarkdownFileEmitter({
            outDir: path.join(process.cwd(), 'out')
          })
        }
      );
      await dg.emit();
    });

  commander.action(invalidCommandHelp);

  commander.parse(process.argv);
  if (process.argv.length < 3) {
    invalidCommandHelp();
  }
}
