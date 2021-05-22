import { Component, Input } from '@angular/core';
import { KconfigOption } from '../../../services/kconfig/kconfig-parser';

@Component({
  selector: 'app-kconfig-toggle',
  templateUrl: './kconfig-toggle.component.html',
  styleUrls: ['./kconfig-toggle.component.scss']
})
export class KconfigToggleComponent {
  @Input() visual: KconfigOption | undefined;

  constructor() { }

  get title() {
    return this.visual?.title;
  }

  get checked(): boolean {
    return this.visual?.value === 'y';
  }

  set checked(value: boolean) {
    if (this.visual) {
      this.visual.value = value ? 'y' : 'n';
    }
  }

}
