import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

function _window(): Window | null {
  return typeof window !== 'undefined' ? window : null;
}

@Injectable({ providedIn: 'root' })
export class WindowRef {
  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  get nativeWindow(): Window | null {
    return isPlatformBrowser(this.platformId) ? _window() : null;
  }
}
