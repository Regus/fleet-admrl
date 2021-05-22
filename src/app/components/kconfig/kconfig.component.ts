import { Input } from '@angular/core';
import { Component } from '@angular/core';
import { RearAdmiralState } from '../../http/rear-admrl-client/rear-admrl-client';
import { KconfigOption } from '../../services/kconfig/kconfig-parser';

@Component({
  selector: 'app-kconfig',
  templateUrl: './kconfig.component.html',
  styleUrls: ['./kconfig.component.scss']
})
export class KconfigComponent {
  @Input() state: RearAdmiralState | null = null;

  constructor() { }

  get visuals(): KconfigOption[] {
    return this.state?.kconfig?.visualizations ?? [];
  }

  get output(): string {
    return this.state?.kconfig?.configOutput ?? '';
  }

  trackByVisual(index: number, visual: KconfigOption) {
    return visual.title;
  }

}
