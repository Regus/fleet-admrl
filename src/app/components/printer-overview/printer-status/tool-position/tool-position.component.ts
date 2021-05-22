import { Component, Input } from '@angular/core';
import { CommandPrinterUseCase } from '../../../../usecases/command-printer.usecase';

@Component({
  selector: 'app-tool-position',
  templateUrl: './tool-position.component.html',
  styleUrls: ['./tool-position.component.scss']
})
export class ToolPositionComponent {
  @Input() componentUseCase?: CommandPrinterUseCase;

  constructor() { }

  get disabled(): boolean {
    return !this.componentUseCase?.ready;
  }

  private formatPosition(pos: number) {
    const str = `${Math.round(pos * 100) / 100}`.replace(',', '.');
    const index = str.indexOf('.');
    if (index > 0) {
      const digits = str.substr(0, index);
      let decimal = str.substr(index + 1);
      while (decimal.length < 2) {
        decimal += '0';
      }
      return `${digits}.${decimal}`;
    } else {
      return `${str}.00`;
    }
    return str;
  }

  get isXHomed(): boolean {
    return this.componentUseCase?.x.homed ?? false;
  }

  get isYHomed(): boolean {
    return this.componentUseCase?.y.homed ?? false;
  }

  get isZHomed(): boolean {
    return this.componentUseCase?.y.homed ?? false;
  }

  get x(): string {
    const position = this.componentUseCase?.x.position;
    if (position) {
      return `${this.formatPosition(position)}`;
    }
    return '-';
  }

  get y(): string {
    const position = this.componentUseCase?.y.position;
    if (position) {
      return `${this.formatPosition(position)}`;
    }
    return '-';
  }

  get z(): string {
    const position = this.componentUseCase?.y.position;
    if (position) {
      return `${this.formatPosition(position)}`;
    }
    return '-';
  }

  get e(): string {
    const position = this.componentUseCase?.extruderPosition;
    if (position) {
      return `${this.formatPosition(position)}`;
    }
    return '-';
  }

}
