import {
  Directive,
  ElementRef,
  AfterViewInit,
  OnDestroy,
  Inject,
  PLATFORM_ID,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import {
  fromEvent,
  Observable,
  Subscription,
} from 'rxjs';
import { map } from 'rxjs/operators';
import { WindowRef } from '../services/window-ref';

@Directive({
  selector: '[appInteractiveBubble]',
  standalone: true,
})
export class InteractiveBubbleDirective implements AfterViewInit, OnDestroy {
  private sub = new Subscription();
  private isBrowser: boolean;

  constructor(
    private el: ElementRef,
    private winRef: WindowRef,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngAfterViewInit(): void {
    if (!this.isBrowser) return;

    const win = this.winRef.nativeWindow;
    if (!win) return;

    const bubble = this.el.nativeElement as HTMLDivElement;
    bubble.style.position = 'fixed';
    bubble.style.pointerEvents = 'none';
    bubble.style.willChange = 'transform';

    let curX = 0,
      curY = 0,
      tgX = 0,
      tgY = 0,
      prevX = 0,
      prevY = 0;

    const mouseMove$ = fromEvent<MouseEvent>(win, 'mousemove').pipe(
      map((event) => ({ x: event.clientX, y: event.clientY }))
    );

    this.sub.add(
      mouseMove$.subscribe((pos) => {
        tgX = pos.x;
        tgY = pos.y;
      })
    );

    const animation$ = new Observable<number>((observer) => {
      const loop = () => {
        observer.next(0);
        this.winRef.nativeWindow?.requestAnimationFrame(loop);
      };
      loop();
    });

    this.sub.add(
      animation$.subscribe(() => {
        // Smooth follow
        curX += (tgX - curX) / 12;
        curY += (tgY - curY) / 12;

        // Movement delta
        const dx = curX - prevX;
        const dy = curY - prevY;
        const speed = Math.sqrt(dx * dx + dy * dy);

        // Direction angle
        const angle = Math.atan2(dy, dx) * (180 / Math.PI);

        // Stretch based on speed
        const stretch = 1 + Math.min(speed / 50, 0.5);
        const shrink = 1 / stretch;

        // GPU-accelerated transform
        bubble.style.transform = `
          translate3d(${Math.round(curX)}px, ${Math.round(curY)}px, 0)
          translate(-50%, -50%)
          rotate(${angle}deg)
          scale(${stretch}, ${shrink})
        `;

        prevX = curX;
        prevY = curY;
      })
    );
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
}
