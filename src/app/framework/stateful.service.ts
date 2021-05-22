import { Injectable, OnDestroy } from '@angular/core';
import { Observable, ReplaySubject, Subscription } from 'rxjs';
import * as deepEqual from 'fast-deep-equal';

@Injectable()
export abstract class StatefulService implements OnDestroy {
  private _isUpdating = false;
  private _updateQueued = false;
  private nextVersion = 1;
  private subscriptions: Subscription[] = [];
  version = new ReplaySubject<number>(1);
  private _useCases: { [key: string]: ReplaySubject<any> } = {};
  private _useCaseModels: { [key: string]: any } = {};

  constructor() {
  }

  registerDependencies(...dependencies: StatefulService[]) {
    dependencies.forEach(service => {
      if (service.version) {
        this.subscriptions.push(
          service.version.subscribe(async () => {
            this.performUpdate();
          })
        );
      }
    });
  }

  ngOnDestroy() {
    this.subscriptions.forEach(subscription => {
      subscription.unsubscribe();
    });
  }

  protected serviceContentUpdated(): void {
    this.version.next(this.nextVersion++);
  }

  private async performUpdate() {
    if (!this._isUpdating) {
      this._isUpdating = true;
      do {
        this._updateQueued = false;
        await this.update();
      } while (this._updateQueued);
      this._isUpdating = false;
    } else {
      this._updateQueued = true;
    }
  }

  protected abstract update(): Promise<void>;

  updateUseCase<T>(key: string, model: T) {
    if (!this._useCases[key]) {
      this._useCases[key] = new ReplaySubject<any>(1);
    }
    const oldModel = this._useCaseModels[key];
    if (!deepEqual(oldModel, model)) {
      this._useCaseModels[key] = model;
      this._useCases[key].next({
        ...model,
      });
    }
  }

  getUseCase<T>(key: string): Observable<T> {
    const usecase = this._useCases[key];
    if (!usecase) {
      this._useCases[key] = new ReplaySubject<any>(1);
      return this._useCases[key];
    }
    return usecase;
  }

}
