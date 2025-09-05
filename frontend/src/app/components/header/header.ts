import { Component, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { UserService } from '../../services/user';
import { DialogService } from '../../services/dialog';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.html',
})
export class Header {
  private dialog = inject(DialogService);
  private platformId = inject(PLATFORM_ID);
  private apiUrl = 'https://jett-middleware.onrender.com';

  constructor(public userService: UserService) {
    // Only fetch user if NOT server-side
    if (isPlatformBrowser(this.platformId)) {
      this.fetchCurrentUser();
    }
  }

  fetchCurrentUser() {
    fetch(`${this.apiUrl}/api/auth/me`, { credentials: 'include' })
      .then((res) => res.json())
      .then((user) => {
        if (user){
          console.log(user);
          this.userService.setUser(user)
        };
      });
  }
  openLogin() {
    this.dialog.openDialog();
  }
  logout() {
    fetch(`${this.apiUrl}/api/logout`, { credentials: 'include' }).then(() =>{
      this.userService.clearUser();
      window.location.reload();
    });
  }

}
