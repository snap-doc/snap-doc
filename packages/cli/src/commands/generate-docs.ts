import { UnreachableError } from '@code-to-json/utils';
import { findPkgJson, NODE_HOST } from '@code-to-json/utils-node';
import { createProgramFromTsConfig } from '@code-to-json/utils-ts';
import { DocGenerator } from '@snap-doc/core';
import { FileEmitterWorkspace } from '@snap-doc/emitter';
import { MarkdownFileEmitter } from '@snap-doc/markdown-emitter';
import chalk from 'chalk';
import * as debug from 'debug';
import * as path from 'path';
import * as windowSize from 'window-size';

const log = debug('snap-doc:cli');

function divider(character: string = '-', length: number = windowSize.width): string {
  return new Array<string>(length).fill(character).join('');
}

export interface EmitterMap {
  md: MarkdownFileEmitter;
  html: MarkdownFileEmitter;
}

export default async function generateDocs(
  pth: string,
  { force, emitters: emitterNames }: { force: boolean; emitters: (keyof EmitterMap)[] },
): Promise<void> {
  log(`Generating docs for code at: ${pth}`);
  const prog = await createProgramFromTsConfig(pth, NODE_HOST);
  const pkg = await findPkgJson(pth);
  if (!pkg) {
    throw new Error(`Could not find package.json via search path "${pth}"`);
  }
  const pkgInfo = {
    path: pkg.path,
    name: pkg.contents.name,
    main: pkg.contents['doc:main'] || pkg.contents.main || pkg.path,
  };

  function emitterForName<K extends keyof EmitterMap>(n: K): EmitterMap[K] {
    const name: keyof EmitterMap = n;
    if (name === 'md') {
      return new MarkdownFileEmitter(NODE_HOST, {
        outDir: path.join(process.cwd(), 'out'),
        overwriteOutDir: force,
      });
    }
    if (name === 'html') {
      return new MarkdownFileEmitter(NODE_HOST, {
        outDir: path.join(process.cwd(), 'out'),
        overwriteOutDir: force,
        html: true,
      });
    }
    throw new UnreachableError(name, `Unknown emitter name: ${name}`);
  }

  const emitters = emitterNames.map(e => emitterForName(e));

  const dg = new DocGenerator(prog, NODE_HOST, {
    emitters,
    pkgInfo,
  });
  try {
    await dg.emit(new FileEmitterWorkspace(NODE_HOST, pkgInfo));
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
}
