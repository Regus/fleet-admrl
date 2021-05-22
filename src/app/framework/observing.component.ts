import { Component, OnDestroy } from '@angular/core';
import { Observable, Subscription } from 'rxjs';

@Component({
  template: ''
})
export abstract class ObservingComponent implements OnDestroy  {
  protected subscriptions: Subscription[] = [];

  constructor(
  ) {
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  subscribe<T>(obs: Observable<T>, func: (value: T) => void) {
    this.subscriptions.push(
      obs.subscribe(func)
    );
  }


}
