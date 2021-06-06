import { Input } from '@angular/core';
import { Component } from '@angular/core';
import { RearAdmiralState } from '../../http/rear-admrl-client/rear-admrl-client';
import { KconfigOption } from '../../services/kconfig/kconfig-parser';
import { AddPrinterUseCase } from '../../usecases/add-printer.usecase';

@Component({
  selector: 'app-kconfig',
  templateUrl: './kconfig.component.html',
  styleUrls: ['./kconfig.component.scss']
})
export class KconfigComponent {
  @Input() addPrinterUseCase: AddPrinterUseCase | null = null;

  constructor() { }

  get visuals(): KconfigOption[] {
    return this.addPrinterUseCase?.kconfig?.visualizations ?? [];
  }

  get output(): string {
    return this.addPrinterUseCase?.kconfig?.configOutput ?? '';
  }

  trackByVisual(index: number, visual: KconfigOption) {
    return visual.title;
  }

}
