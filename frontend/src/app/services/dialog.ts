import { Injectable, inject } from '@angular/core';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { LoginDialog } from '../components/login-dialog/login-dialog';

@Injectable({ providedIn: 'root' })
export class DialogService {
  private overlay = inject(Overlay);
  private overlayRef: OverlayRef | null = null;

  openLogin() {
    if (this.overlayRef) return; 

    this.overlayRef = this.overlay.create({
      hasBackdrop: true,
      backdropClass: ['bg-black/50', 'backdrop-blur-sm'],
      positionStrategy: this.overlay
        .position()
        .global()
        .centerHorizontally()
        .centerVertically(),
    });

    const portal = new ComponentPortal(LoginDialog);
    this.overlayRef.attach(portal);

    this.overlayRef.backdropClick().subscribe(() => this.close());
  }

  close() {
    this.overlayRef?.dispose();
    this.overlayRef = null;
  }
}
