import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { StatefulService } from '../../framework/stateful.service';
import { PrinterPort } from '../../http/rear-admrl-client/rear-admrl-client';
import { SetupUseCase, SetupUseCaseActions, SetupUseCaseModel } from '../../usecases/setup.usecase';
import { RearAdmrlManager } from '../rear-admrl-manager/rear-admrl-manager.service';

export interface RearAdmrlHost {
  id: string;
  name: string;
}

@Injectable({
  providedIn: 'root',
})
export class Application extends StatefulService implements SetupUseCaseActions {
  private _activeHost: string = '';

  constructor(
    private rearAdmrlManager: RearAdmrlManager
  ) {
    super();
  }

  protected async update(): Promise<void> {
    this.updateUseCases();
    this.serviceContentUpdated();
  }

  private updateUseCases() {
    const host = this.rearAdmrlManager.states.find(host => host.id === this._activeHost);
    if (host) {
      this.updateUseCase<SetupUseCaseModel>('SetupUseCase', {
        toolingInstalled: host.toolingInstalled,
        busy: host.busy
      });
    }
  }

  initialize() {
  }

  get hosts(): RearAdmrlHost[] {
    return this.rearAdmrlManager.states.map(host => ({
      id: host.id,
      name: host.name
    }));
  }

  installTooling(): void {
    throw new Error('Method not implemented.');
  }

  get activeHost(): string {
    return this._activeHost;
  }

  set activeHost(value: string)  {
    this._activeHost = value;
    this.updateUseCases();
  }

  get setupUseCase(): Observable<SetupUseCase> {
    return this.getUseCase<SetupUseCaseModel>('SetupUseCase').pipe(map(model => new SetupUseCase(model, this)));
  }
}


