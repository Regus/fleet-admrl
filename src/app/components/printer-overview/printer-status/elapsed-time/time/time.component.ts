import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-time',
  templateUrl: './time.component.html',
  styleUrls: ['./time.component.scss']
})
export class TimeComponent {
  @Input() totalSeconds: number = 0;

  constructor() { }

  private toBiCif(value: number) {
    const integer = Math.floor(value);
    if (integer < 10) {
      return `0${integer}`;
    }
    return `${integer}`;
  }

  get days(): string {
    const days = this.totalSeconds / 86400;
    if (days > 0) {
      return `${Math.floor(days)}d `;
    }
    return '';
  }

  get hours(): string {
    const hours = Math.floor(this.totalSeconds / 3600);
    if (hours > 0) {
      return `${this.toBiCif(hours % 24)}:`;
    }
    return '';
  }

  get minutes(): string {
    const minutes = Math.floor(this.totalSeconds / 60);
    if (minutes > 0) {
      if (minutes > 60) {
        return `${this.toBiCif(minutes % 60)}:`;
      }
      return `${this.toBiCif(minutes)}:`;
    }
    return '';
  }

  get seconds(): string {
    if (this.totalSeconds === 0) {
      return '-';
    }
    return `${this.toBiCif(this.totalSeconds % 60)}`;
  }

}
