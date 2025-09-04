import { Injectable, inject } from '@angular/core';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { LoginDialog } from '../components/login-dialog/login-dialog';
import { NewDialog } from '../components/new-dialog/new-dialog';
import { Subject } from 'rxjs';
@Injectable({ providedIn: 'root' })
export class DialogService {
  public projectCreatedSource = new Subject<void>();
  projectCreated$ = this.projectCreatedSource.asObservable(); 
  private overlay = inject(Overlay);
  private overlayRef: OverlayRef | null = null;

  emitProjectCreated() {
    this.projectCreatedSource.next();
  }
  openDialog() {
    if (this.overlayRef) return;

    this.overlayRef = this.overlay.create({
      hasBackdrop: true,
      backdropClass: ['bg-black/50', 'backdrop-blur-sm'],
      scrollStrategy: this.overlay.scrollStrategies.block(),
      positionStrategy: this.overlay
        .position()
        .global()
        .centerHorizontally()
        .centerVertically(),
      panelClass: 'dialog-panel',
    });
    const portal = new ComponentPortal(LoginDialog);
    this.overlayRef.attach(portal);

    this.overlayRef.backdropClick().subscribe(() => this.closeDialog());
  }
  openNewProject() {
    if (this.overlayRef) return;

    this.overlayRef = this.overlay.create({
      hasBackdrop: true,
      backdropClass: ['bg-black/50', 'backdrop-blur-sm'],
      scrollStrategy: this.overlay.scrollStrategies.block(),
      positionStrategy: this.overlay
        .position()
        .global()
        .centerHorizontally()
        .centerVertically(),
      panelClass: 'dialog-panel',
    });
    const portal = new ComponentPortal(NewDialog);
    this.overlayRef.attach(portal);

    this.overlayRef.backdropClick().subscribe(() => this.closeDialog());
  }

  closeDialog() {
    this.overlayRef?.dispose();
    this.overlayRef = null;
  }
}
