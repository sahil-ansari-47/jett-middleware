import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class DrawerService {
  private readonly _isOpen = signal(true);
  readonly isOpen = this._isOpen.asReadonly();

  constructor() {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      this._isOpen.set(false);
    }
  }

  open() {
    this._isOpen.set(true);
  }

  close() {
    this._isOpen.set(false);
  }

  toggle() {
    this._isOpen.update(v => !v);
  }
}
