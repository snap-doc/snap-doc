import * as commander from 'commander';
import ALL_COMMANDS from '../commands';

function getPackageJSONContents(): { version: string } {
  if (__dirname.indexOf('lib') >= 0) {
    return require('../../../package.json');
  } else {
    return require('../../package.json');
  }
}

function buildProgram(): commander.Command {
  const prog: commander.Command = commander.version(getPackageJSONContents().version);

  ALL_COMMANDS.forEach(cmd => {
    const { buildAction, alias, arguments: args, options, name, description } = cmd;
    let c = prog.command(name, description);
    if (typeof alias === 'string') {
      c = c.alias(alias);
    }
    if (typeof args === 'string') {
      c = c.arguments(args);
    }
    if (options instanceof Array) {
      options.forEach(o => {
        c = c.option(o.flags, o.description, o.defaultValue);
      });
    }
    c.action(buildAction(c));
  });
  return prog;
}

export default buildProgram;
