import { CommandPrinterUseCase } from './command-printer.usecase';

export interface Axis {
  position: number;
  homed: boolean;
}


export interface CommandFleetUseCaseActions {
  homeAll(): void;
}

export interface CommandFleetUseCaseModel {
  readonly progress: number;
}

export class CommandFleetUseCase {

  constructor(
    private model: CommandFleetUseCaseModel,
    private actions: CommandFleetUseCaseActions,
  ) {

  }

  activatePrinter(printerid: string) {

  }

  get activePrinter(): CommandPrinterUseCase {
    return undefined as any;
  }

  get printers(): CommandPrinterUseCase[] {
    return [];
  }


}