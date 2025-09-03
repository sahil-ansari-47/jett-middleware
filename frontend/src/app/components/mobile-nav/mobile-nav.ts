import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../../services/user';
import { RouterModule } from '@angular/router';
@Component({
  selector: 'app-mobile-nav',
  imports: [RouterModule],
  templateUrl: './mobile-nav.html',
  styles: ``
})
export class MobileNav {
  private router = inject(Router)
  public service = inject(UserService)
  get isDashboard(): boolean {
    return this.router.url === '/dashboard' || window.location.hash === '#projects' || window.location.hash === '#community';
  }

}
