// lazy-load.directive.ts
import {
  Directive,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  Renderer2,
} from '@angular/core';

@Directive({
  selector: '[appLazyLoad]'
})
export class LazyLoadDirective implements OnInit, OnDestroy {
  @Input('appLazyLoad') src?: string;
  @Input() srcset?: string;
  @Input() loadingImage?: string; // optional placeholder while off-screen
  @Input() errorImage?: string;   // optional fallback on error
  @Input() rootMargin: string = '200px'; // how early to start loading

  @Output() load = new EventEmitter<Event>();
  @Output() error = new EventEmitter<Event>();

  private observer?: IntersectionObserver;

  constructor(private el: ElementRef<HTMLElement>, private renderer: Renderer2) {}

  ngOnInit(): void {
    const node = this.el.nativeElement;
    // apply placeholder if provided
    if (this.loadingImage) {
      if (node.tagName.toLowerCase() === 'img') {
        (node as HTMLImageElement).src = this.loadingImage;
      } else {
        this.renderer.setStyle(node, 'backgroundImage', `url(${this.loadingImage})`);
      }
    }

    if (typeof IntersectionObserver !== 'undefined') {
      this.observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              this.startLoading();
              this.observer?.unobserve(node);
            }
          });
        },
        { rootMargin: this.rootMargin }
      );
      this.observer.observe(node);
    } else {
      // fallback for older browsers: load immediately
      this.startLoading();
    }
  }

  private startLoading(): void {
    const node = this.el.nativeElement;
    if (node.tagName.toLowerCase() === 'img') {
      const img = node as HTMLImageElement;

      if (this.srcset) this.renderer.setAttribute(img, 'srcset', this.srcset);
      if (this.src) {
        // set decoding and loading hint
        this.renderer.setAttribute(img, 'decoding', 'async');
        this.renderer.setAttribute(img, 'loading', 'lazy'); // hint for browsers that support native lazy loading
        this.renderer.setAttribute(img, 'src', this.src);
      }

      // attach listeners
      const onLoad = (e: Event) => {
        this.load.emit(e);
        img.removeEventListener('load', onLoad);
        img.removeEventListener('error', onError);
      };
      const onError = (e: Event) => {
        if (this.errorImage) {
          img.src = this.errorImage;
        }
        this.error.emit(e);
        img.removeEventListener('load', onLoad);
        img.removeEventListener('error', onError);
      };

      img.addEventListener('load', onLoad);
      img.addEventListener('error', onError);
    } else {
      // background image
      if (this.src) {
        // create a real Image to detect load/error so we can emit events
        const testImg = new Image();
        testImg.onload = (e) => {
          this.renderer.setStyle(node, 'backgroundImage', `url(${this.src})`);
          this.load.emit(e as unknown as Event);
        };
        testImg.onerror = (e) => {
          if (this.errorImage) {
            this.renderer.setStyle(node, 'backgroundImage', `url(${this.errorImage})`);
          }
          this.error.emit(e as unknown as Event);
        };
        testImg.src = this.src;
      }
    }
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }
}
