import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';

import { AppComponent } from './app.component';
import { SetupPageComponent } from './pages/setup-page/setup-page.component';
import { ConsoleComponent } from './components/console/console.component';
import { KconfigComponent } from './components/kconfig/kconfig.component';
import { KconfigToggleComponent } from './components/kconfig/kconfig-toggle/kconfig-toggle.component';
import { KconfigChoiceComponent } from './components/kconfig/kconfig-choice/kconfig-choice.component';
import { FormsModule } from '@angular/forms';
import { KconfigTextComponent } from './components/kconfig/kconfig-text/kconfig-text.component';
import { MainPageComponent } from './pages/main-page/main-page.component';
import { AddPrinterDialogComponent } from './components/add-printer-dialog/add-printer-dialog.component';
import { PrinterOverviewComponent } from './components/printer-overview/printer-overview.component';
import { PrinterDetailsComponent } from './components/printer-overview/printer-details/printer-details.component';
import { PrinterStatusComponent } from './components/printer-overview/printer-status/printer-status.component';
import { BedStatusComponent } from './components/printer-overview/printer-status/bed-status/bed-status.component';
import { ElapsedTimeComponent } from './components/printer-overview/printer-status/elapsed-time/elapsed-time.component';
import { FanStatusComponent } from './components/printer-overview/printer-status/fan-status/fan-status.component';
import { FeedRateComponent } from './components/printer-overview/printer-status/feed-rate/feed-rate.component';
import { HotendStatusComponent } from './components/printer-overview/printer-status/hotend-status/hotend-status.component';
import { ProgressBarComponent } from './components/printer-overview/printer-status/progress-bar/progress-bar.component';
import { ToolPositionComponent } from './components/printer-overview/printer-status/tool-position/tool-position.component';
import { TimeComponent } from './components/printer-overview/printer-status/elapsed-time/time/time.component';
import { PrintStatusComponent } from './components/printer-overview/printer-details/print-status/print-status.component';
import { MotionControlComponent } from './components/printer-overview/printer-details/motion-control/motion-control.component';
import { TempControlComponent } from './components/printer-overview/printer-details/temp-control/temp-control.component';
import { MotionLimitsComponent } from './components/printer-overview/printer-details/motion-limits/motion-limits.component';
import { KlipperConsoleComponent } from './components/printer-overview/printer-details/klipper-console/klipper-console.component';
import { GcodeFilesComponent } from './components/printer-overview/printer-details/gcode-files/gcode-files.component';
import { MonacoEditorModule } from 'ngx-monaco-editor';
import { ConfigEditorComponent } from './components/config-editor/config-editor.component';

@NgModule({
  imports: [
    BrowserModule,
    FormsModule,
    AppRoutingModule,
    MonacoEditorModule.forRoot()
  ],
  declarations: [
    AppComponent,
    SetupPageComponent,
    ConsoleComponent,
    KconfigComponent,
    KconfigToggleComponent,
    KconfigChoiceComponent,
    KconfigTextComponent,
    MainPageComponent,
    AddPrinterDialogComponent,
    PrinterOverviewComponent,
    PrinterDetailsComponent,
    PrinterStatusComponent,
    BedStatusComponent,
    ElapsedTimeComponent,
    FanStatusComponent,
    FeedRateComponent,
    HotendStatusComponent,
    ProgressBarComponent,
    ToolPositionComponent,
    TimeComponent,
    PrintStatusComponent,
    MotionControlComponent,
    TempControlComponent,
    MotionLimitsComponent,
    KlipperConsoleComponent,
    GcodeFilesComponent,
    ConfigEditorComponent,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
