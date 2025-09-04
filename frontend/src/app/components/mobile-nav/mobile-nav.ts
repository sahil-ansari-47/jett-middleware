import { Component, inject, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../../services/user';
import { RouterModule } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-mobile-nav',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './mobile-nav.html',
  styles: ``
})
export class MobileNav {
  private router = inject(Router);
  public service = inject(UserService);
  private platformId = inject(PLATFORM_ID);

  get isDashboard(): boolean {
    const isBrowser = isPlatformBrowser(this.platformId);

    if (!isBrowser) return false; // avoid SSR crash

    const hash = window.location.hash;
    return (
      this.router.url === '/dashboard' ||
      hash === '#projects' ||
      hash === '#community'
    );
  }
}
