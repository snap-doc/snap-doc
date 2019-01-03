import { CliCommand } from './base';
import generateCommand from './generate';
const ALL_COMMANDS: CliCommand[] = [generateCommand];

export default ALL_COMMANDS;
