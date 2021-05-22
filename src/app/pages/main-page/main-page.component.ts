import { Component, Input } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { RearAdmiralState } from '../../http/rear-admrl-client/rear-admrl-client';
import { CommandService } from '../../services/command/command.service';

export enum TabPages {
  Info = 'info',
};

@Component({
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.scss']
})
export class MainPageComponent {
  @Input() activeTab: TabPages = TabPages.Info;
  @Input() showAddPrinterDialog = false;

  constructor(
    private commandService: CommandService
  ) { }

  openAddPrinterDialog() {
    this.showAddPrinterDialog = true;
  }

  closeAddPrinterDialog() {
    this.showAddPrinterDialog = false;
  }

  get state(): Observable<RearAdmiralState[]> {
    return this.commandService.states;
  }

}
