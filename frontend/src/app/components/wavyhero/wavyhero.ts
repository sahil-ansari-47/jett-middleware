import {
  type AfterViewInit,
  Component,
  type ElementRef,
  HostListener,
  Input,
  type OnDestroy,
  ViewChild,
} from '@angular/core';
import { createNoise3D } from 'simplex-noise';
import { CommonModule } from '@angular/common';

type Speed = 'slow' | 'fast';

@Component({
  selector: 'app-wavy-hero',
  imports: [CommonModule],
  standalone: true,
  templateUrl: './wavyhero.html',
})
export class WavyHeroComponent implements AfterViewInit, OnDestroy {
  @ViewChild('canvas', { static: true })
  canvasRef!: ElementRef<HTMLCanvasElement>;

  // Inputs to mirror the React component API
  @Input() containerRef?: HTMLElement;
  @Input() colors: string[] = [
    '#38bdf8',
    '#818cf8',
    '#c084fc',
    '#e879f9',
    '#22d3ee',
  ];
  @Input() waveWidth = 50;
  @Input() backgroundFill = 'black';
  @Input() blur = 10;
  @Input() speed: Speed = 'fast';
  @Input() waveOpacity = 0.5;
  // Optional Tailwind class hooks for container and content
  @Input() containerClass = '';
  @Input() contentClass = '';

  private noise = createNoise3D();
  private ctx!: CanvasRenderingContext2D;
  private w = 0;
  private h = 0;
  private nt = 0;
  private animationId: number | null = null;
  isSafari = false;

  ngAfterViewInit(): void {
    const canvas = this.canvasRef.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    this.ctx = ctx;

    // Safari detection for CSS filter fallback
    this.isSafari =
      typeof window !== 'undefined' &&
      navigator.userAgent.includes('Safari') &&
      !navigator.userAgent.includes('Chrome');

    this.resizeCanvas();
    // Canvas filter (CSS fallback added in template for Safari)
    this.ctx.filter = `blur(${this.blur}px)`;
    this.nt = 0;
    this.start();
  }

  @HostListener('window:resize')
  onResize() {
    this.resizeCanvas();
    // Keep blur consistent on resize
    if (this.ctx) {
      this.ctx.filter = `blur(${this.blur}px)`;
    }
  }

  ngOnDestroy(): void {
    this.stop();
  }

  private start() {
    this.stop();
    const render = () => {
      this.renderFrame();
      this.animationId = requestAnimationFrame(render);
    };
    this.animationId = requestAnimationFrame(render);
  }

  private stop() {
    if (this.animationId != null) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  private resizeCanvas() {
    const canvas = this.canvasRef.nativeElement;

    if (this.containerRef) {
      // ✅ use parent container’s bounding box
      const rect = this.containerRef.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = 400;
    } else {
      // fallback to full viewport
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    this.w = canvas.width;
    this.h = canvas.height;
  }

  private getSpeed(): number {
    switch (this.speed) {
      case 'slow':
        return 0.001;
      case 'fast':
      default:
        return 0.002;
    }
  }

  private drawWave(n: number) {
    this.nt += this.getSpeed();
    const ctx = this.ctx;
    for (let i = 0; i < n; i++) {
      ctx.beginPath();
      ctx.lineWidth = this.waveWidth;
      ctx.strokeStyle = this.colors[i % this.colors.length];
      for (let x = 0; x < this.w; x += 5) {
        const y = this.noise(x / 800, 0.3 * i, this.nt) * 100;
        ctx.lineTo(x, y + this.h * 0.5);
      }
      ctx.stroke();
      ctx.closePath();
    }
  }

  private renderFrame() {
    const ctx = this.ctx;
    ctx.globalAlpha = this.waveOpacity;
    ctx.fillStyle = this.backgroundFill;
    ctx.fillRect(0, 0, this.w, this.h);
    this.drawWave(5);
  }
}
