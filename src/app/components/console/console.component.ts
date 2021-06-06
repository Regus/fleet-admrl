import { AfterViewChecked, Component, ElementRef, Input, ViewChild } from '@angular/core';
import { ConsoleLine } from '../../http/rear-admrl-client/rear-admrl-client';

@Component({
  selector: 'app-console',
  templateUrl: './console.component.html',
  styleUrls: ['./console.component.scss']
})
export class ConsoleComponent implements AfterViewChecked {
  private _lastLineCount = 0;

  @ViewChild('console', { static: true }) consoleElement!: ElementRef;
  @Input() lines: ConsoleLine[] | null = [];

  constructor() { }

  ngAfterViewChecked(): void {
    if (this._lastLineCount !== (this.lines?.length ?? 0)) {
      this._lastLineCount = this.lines?.length ?? 0;
      setTimeout(() => {
        if (this.consoleElement?.nativeElement) {
          this.consoleElement.nativeElement.scrollTop = this.consoleElement.nativeElement.scrollHeight;
        }
      });
    }

  }

  trackByLineId(index: number, item: ConsoleLine) {
    return item.id;
  }
}
