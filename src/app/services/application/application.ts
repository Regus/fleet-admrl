import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { StatefulService } from '../../framework/stateful.service';
import { SetupUseCase, SetupUseCaseActions, SetupUseCaseModel } from '../../usecases/setup.usecase';


@Injectable({
  providedIn: 'root',
})
export class Application extends StatefulService implements SetupUseCaseActions {

  constructor(
  ) {
    super();
  }

  protected async update(): Promise<void> {
    this.updateUseCases();
    this.serviceContentUpdated();
  }

  private updateUseCases() {
  }

  initialize() {
  }

  installTooling(): void {

  }

  get setupUseCase(): Observable<SetupUseCase> {
    return this.getUseCase<SetupUseCaseModel>('SetupUseCase').pipe(map(model => new SetupUseCase(model, this)));
   }
}


