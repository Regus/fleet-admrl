import { Component, Input } from '@angular/core';
import { CommandPrinterUseCase } from '../../../../usecases/command-printer.usecase';

@Component({
  selector: 'app-hotend-status',
  templateUrl: './hotend-status.component.html',
  styleUrls: ['./hotend-status.component.scss']
})
export class HotendStatusComponent {
  @Input() componentUseCase?: CommandPrinterUseCase;

  constructor() { }

  get disabled(): boolean {
    return !this.componentUseCase?.ready;
  }

  get temperature(): string {
    if (this.disabled) {
      return '···';
    }
    return `${Math.round(this.componentUseCase!.extruderTemp * 10) / 10}`;
  }

  get target(): number {
    if (this.disabled) {
      return 1;
    }
    return Math.round(this.componentUseCase!.extruderTempTarget * 10) / 10;
  }

  get showTarget(): boolean {
    if (this.disabled) {
      return false;
    }
    const delta = Math.abs(this.componentUseCase!.extruderTemp - this.componentUseCase!.extruderTempTarget);
    return delta > 1 && this.componentUseCase!.extruderTempTarget > 0;
  }
}
