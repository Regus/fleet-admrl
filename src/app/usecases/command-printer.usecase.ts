
export interface Axis {
  position: number;
  homed: boolean;
}


export interface CommandPrinterUseCaseActions {
  homeAll(): void;
}

export interface CommandPrinterUseCaseModel {
  readonly progress: number;
}

export class CommandPrinterUseCase {

  constructor(
    private model: CommandPrinterUseCaseModel,
    private actions: CommandPrinterUseCaseActions,
  ) {

  }

  homeAll() {
    this.actions.homeAll();
  }

  get id(): string {
    return '';
  }

  get name(): string {
    return '';
  }

  get ready(): boolean {
    return false;
  }

  get progress(): number {
    return 0;
  }

  get elapsedTime(): number {
    return 0;
  }

  get fanSpeed(): number {
    return 0;
  }

  get extruderTemp(): number {
    return 0;
  }

  get extruderTempTarget(): number {
    return 0;
  }

  get bedTemp(): number {
    return 0;
  }

  get bedTempTarget(): number {
    return 0;
  }

  get x(): Axis {
    return {
      position: 0,
      homed: false
     };
  }

  get y(): Axis {
    return {
      position: 0,
      homed: false
     };
  }

  get z(): Axis {
    return {
      position: 0,
      homed: false
     };
  }

  get extruderPosition(): number {
    return 0;
  }

  get feedRate(): number {
    return 0;
  }

}