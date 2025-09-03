import {
  Component,
  inject,
  PLATFORM_ID,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { UserService } from '../../services/user';
import { DialogService } from '../../services/dialog';
import { environment } from '../../../environments/environment';
interface Repo {
  id: number;
  name: string;
  username: string;
  lastCommit: string;
}
@Component({
  selector: 'app-new-dialog',
  imports: [FormsModule, CommonModule],
  templateUrl: './new-dialog.html',
  styles: ``,
})
export class NewDialog implements OnInit, OnDestroy {
  private deployendpoint = environment.deployendpoint;
  private apiUrl = environment.apiUrl;
  public searchTerm: string = '';
  public filteredRepos: Repo[] | null = null;
  private service = inject(UserService);
  private dialog = inject(DialogService);
  private platformId = inject(PLATFORM_ID);
  public user = this.service.user;
  public repos: Repo[] | null = null;
  public urlInput: string = '';
  async ngOnInit(): Promise<void> {
    if (isPlatformBrowser(this.platformId)) {
      this.repos = await this.fetchUserRepos();
      this.filteredRepos = this.repos; // initialize
    }
  }
  async ngOnDestroy(): Promise<void> {
    if (isPlatformBrowser(this.platformId)) {
      this.repos = null;
    }
  }

  private getRelativeTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();

    const seconds = Math.floor(diffMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const weeks = Math.floor(days / 7);
    const months = Math.floor(days / 30);
    const years = Math.floor(months / 12);

    if (seconds < 60) return `${seconds}s ago`;
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    if (weeks < 4) return `${weeks}w ago`;
    if (months < 12) return `${months}mo ago`;
    if (months >= 12) return `${years}y ago`;

    // fallback: show formatted date
    return date.toLocaleDateString();
  }
  onSearchChange(): void {
    if (!this.repos) return;
    this.filteredRepos = this.repos
      .filter((repo) =>
        repo.name.toLowerCase().includes(this.searchTerm.toLowerCase())
      )
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  async fetchUserRepos() {
    try {
      const res = await fetch(`${this.apiUrl}/api/github/repos`, {
        credentials: 'include',
      });
      const repos = await res.json();
      console.log(repos);
      const mappedRepos = repos.map((repo: any) => ({
        id: repo.id,
        name: repo.name,
        username: repo.owner.login,
        lastCommit: this.getRelativeTime(repo.pushed_at), // GitHub API field for last commit date
      }));
      return mappedRepos;
    } catch (err) {
      console.error('Error fetching repos:', err);
      return [];
    }
  }

  startdeploywithUrl(repoUrl: string) {
    console.log(repoUrl);
    try {
      if (repoUrl === '') console.log('url is empty');
      fetch(`${this.deployendpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ repoUrl: repoUrl }),
      })
        .then((response) => response.json())
        .then(async (data) => {
          console.log(data);
          return await fetch(`${this.apiUrl}/api/create-project`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              repoUrl: repoUrl,
              deploy_id: data.id,
            }),
          });
        });
    } catch (err) {
      console.log(err);
    }
  }
  startdeploy(repo: Repo) {
    console.log(repo);
    fetch(`${this.deployendpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        repoUrl: `https://github.com/${repo.username}/${repo.name}`,
      }),
    })
      .then((response) => response.json())
      .then(async (data) => {
        console.log(data);
        return await fetch(`${this.apiUrl}/api/create-project`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            repoUrl: `https://github.com/${repo.username}/${repo.name}`,
            deploy_id: data.id,
          }),
        });
      });
  }
  close() {
    this.dialog.closeDialog();
  }
}
