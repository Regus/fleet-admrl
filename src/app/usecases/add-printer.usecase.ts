import { ConsoleLine, PrinterPort } from '../http/rear-admrl-client/rear-admrl-client';
import { KconfigOption, KConfigParser } from '../services/kconfig/kconfig-parser';

export interface AddPrinterUseCaseActions {
  beginSession(): void;
  setInstallPort(address: string): void;
  setName(name: string): void;
  setKlipperConfig(config: string): void;
  setMoonrakerConfig(config: string): void;
  executeInstall(): void;
}

export interface AddPrinterUseCaseModel {
  readonly name: string;
  readonly ports: PrinterPort[];
  readonly kconfig?: KConfigParser;
  readonly klipperConfig: string;
  readonly moonrakerConfig: string;
  readonly consoleLines: ConsoleLine[];
}

export class AddPrinterUseCase {

  constructor(
    private model: AddPrinterUseCaseModel,
    private actions: AddPrinterUseCaseActions,
  ) {
  }

  beginSession() {
    this.actions.beginSession();
  }

  executeInstall() {
    this.actions.executeInstall();
  }

  selectPort(port: PrinterPort) {
    this.actions.setInstallPort(port.address);
  }

  get name(): string {
    return this.model.name;
  }

  set name(value: string) {
    this.actions.setName(value);
  }

  get ports(): PrinterPort[] {
    return this.model.ports;
  }

  get kconfig(): KConfigParser | undefined {
    return this.model.kconfig;
  }

  get klipperConfig(): string {
    return this.model.klipperConfig;
  }

  set klipperConfig(value: string) {
    this.actions.setKlipperConfig(value);
  }

  get moonrakerConfig(): string {
    return this.model.moonrakerConfig;
  }

  set moonrakerConfig(value: string) {
    this.actions.setMoonrakerConfig(value);
  }

  get consoleLines(): ConsoleLine[] {
    return this.model.consoleLines;
  }

}
