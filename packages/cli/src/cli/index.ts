import { findPkgJson, NODE_HOST } from '@code-to-json/utils-node';
import { createProgramFromTsConfig } from '@code-to-json/utils-ts';
import { DocEnv, DocGenerator } from '@snap-doc/core';
import { MarkdownFileEmitter } from '@snap-doc/markdown-emitter';
import chalk from 'chalk';
import * as commander from 'commander';
import * as debug from 'debug';
import * as path from 'path';
import * as windowSize from 'window-size';

const log = debug('snap-doc:cli');

const NO_CMD_TXT = chalk.blue(`Please choose from one of the commands below`);

function invalidCommandHelp(): void {
  commander.help(
    hlp => `
${NO_CMD_TXT}

${hlp}`
  );
}

function divider(character: string = '-', length: number = windowSize.width): string {
  return new Array<string>(length).fill(character).join('');
}

export function run(): void {
  const cliProgram = commander
    .command('generate <path>')
    .description('Generate documentation from a TS or JS project')
    .alias('g')
    .option('--force', 'Overwrite any existing content found in the output directory')
    .action(async pth => {
      log(`Generating docs for code at: ${pth}`);
      const prog = await createProgramFromTsConfig(pth, NODE_HOST);
      const pkg = await findPkgJson(pth);
      if (!pkg) {
        throw new Error(`Could not find package.json via search path "${pth}"`);
      }
      const pkgInfo = {
        path: pkg.path,
        name: pkg.contents.name,
        main: pkg.contents['doc:main'] || pkg.contents.main || pkg.path
      };
      const { force = false } = cliProgram.opts();
      const dg = new DocGenerator(prog, NODE_HOST, {
        emitter: new MarkdownFileEmitter(NODE_HOST, {
          outDir: path.join(process.cwd(), 'out'),
          overwriteOutDir: force
        }),
        pkgInfo
      });
      try {
        await dg.emit(new DocEnv(pkgInfo, NODE_HOST));
      } catch (e) {
        if (e instanceof Error) {
          const errMessageParts = e.message.split('\n');
          const [firstErrPart, ...restErrParts] = errMessageParts;
          const firstErrLine = chalk.red.bold(firstErrPart);
          const errParts = ['\n', firstErrLine, divider()];
          if (errMessageParts.length > 1) {
            errParts.push(chalk.redBright(restErrParts.map(s => `  ${s}`).join('\n')));
          }
          errParts.push('\n');
          e.message = errParts.join('\n');
          process.stderr.write(e.stack!);
        } else {
          process.stderr.write(`${chalk.red('ERROR:')} ${e}`);
        }
      }
    });
  commander.action(invalidCommandHelp);
  commander.parse(process.argv);

  if (process.argv.length < 3) {
    invalidCommandHelp();
  }
}
