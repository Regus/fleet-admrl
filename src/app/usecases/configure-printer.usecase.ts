import { KconfigOption } from '../services/kconfig/kconfig-parser';

export interface ConfigurePrinterUseCaseActions {
  flashPrinter(): void;
  updateKlipperConfig(config: string): void;
  updateMoonrakerConfig(config: string): void;
}

export interface ConfigurePrinterUseCaseModel {
  readonly configurationItems: KconfigOption[];
  readonly flashInProgress: boolean;
  readonly klipperConfig: string;
  readonly moonrakerConfig: string;
}

export class ConfigurePrinterUseCase {

  constructor(
    private model: ConfigurePrinterUseCaseModel,
    private actions: ConfigurePrinterUseCaseActions,
  ) {

  }

  flashPrinter() {
    this.actions.flashPrinter();
  }

  updateKlipperConfig(config: string) {
    this.actions.updateKlipperConfig(config);
  }

  updateMoonrakerConfig(config: string) {
    this.actions.updateMoonrakerConfig(config);
  }

  get configurationItems(): KconfigOption[] {
    return this.model.configurationItems;
  }


}