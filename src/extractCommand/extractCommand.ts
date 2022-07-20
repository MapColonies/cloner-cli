import { injectable } from 'tsyringe';
import { Argv, CommandModule, Arguments } from 'yargs';
import { ExtractManager } from './extractManager';

@injectable()
export class ExtractCommand implements CommandModule {
  public deprecated = false;
  public command = '$0 <jsonPath> <destPath>';
  public describe = 'create zip of configured repositories (or sub directories)';
  public aliases = ['extract'];

  public constructor(private readonly manager: ExtractManager) {}

  public builder = (yargs: Argv): Argv => {
    const jsonDescription = ''
    return yargs.positional('jsonPath', { describe: jsonDescription, type: 'string' })
    .positional('destPath', { describe: 'destination zip file to store results', type: 'string' })
  };

  public handler = async (args: Arguments): Promise<void> => {
    this.manager.ZipSources(args['jsonPath'] as string,args['destPath'] as string);
    return Promise.resolve();
  };
}
