import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { StatefulService } from '../../framework/stateful.service';
import { PrinterPort, RearAdmiralState, RearAdmrlClient } from '../../http/rear-admrl-client/rear-admrl-client';

@Injectable({
  providedIn: 'root'
})
export class RearAdmrlManager extends StatefulService {
  private _clients: RearAdmrlClient[] = [];
  private _clientStates: RearAdmiralState[] = [];


  constructor() {
    super();
    const targets = [];
    if (environment.production) {
      targets.push(location.host);
    } else {
      targets.push(...environment.devHosts);
    }
    console.log(targets);
    targets.forEach(url => {
      const index = this._clients.length;
      const client = new RearAdmrlClient(url);
      client.connect();
      client.state.subscribe(state => {
        this._clientStates[index] = state;
        this.serviceContentUpdated();
      });
      this._clients.push(client);
    });
   }

   protected async update(): Promise<void> {

   }

   async getPorts(): Promise<PrinterPort[]> {
      const results = await Promise.all(this._clients.map(client => client.getPrinterPorts()));
      return results.flatMap(result => result);
   }

   get clients(): RearAdmrlClient[] {
    return this._clients;
   }

   get states(): RearAdmiralState[] {
    return this._clientStates;
   }

}
