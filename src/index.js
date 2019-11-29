import commander from 'commander';
import { version } from '../package.json';
import { action } from './commands/templatize.js';

const program = new commander.Command();

program.version(version);

program
  .command('to-template')
  .description(
    `Convert an Openshift Resource Definition into a template. 
  This can either be a List object or an individual definition.`,
  )
  .option(
    '-o, --output <string>',
    'path to output file too, by default it will overwrite the input file',
  )
  .option(
    '-d, --doNotStrip <boolean',
    'Objects not needed for a Template are typically stripped (ReplicaSet, Pods) etc, this disables this feature',
    false,
  )
  .action(action);
