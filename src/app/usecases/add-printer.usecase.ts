import { KconfigOption } from '../services/kconfig/kconfig-parser';

export interface PrinterPort {
  address: string; // ip/portname
  name: string;
  inUse: boolean;
}

export interface AddPrinterUseCaseActions {
  flashPrinter(): void;
  installServices(): void;
  updateKlipperConfig(config: string): void;
  updateMoonrakerConfig(config: string): void;
}

export interface AddPrinterUseCaseModel {
  readonly ports: PrinterPort[];
  readonly configurationItems: KconfigOption[];
  readonly flashInProgress: boolean;
  readonly serviceInstallInProgress: boolean;
  readonly klipperConfig: string;
  readonly moonrakerConfig: string;
}

export class AddPrinterUseCase {

  constructor(
    private model: AddPrinterUseCaseModel,
    private actions: AddPrinterUseCaseActions,
  ) {

  }

  flashPrinter() {
    this.actions.flashPrinter();
  }

  installServices() {
    this.actions.installServices();
  }

  updateKlipperConfig(config: string) {
    this.actions.updateKlipperConfig(config);
  }

  updateMoonrakerConfig(config: string) {
    this.actions.updateMoonrakerConfig(config);
  }

  get ports(): PrinterPort[] {
    return this.model.ports;
  }

  get configurationItems(): KconfigOption[] {
    return this.model.configurationItems;
  }
}
