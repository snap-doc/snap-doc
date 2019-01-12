import { DocData } from '@snap-doc/types';

export interface EmitterOptions {
  projectName?: string;
}

export default abstract class Emitter<O extends EmitterOptions = EmitterOptions> {
  constructor(protected options: O) {}
  public async emit(data: DocData): Promise<void> {
    const [ready, err] = await this.validateConditions();
    if (ready) {
      await this.prepare(data);
    } else {
      throw new Error(`[${this.constructor.name}] - Pre-flight check failed: ${err}`);
    }
    await this.generate(data);
    await this.validateResult();
  }
  protected async validateConditions(): Promise<[true] | [false, string]> {
    return [true];
  }

  // tslint:disable-next-line:no-empty
  protected async prepare(_data: DocData): Promise<void> {}

  // tslint:disable-next-line:no-empty
  protected async generate(_data: DocData): Promise<void> {}

  // tslint:disable-next-line:no-empty
  protected async validateResult(): Promise<void> {}
}
