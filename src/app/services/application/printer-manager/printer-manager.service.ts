import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { StatefulService } from '../../../framework/stateful.service';
import { PrinterPort } from '../../../http/rear-admrl-client/rear-admrl-client';
import { AddPrinterUseCase, AddPrinterUseCaseActions, AddPrinterUseCaseModel } from '../../../usecases/add-printer.usecase';
import { KConfigParser } from '../../kconfig/kconfig-parser';
import { RearAdmrlManager } from '../../rear-admrl-manager/rear-admrl-manager.service';

export interface RearAdmrlHost {
  id: string;
  name: string;
}

@Injectable({
  providedIn: 'root',
})
export class PrinterManager extends StatefulService implements AddPrinterUseCaseActions {
  private _activePortAddress: string = '';
  private _ports: PrinterPort[] = [];
  private _name = 'My Printer';
  private _kconfig?: KConfigParser;
  private _klipperConfig =  '';
  private _moonrakerConfig = '';

  constructor(
    private rearAdmrlManager: RearAdmrlManager
  ) {
    super();
    this.updateUseCases();
  }

  protected async update(): Promise<void> {
    this.updateUseCases();
    this.serviceContentUpdated();
  }

  private updateUseCases() {
    const port = this._ports.find(p => p.address === this._activePortAddress);
    const state = this.rearAdmrlManager.states.find(state => state.id === port?.hostId);

    this.updateUseCase<AddPrinterUseCaseModel>('AddPrinterUseCase', {
      name: this._name,
      ports: this._ports,
      kconfig: this._kconfig,
      klipperConfig: this._klipperConfig,
      moonrakerConfig: this._moonrakerConfig,
      consoleLines: state?.consoleBuffer ?? []
    });
  }

  async beginSession() {
    this._ports = await this.rearAdmrlManager.getPorts();
    if (this._ports.length > 0) {
      await this.setInstallPort(this._ports[0].address);
    }
    this.updateUseCases();
  }

  async setInstallPort(address: string) {
    this._activePortAddress = address;
    const port = this._ports.find(p => p.address === this._activePortAddress);
    const client = this.rearAdmrlManager.clients.find(client => client.id === port?.hostId);
    if (client) {
      const kconfig = await client?.getKConfig();
      const basicConfig = await client?.getBasicConfig();
      this._kconfig = new KConfigParser(kconfig);
      this._klipperConfig = basicConfig.klipper;
      this._moonrakerConfig = basicConfig.moonraker;
    }
  }

  setName(name: string): void {
    this._name = name;
    this.updateUseCases();
  }

  setKlipperConfig(config: string): void {

  }

  setMoonrakerConfig(config: string): void {

  }

  executeInstall(): void {
    const port = this._ports.find(p => p.address === this._activePortAddress);
    const client = this.rearAdmrlManager.clients.find(client => client.id === port?.hostId);
    if (client) {
      client.installPrinter({
        klipper: this._klipperConfig,
        moonraker: this._moonrakerConfig,
        name: this._name,
        port: port!.name,
        kconfig: this._kconfig!.configOutput
      });
    }
  }

  get addPrinterUseCase(): Observable<AddPrinterUseCase> {
    return this.getUseCase<AddPrinterUseCaseModel>('AddPrinterUseCase').pipe(map(model => new AddPrinterUseCase(model, this)));
  }
}


