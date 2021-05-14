import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';

import { AppComponent } from './app.component';
import { SetupPageComponent } from './pages/setup-page/setup-page.component';
import { ConsoleComponent } from './components/console/console/console.component';

@NgModule({
  imports: [
    BrowserModule,
    AppRoutingModule,
  ],
  declarations: [
    AppComponent,
    SetupPageComponent,
    ConsoleComponent
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
