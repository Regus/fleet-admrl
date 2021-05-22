import { Component, Input } from '@angular/core';
import { KconfigOption, KconfigChoiceItemn } from '../../../services/kconfig/kconfig-parser';

@Component({
  selector: 'app-kconfig-choice',
  templateUrl: './kconfig-choice.component.html',
  styleUrls: ['./kconfig-choice.component.scss']
})
export class KconfigChoiceComponent {
  @Input() visual: KconfigOption | undefined;

  constructor() { }

  get title(): string | undefined {
    return this.visual?.title;
  }

  get chosen(): string {
    return this.visual?.value ?? '';
  }

  set chosen(value: string) {
    if (this.visual) {
      this.visual.value = value;
    }
  }

  get options(): KconfigChoiceItemn[] {
    return this.visual?.options ?? [];
  }

  trackByVisualOption(index: number, visual: KconfigChoiceItemn) {
    return visual.id;
  }
}
