import { CommonModule } from '@angular/common';
import {
  Component,
  Input,
  OnDestroy,
  DoCheck,
} from '@angular/core';
import { LoadingService } from '../../services/loading-service';
import { animate, style, transition, trigger } from '@angular/animations';

type LoadingState = { text: string };

@Component({
  selector: 'app-mutli-step-loader',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './multi-step-loader.html',
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
export class MultiStepLoaderComponent implements DoCheck, OnDestroy {
  @Input() loadingStates: LoadingState[] = [];
  @Input() duration = 2000;
  @Input() loop = true;

  currentState = 0;
  private timerId: any = null;

  constructor(public loadingService: LoadingService) {}

  get loading(): boolean {
    return this.loadingService.isLoading(); // ✅ always get current service state
  }

  get translateY(): string {
    return `translateY(-${this.currentState * 40}px)`;
  }

  getOpacity(index: number): number {
    const distance = Math.abs(index - this.currentState);
    return Math.max(1 - distance * 0.2, 0);
  }

  ngDoCheck(): void {
    // Watch service state manually
    if (this.loading && !this.timerId) {
      this.setupTimer();
    }
    if (!this.loading && this.timerId) {
      clearTimeout(this.timerId);
      this.timerId = null;
      this.currentState = 0;
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
        this.setupTimer();
      } else {
        if (this.currentState < last) {
          this.currentState++;
          this.setupTimer();
        } else {
          // ✅ stop after one run
          this.loadingService.stopLoading();
        }
      }
    }, this.duration);
  }

  ngOnDestroy(): void {
    if (this.timerId) {
      clearTimeout(this.timerId);
    }
  }
}
