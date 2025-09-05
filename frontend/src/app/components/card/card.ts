import {
  Component,
  Input,
  OnDestroy,
  SimpleChanges,
  OnChanges,
  inject,
} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { interval, Subscription } from 'rxjs';
import { Project } from '../../models/project.model';
import { ToasterService } from '../../services/toastr';
import { environment } from '../../../environments/environment';
@Component({
  selector: 'app-card',
  templateUrl: './card.html',
})
export class Card implements OnChanges, OnDestroy {
  @Input() project!: Project; // you can strongly type if you have an interface
  private pollSub?: Subscription;
  private apiUrl = `${environment.apiUrl}/api/update-status`; // 🔹 change to your backend
  private toasterService = inject(ToasterService)
  private counts = {
    'uploaded': 0,
    'building': 0,
    'deployed': 0,
    'failed': 0,
  }
  constructor(private http: HttpClient) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['project'] && this.project.status) {
      this.startPolling();
      // const message= this.project.status === 'deployed' ? 'Project has been deployed successfully' : this.project.status === 'uploaded' ? 'Uploaded to Cloud' : 'Building ffiles...';
      // this.showToast(message, this.project.status);
    }
  }

  ngOnDestroy() {
    this.stopPolling();
  }
  public startPolling() {
    if (this.pollSub || !this.project) return; // prevent multiple subscriptions
    // if (!this.project) return; // prevent multiple subscriptions
    
    if (['uploaded', 'building'].includes(this.project.status)) {
      this.pollSub = interval(5000).subscribe(() => {
        this.http
          .patch<any>(this.apiUrl, { deploy_id: this.project.deploy_id })
          .subscribe((updated) => {
            this.project.status = updated.status;
            this.project.deployed_url = updated.deployed_url;
            console.log(this.project.status);
            console.log(this.project.deployed_url);
            const message= this.project.status === 'deployed' ? 'Project has been deployed successfully' : this.project.status === 'uploaded' ? 'Uploaded to Cloud' : 'Building ffiles...';
            if(this.counts[this.project.status] === 0) {
              
              this.showToast(message, this.project.status);
              this.counts[this.project.status]++;
            };
            if (['deployed', 'failed'].includes(updated.status)) {
              this.stopPolling();
            }
          });
      });
    }
  }

  showToast(msg:string, type: 'uploaded' | 'building' | 'deployed' | 'failed') {
    console.log(msg, type);
    this.toasterService.success(msg, type);
  }
  public stopPolling() {
    if (this.pollSub) {
      this.pollSub.unsubscribe();
      this.pollSub = undefined;
    }
  }
}
