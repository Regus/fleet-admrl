import { Injectable } from '@angular/core';
import { Observable, ReplaySubject } from 'rxjs';
import { ReadAdmiralState, RearAdmrlClient } from '../../http/rear-admrl-client/rear-admrl-client';

@Injectable({
  providedIn: 'root'
})
export class CommandService {
  private _rearAdmrlClients: RearAdmrlClient[] = [];
  private _clientStates: ReadAdmiralState[] = [];
  private _stateSubject = new ReplaySubject<ReadAdmiralState[]>(1);


  constructor() {
    ['192.168.1.49:4280'].forEach(url => {
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

  private stateUpdated() {
    this._stateSubject.next(this._clientStates);
  }

  get states(): Observable<ReadAdmiralState[]> {
    return this._stateSubject;
  }

}
