import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { ConsoleLine, RearAdmiralState } from '../../http/rear-admrl-client/rear-admrl-client';
import { CommandService } from '../../services/command/command.service';

@Component({
  templateUrl: './setup-page.component.html',
  styleUrls: ['./setup-page.component.scss']
})
export class SetupPageComponent {

  constructor(
    private commandService: CommandService
  ) { }

  installTooling() {
    this.commandService.installTooling();
  }

  updatePrinterPorts() {
    // this.commandService.updatePrinterPorts();
  }

  turnOnAllPrinters() {
    this.commandService.turnOnAllPrinters();
  }

  turnOffAllPrinters() {
    this.commandService.turnOffAllPrinters();
  }

  readKConfig() {
    // this.commandService.readKConfig();
  }

  get states(): Observable<RearAdmiralState[]> {
    return this.commandService.states;
  }

  get consoleBuffer(): Observable<ConsoleLine[]> {
    return this.commandService.states.pipe(
      map(states => states[0].consoleBuffer),
    );
  }

  get state(): Observable<RearAdmiralState> {
    return this.commandService.states.pipe(
      map(states => states[0]),
    );
  }
}
