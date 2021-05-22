import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MainPageComponent } from './pages/main-page/main-page.component';
import { SetupPageComponent } from './pages/setup-page/setup-page.component';

const routes: Routes = [
  {
      path: '',
      component: MainPageComponent,
  },
  {
      path: 'setup',
      component: SetupPageComponent,
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }