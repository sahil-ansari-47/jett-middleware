import { CommonModule } from '@angular/common';
import {
  Component,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges,
} from '@angular/core';
import { animate, style, transition, trigger } from '@angular/animations';

type LoadingState = { text: string };

@Component({
  selector: 'app-mutli-step-loader',
  imports: [CommonModule],
  templateUrl: './mutli-step-loader.html',
  animations: [
    trigger('fade', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('300ms ease-out', style({ opacity: 1 })),
      ]),
      transition(':leave', [animate('300ms ease-in', style({ opacity: 0 }))]),
    ]),
  ],
  styles: `:host {
        display: contents;
      }`,
})
export class MultiStepLoaderComponent implements OnChanges, OnDestroy {
  @Input() loadingStates: LoadingState[] = [];
  @Input() loading = false;
  @Input() duration = 2000;
  @Input() loop = true;

  currentState = 0;
  private timerId: any = null;

  get translateY(): string {
    // Matches y: -(value * 40)
    return `translateY(-${this.currentState * 40}px)`;
  }

  getOpacity(index: number): number {
    // Matches opacity falloff: Math.max(1 - distance * 0.2, 0)
    const distance = Math.abs(index - this.currentState);
    return Math.max(1 - distance * 0.2, 0);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes['loading'] ||
      changes['duration'] ||
      changes['loop'] ||
      changes['loadingStates']
    ) {
      this.setupTimer();
    }
  }

  private setupTimer(): void {
    if (this.timerId) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }

    if (!this.loading) {
      this.currentState = 0;
      return;
    }

    this.timerId = setTimeout(() => {
      if (!this.loadingStates?.length) return;
      const last = this.loadingStates.length - 1;

      if (this.loop) {
        this.currentState =
          this.currentState === last ? 0 : this.currentState + 1;
      } else {
        this.currentState = Math.min(this.currentState + 1, last);
      }

      this.setupTimer();
    }, this.duration);
  }

  ngOnDestroy(): void {
    if (this.timerId) {
      clearTimeout(this.timerId);
    }
  }
}
