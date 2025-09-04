// deploy.service.ts
import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LoadingService {
  private readonly _loading = signal(false);

  readonly loading = this._loading.asReadonly();

  startLoading() {
    this._loading.set(true);
  }

  stopLoading() {
    this._loading.set(false);
  }

  isLoading() {
    return this._loading();
  }
}
