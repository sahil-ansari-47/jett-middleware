import { animate, style, transition, trigger } from '@angular/animations';
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { inject, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { ToasterService } from '../../services/toastr';
import { Toast } from '../../services/toastr';

@Component({
  selector: 'app-toastr',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toastr.html',
  animations: [
    trigger('toastAnimation', [
      transition(':enter', [
        style({ transform: 'translateY(100%)', opacity: 0 }),
        animate('300ms ease-out', style({ transform: 'translateY(0)', opacity: 1 }))
      ]),
      transition(':leave', [
        animate('300ms ease-in', style({ transform: 'translateY(100%)', opacity: 0 }))
      ])
    ])
  ]
})
export class ToastrComponent implements OnInit, OnDestroy {

  private toasterService = inject(ToasterService);

  toasts: Toast[] = [];
  private subscription: Subscription= new Subscription();

  ngOnInit(): void {
    this.subscription = this.toasterService.toasts$.subscribe(toasts => this.toasts = toasts)
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe()
    }
  }

  removeToast(id: number) {
    this.toasterService.remove(id)
  }
}