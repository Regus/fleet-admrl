import { Component, Input } from '@angular/core';
import { CommandPrinterUseCase } from '../../../../usecases/command-printer.usecase';

@Component({
  selector: 'app-elapsed-time',
  templateUrl: './elapsed-time.component.html',
  styleUrls: ['./elapsed-time.component.scss']
})
export class ElapsedTimeComponent {
  @Input() componentUseCase?: CommandPrinterUseCase;

  constructor() { }

  get elapsedTime(): number {
    return Math.round(this.componentUseCase?.elapsedTime ?? 0);
  }

  get totalTime(): number {
    const elapsed = this.componentUseCase?.elapsedTime ?? 0;
    const progress = this.componentUseCase?.progress ?? 0;
    if (progress === 0) {
      return 0;
    }
    return Math.round((elapsed / progress));
  }

  get remainingTime(): number {
    return this.totalTime - this.elapsedTime;
  }

}
