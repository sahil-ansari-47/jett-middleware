import { Component, Input, OnDestroy, SimpleChanges, OnChanges } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-card',
  templateUrl: './card.html',
})
export class Card implements OnChanges, OnDestroy {
  @Input() project: any; // you can strongly type if you have an interface
  private pollSub?: Subscription;
  private apiUrl = 'http://localhost:3000/api/update-status'; // 🔹 change to your backend

  constructor(private http: HttpClient) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['project'] && this.project) {
      this.startPolling();
    }
  }

  ngOnDestroy() {
    this.stopPolling();
  }

  private startPolling() {
    console.log('started polling for', this.project.deploy_id);
    if (this.project.status === 'uploaded' || this.project.status === 'building') {
      this.pollSub = interval(1000).subscribe(() => {
        this.http
          .patch<any>(this.apiUrl, { deploy_id: this.project.deploy_id })
          .subscribe((updated) => {
            // update project status when API responds
            this.project.status = updated.status;
            this.project.deployed_url = updated.deployed_url;

            // stop polling once status changes to deployed or failed
            if (updated.status === 'deployed' || updated.status === 'failed') {
              this.stopPolling();
            }
          });
      });
    }
  }

  private stopPolling() {
    if (this.pollSub) {
      this.pollSub.unsubscribe();
      this.pollSub = undefined;
    }
  }
}
