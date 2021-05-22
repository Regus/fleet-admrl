import { Component, Input } from '@angular/core';
import { CommandPrinterUseCase } from '../../../usecases/command-printer.usecase';

@Component({
  selector: 'app-printer-status',
  templateUrl: './printer-status.component.html',
  styleUrls: ['./printer-status.component.scss']
})
export class PrinterStatusComponent {
  @Input() componentUseCase?: CommandPrinterUseCase;

  constructor() { }

  get name(): string {
    return this.componentUseCase?.name ?? '-';
  }

  get disabled(): boolean {
    return !this.componentUseCase?.ready;
  }

}
