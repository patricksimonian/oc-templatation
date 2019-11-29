import commander from 'commander';
import { version } from '../package.json';
import { action } from './commands/toTemplate.js';

const program = new commander.Command();

program.version(version);

program
  .command('to-template <file>')
  .description(
    `Convert an Openshift Resource Definition into a template. 
  This can either be a List object or an individual definition.`,
  )
  .option(
    '-o, --output <string>',
    'path to output file too, by default it will overwrite the input file',
  )
  .option(
    '-d, --doNotStrip',
    'Objects not needed for a Template are typically stripped (ReplicaSet, Pods) etc, this disables this feature',
    false,
  )
  .action(action);

program.parse(process.argv);
