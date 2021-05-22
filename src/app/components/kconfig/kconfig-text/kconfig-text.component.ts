import { Component, Input } from '@angular/core';
import { KconfigOption, KconfigOptionType } from '../../../services/kconfig/kconfig-parser';

@Component({
  selector: 'app-kconfig-text',
  templateUrl: './kconfig-text.component.html',
  styleUrls: ['./kconfig-text.component.scss']
})
export class KconfigTextComponent {
  @Input() visual: KconfigOption | undefined;
  @Input() subType?: KconfigOptionType;

  constructor() { }

  get title() {
    return this.visual?.title;
  }

  get text(): string {
    return this.visual?.value ?? '';
  }

  set text(value: string) {
    if (this.visual) {
      this.visual.value = value;
    }
  }
}
