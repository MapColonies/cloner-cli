import { injectable } from 'tsyringe';
import { Argv, CommandModule, Arguments} from 'yargs';
import { HelloWorldManager } from './helloWorldManager';

@injectable()
export class HelloWorldCommand implements CommandModule {
  public deprecated = false;
  public command = '$0';
  public describe = 'example command';
  public aliases = ['helloWorld'];

  public constructor(private readonly manager: HelloWorldManager) {}

  public builder = (yargs: Argv): Argv => {
    return yargs.positional('jsonPath', { describe: 'json with list of repos', type: 'string' })
    .positional('destPath', { describe: 'destination directory to store results', type: 'string' });
  };

  public handler = async (args: Arguments): Promise<void> => {

    this.manager.sayHello();
    return Promise.resolve();
  };
}
