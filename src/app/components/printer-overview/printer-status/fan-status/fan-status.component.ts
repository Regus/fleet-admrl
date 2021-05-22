import { Component, Input } from '@angular/core';
import { CommandPrinterUseCase } from '../../../../usecases/command-printer.usecase';

@Component({
  selector: 'app-fan-status',
  templateUrl: './fan-status.component.html',
  styleUrls: ['./fan-status.component.scss']
})
export class FanStatusComponent {
  @Input() componentUseCase?: CommandPrinterUseCase;

  constructor() { }

  get disabled(): boolean {
    return !this.componentUseCase?.ready;
  }

  get speed(): number {
    return Math.round((this.componentUseCase?.fanSpeed ?? 0) * 100);
  }
}
