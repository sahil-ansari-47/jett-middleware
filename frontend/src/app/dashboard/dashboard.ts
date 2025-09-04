import { Component, inject, PLATFORM_ID, ViewChild } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { UserService } from '../services/user';
import { environment } from '../../environments/environment';
import { MultiStepLoaderComponent } from '../components/multi-step-loader/multi-step-loader';
import { DialogService } from '../services/dialog';
import { DrawerComponent } from '../components/drawer/drawer';
import { DrawerService } from '../services/drawer';
import { LoadingService } from '../services/loading-service';
import { WavyHeroComponent } from '../components/wavyhero/wavyhero';
import { Card } from '../components/card/card';
import { Project } from '../models/project.model';
import { ToasterService } from '../services/toastr';
import { ToastrComponent } from '../components/toastr/toastr';
import { RouterLink } from '@angular/router';
// import { ToastrService } from 'ngx-toastr';
@Component({
  selector: 'app-dashboard',
  imports: [
    CommonModule,
    DrawerComponent,
    MultiStepLoaderComponent,
    WavyHeroComponent,
    Card,
    ToastrComponent,
    RouterLink
  ],
  templateUrl: './dashboard.html',
})
export class Dashboard {
  public loading = inject(LoadingService);
  private dialog = inject(DialogService);
  private platformId = inject(PLATFORM_ID);
  private apiUrl = environment.apiUrl;
  private service = inject(UserService);
  private toasterService = inject(ToasterService);
  public user = this.service.user;
  public UserProjects: Project[] = [];
  public CommunityProjects: Project[] = [];
  constructor(
    public userService: UserService,
    public drawer: DrawerService,
    private dialogservice: DialogService,
    // private toasterService: ToasterService

  ) {
    // Only fetch user if NOT server-side
    if (isPlatformBrowser(this.platformId)) {
      this.fetchCurrentUser();
      this.fetchProjects();
    }
    this.dialogservice.projectCreated$.subscribe(() => {
      this.UserProjects = [];
      this.fetchProjects();
    });
  }
  
  showToast(msg:string, type: 'uploaded' | 'building' | 'deployed' | 'failed') {
    console.log(msg, type);
    this.toasterService.success(msg, type);
  }

  // showSuccess() {
  //   console.log('success');
  //   this.toastr.success('Project deployed successfully!', 'Success');
  // }

  // showError() {
  //   this.toastr.error('Deployment failed!', 'Error');
  // }

  loadingStates = [
    { text: 'Establishing Connection...' },
    { text: 'Fetching Project' },
    { text: 'Cloning Repository' },
    { text: 'Almost There!' },
    { text: 'Uploading to Cloud' },
  ];
  fetchCurrentUser() {
    fetch(`${this.apiUrl}/api/auth/me`, { credentials: 'include' })
      .then((res) => res.json())
      .then((user) => {
        if (user) {
          this.userService.setUser(user);
        }
      });
  }
  private getRelativeTime(date: string | Date): string {
    const now = new Date();
    let diffMs: number = 0;
    if (!(date instanceof Date)) {
      console.log('string');
      const datedate = new Date(date);
      diffMs = now.getTime() - datedate.getTime();
    } else {
      console.log('date');
      diffMs = now.getTime() - date.getTime();
    }

    const seconds = Math.floor(diffMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const weeks = Math.floor(days / 7);
    const months = Math.floor(days / 30.44); // Use average days in a month for better accuracy
    const years = Math.floor(months / 12);

    if (seconds < 60) return `${seconds}s ago`;
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    if (weeks < 4) return `${weeks}w ago`;
    if (months < 12) return `${months}mo ago`;
    if (years < 10) return `${years}y ago`;

    // fallback: show formatted date
    return new Date(date).toLocaleDateString();
  }
  createProject() {
    this.dialog.openNewProject();
  }

  fetchProjects() {
    fetch(`${this.apiUrl}/api/projects`, { credentials: 'include' })
      .then((res) => res.json())
      .then((projects: Project[]) => {
        console.log(projects);
        try {
          projects.forEach((project) => {
            if (project.user_id === this.user._id) {
              project.last_commit_datetime = this.getRelativeTime(
                project.last_commit_datetime
              );
              this.UserProjects.push(project);
            } else {
              console.log(project);
              project.createdAtString = this.getRelativeTime(project.createdAt);
              this.CommunityProjects.push(project);
            }
          });
        } catch (e) {
          console.log(e);
        }
      });
  }
}
