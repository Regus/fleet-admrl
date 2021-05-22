import { Component, Input } from '@angular/core';
import { CommandPrinterUseCase } from '../../../../usecases/command-printer.usecase';

@Component({
  selector: 'app-progress-bar',
  templateUrl: './progress-bar.component.html',
  styleUrls: ['./progress-bar.component.scss']
})
export class ProgressBarComponent {
  @Input() componentUseCase?: CommandPrinterUseCase;

  constructor() { }

  get disabled(): boolean {
    return !this.componentUseCase?.ready;
  }

  get progress(): string {
    if (this.disabled) {
      return 'offline';
    }
    return `${Math.round(this.componentUseCase!.progress * 1000) / 10}%`;
  }

  get progressWidth(): string {
    if (this.disabled) {
      return '0';
    }
    return `${Math.round(this.componentUseCase!.progress * 100)}%`;
  }

}
