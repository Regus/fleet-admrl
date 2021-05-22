import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ConsoleLine, PrinterPort, RearAdmiralState } from '../../http/rear-admrl-client/rear-admrl-client';
import { CommandService } from '../../services/command/command.service';

export interface Host {
  id: string;
  name: string;
}

@Component({
  selector: 'app-add-printer-dialog',
  templateUrl: './add-printer-dialog.component.html',
  styleUrls: ['./add-printer-dialog.component.scss']
})
export class AddPrinterDialogComponent implements OnInit {
  @Input() states: RearAdmiralState[] | null = null;
  @Input() activeStateId?: string;
  @Output() close = new EventEmitter();

  constructor(
    private commandService: CommandService
  ) { }

  ngOnInit(): void {
    console.log('init');
    this.commandService.updatePrinterPorts();
    this.commandService.readKConfig();
  }

  closeDialog() {
    this.close.emit();
  }

  get hosts(): Host[] {
    return (this.states ?? []).map(state => ({
      id: state.id,
      name: state.name
    }));
  }

  get state(): RearAdmiralState | null {
    if (this.states) {
      return this.states.find(state => state.id === this.activeStateId) ?? this.states[0];
    }
    return null;
  }

  get ports(): PrinterPort[] {
    return this.state?.printerPorts ?? [];
  }

  get lines(): ConsoleLine[] {
    return this.state?.consoleBuffer ?? [];
  }

}
