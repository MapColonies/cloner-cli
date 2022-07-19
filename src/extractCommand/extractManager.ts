import { singleton } from 'tsyringe';

@singleton()
export class ExtractManager {
  public sayHello(): void {
    console.log('start extracting');
  }
}
