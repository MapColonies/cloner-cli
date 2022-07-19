import { injectable } from 'tsyringe';
import { Argv, CommandModule, Arguments } from 'yargs';
import { ExtractManager } from './extractManager';

@injectable()
export class ExtractCommand implements CommandModule {
  public deprecated = false;
  public command = '$0 <jsonPath> <destPath>';
  public describe = 'Run list of repos to extract from github';
  public aliases = ['extract'];

  public constructor(private readonly manager: ExtractManager) {}

  public builder = (yargs: Argv): Argv => {
    return yargs.positional('jsonPath', { describe: 'json with list of repos', type: 'string' })
    .positional('destPath', { describe: 'destination directory to store results', type: 'string' });;
  };

  public handler = async (args: Arguments): Promise<void> => {
    this.manager.sayHello();
    console.log(args['jsonPath'])
    console.log(args['destPath'])
    return Promise.resolve();
  };
}
