import { Component, Input } from '@angular/core';
import { PrinterPort, RearAdmiralState } from '../../http/rear-admrl-client/rear-admrl-client';

@Component({
  selector: 'app-new-printer',
  templateUrl: './new-printer.component.html',
  styleUrls: ['./new-printer.component.scss']
})
export class NewPrinterComponent {
  @Input() state: RearAdmiralState | null = null;

  constructor() { }

  get ports(): PrinterPort[] | undefined {
    return this.state?.printerPorts;
  }

  get kconfig(): string {
    return this.state?.kconfig.kconfig ?? '';
  }

}
