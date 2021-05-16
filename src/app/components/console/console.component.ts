import { AfterViewChecked, Component, ElementRef, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { ConsoleLine } from '../../http/rear-admrl-client/rear-admrl-client';

@Component({
  selector: 'app-console',
  templateUrl: './console.component.html',
  styleUrls: ['./console.component.scss']
})
export class ConsoleComponent implements AfterViewChecked {
  private _lastScrollHeight = 0;

  @ViewChild('console', { static: true }) consoleElement!: ElementRef;
  @Input() lines: ConsoleLine[] | null = [];

  constructor() { }

  ngAfterViewChecked(): void {
    setTimeout(() => {
      if (this.consoleElement?.nativeElement) {
        if (this._lastScrollHeight !== this.consoleElement.nativeElement.scrollHeight) {
          this._lastScrollHeight = this.consoleElement.nativeElement.scrollHeight
          this.consoleElement.nativeElement.scrollTop = this.consoleElement.nativeElement.scrollHeight;
        }
      }
    });
  }

  trackByLineId(index: number, item: ConsoleLine) {
    return item.id;
  }
}
