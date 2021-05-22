import { Component, Input } from '@angular/core';
import { CommandPrinterUseCase } from '../../../../usecases/command-printer.usecase';

@Component({
  selector: 'app-bed-status',
  templateUrl: './bed-status.component.html',
  styleUrls: ['./bed-status.component.scss']
})
export class BedStatusComponent {
  @Input() componentUseCase?: CommandPrinterUseCase;

  constructor() { }

  get disabled(): boolean {
    return !this.componentUseCase?.ready;
  }

  get temperature(): string {
    if (this.disabled) {
      return '···';
    }
    return `${Math.round(this.componentUseCase!.bedTemp * 10) / 10}`;
  }

  get target(): number {
    if (this.disabled) {
      return 1;
    }
    return Math.round(this.componentUseCase!.bedTempTarget * 10) / 10;
  }

  get showTarget(): boolean {
    if (this.disabled) {
      return false;
    }
    const delta = Math.abs(this.componentUseCase!.bedTemp - this.componentUseCase!.bedTempTarget);
    return delta > 1 && this.componentUseCase!.bedTempTarget > 0;
  }

}
