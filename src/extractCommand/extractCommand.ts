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
    const jsonDescription =
      'json configuration file containing array of sources with the following fields:\n' +
      '"repositoryUrl" - repository https clone url.\n' +
      '"branch" - name of the branch to use as a source.\n' +
      '"directory" - (optional) sub directory to add to the archive (default - entire repository).\n' +
      '"targetDir" - (optional) name of the directory in the archive to store the repository files in (default - repository name).';
    return yargs
      .positional('jsonPath', { describe: jsonDescription, type: 'string' })
      .positional('destPath', { describe: 'destination zip file to store results', type: 'string' })
      .boolean('tar')
      .alias('tar', ['t'])
      .describe('t', 'create tar archive instead of zip');
  };

  public handler = async (args: Arguments): Promise<void> => {
    await this.manager.zipSources(args['jsonPath'] as string, args['destPath'] as string, args['tar'] as boolean);
    return Promise.resolve();
  };
}
