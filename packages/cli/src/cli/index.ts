import { findPkgJson, nodeHost } from '@code-to-json/utils-node';
import { createProgramFromTsConfig } from '@code-to-json/utils-ts';
import { DocGenerator } from '@snap-doc/core';
import { MarkdownFileEmitter } from '@snap-doc/markdown-emitter';
import chalk from 'chalk';
import * as commander from 'commander';
import * as debug from 'debug';
import * as path from 'path';

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
      log(`Generating docs for code at: ${pth}`);
      const prog = await createProgramFromTsConfig(pth, nodeHost);
      const pkg = await findPkgJson(pth);
      if (!pkg) {
        throw new Error(`Could not find package.json via search path "${pth}"`);
      }
      const dg = new DocGenerator(prog, nodeHost, {
        emitter: new MarkdownFileEmitter({
          outDir: path.join(process.cwd(), 'out'),
          host: nodeHost
        }),
        pkgInfo: {
          path: pkg.path,
          name: pkg.contents.name,
          main: pkg.contents['doc:main'] || pkg.contents.main || pkg.path
        }
      });
      await dg.emit();
    });

  commander.action(invalidCommandHelp);

  commander.parse(process.argv);
  if (process.argv.length < 3) {
    invalidCommandHelp();
  }
}
