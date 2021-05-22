import { Component, Input } from '@angular/core';
import { CommandPrinterUseCase } from '../../../../usecases/command-printer.usecase';

@Component({
  selector: 'app-feed-rate',
  templateUrl: './feed-rate.component.html',
  styleUrls: ['./feed-rate.component.scss']
})
export class FeedRateComponent {
  @Input() componentUseCase?: CommandPrinterUseCase;

  constructor() { }

  get disabled(): boolean {
    return !this.componentUseCase?.ready;
  }

  get feedRate(): number {
    return Math.round((this.componentUseCase?.feedRate ?? 1) * 100);
  }

}
