import { Injectable } from '@angular/core';
import { Observable, ReplaySubject } from 'rxjs';
import { environment } from '../../../environments/environment';
import { RearAdmiralState, RearAdmrlClient } from '../../http/rear-admrl-client/rear-admrl-client';

@Injectable({
  providedIn: 'root'
})
export class CommandService {
  private _rearAdmrlClients: RearAdmrlClient[] = [];
  private _clientStates: RearAdmiralState[] = [];
  private _stateSubject = new ReplaySubject<RearAdmiralState[]>(1);


  constructor() {
    const targets = [];
    if (environment.production) {
      targets.push(location.host);
    } else {
      targets.push(...environment.devHosts);
    }
    console.log(targets);
    targets.forEach(url => {
      const index = this._rearAdmrlClients.length;
      const client = new RearAdmrlClient(url);
      client.connect();
      client.state.subscribe(state => {
        this._clientStates[index] = state;
        this.stateUpdated();
      });
      this._rearAdmrlClients.push(client);
    });
    this.stateUpdated();
   }

  installTooling() {
    this._rearAdmrlClients[0].installTooling();
  }

  updatePrinterPorts() {
    this._rearAdmrlClients[0].updatePrinterPorts();
  }

  turnOnAllPrinters() {
    this._rearAdmrlClients[0].turnOnAllPrinters();
  }

  turnOffAllPrinters() {
    this._rearAdmrlClients[0].turnOffAllPrinters();
  }

  readKConfig() {
    this._rearAdmrlClients[0].readKConfig();
  }

  private stateUpdated() {
    this._stateSubject.next(this._clientStates);
  }

  get states(): Observable<RearAdmiralState[]> {
    return this._stateSubject;
  }

}
