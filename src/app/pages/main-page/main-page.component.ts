import { Component, Input } from '@angular/core';
import { Observable } from 'rxjs';
import { PrinterManager } from '../../services/application/printer-manager/printer-manager.service';
import { AddPrinterUseCase } from '../../usecases/add-printer.usecase';

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
    private printerManager: PrinterManager
  ) { }

  openAddPrinterDialog() {
    this.printerManager.beginSession();
    this.showAddPrinterDialog = true;
  }

  closeAddPrinterDialog() {
    this.showAddPrinterDialog = false;
  }

  get addPrinterUseCase(): Observable<AddPrinterUseCase> {
    return this.printerManager.addPrinterUseCase;
  }

}
