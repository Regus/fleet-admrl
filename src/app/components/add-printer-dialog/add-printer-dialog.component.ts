import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ConsoleLine, PrinterPort, RearAdmiralState } from '../../http/rear-admrl-client/rear-admrl-client';
import { CommandService } from '../../services/command/command.service';
import { AddPrinterUseCase } from '../../usecases/add-printer.usecase';

export interface Host {
  id: string;
  name: string;
}

@Component({
  selector: 'app-add-printer-dialog',
  templateUrl: './add-printer-dialog.component.html',
  styleUrls: ['./add-printer-dialog.component.scss']
})
export class AddPrinterDialogComponent {
  @Input() addPrinterUseCase: AddPrinterUseCase | null = null;
  @Input() activeStateId?: string;
  @Output() close = new EventEmitter();
  skipFirmware = false;

  activePage = 'info';

  constructor() { }

  executeAddPrinter() {
    this.addPrinterUseCase?.executeInstall();
  }

  closeDialog() {
    this.close.emit();
  }

  activatePage(page: string) {
    this.activePage = page;
  }

  get name(): string {
    return this.addPrinterUseCase?.name ?? '';
  }

  set name(value: string) {
    if (this.addPrinterUseCase) {
      this.addPrinterUseCase.name = value;
    }
  }

  get klipperConfig(): string {
    return this.addPrinterUseCase?.klipperConfig ?? '';
  }

  get moonrakerConfig(): string {
    return this.addPrinterUseCase?.moonrakerConfig ?? '';
  }

  get ports(): PrinterPort[] {
    return this.addPrinterUseCase?.ports ?? [];
  }

  get lines(): ConsoleLine[] {
    return this.addPrinterUseCase?.consoleLines ?? [];
  }

}
