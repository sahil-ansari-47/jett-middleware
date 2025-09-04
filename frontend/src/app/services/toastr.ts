import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
export interface Toast {
  id: number;
  message: string;
  type: 'uploaded' | 'building' | 'deployed' | 'failed';
}
@Injectable({
  providedIn: 'root',
})

export class ToasterService {
  private toasts: Toast[] = [];
  private toastSubject = new BehaviorSubject<Toast[]>([]);
  toasts$ = this.toastSubject.asObservable();
  private show(
    message: string,
    type: 'uploaded' | 'building' | 'deployed' | 'failed'
  ) {
    const id = Date.now();
    const toast: Toast = { id, message, type };
    this.toasts.push(toast);
    this.toastSubject.next(this.toasts);
    setTimeout(() => this.remove(id), 3000);
    return id;
  }
  remove(id: number) {
    this.toasts = this.toasts.filter((t) => t.id !== id);
    this.toastSubject.next(this.toasts);
  }
  upload(message: string): number {
    return this.show(message, 'uploaded');
  }
  build(title: string, message: string): number {
    return this.show(message, 'building');
  }
  success(message: string, type: 'uploaded' | 'building' | 'deployed' | 'failed'): number {
    return this.show(message, type);
  }
}
