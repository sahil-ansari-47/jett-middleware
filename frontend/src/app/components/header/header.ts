import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { UserService } from '../../services/user';
import { DialogService } from '../../services/dialog';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './header.html',
})
export class Header {
  private dialog = inject(DialogService);

  constructor(public userService: UserService) {
    this.fetchCurrentUser();
  }

  fetchCurrentUser(){
    fetch('http://localhost:3000/auth/me', {credentials: 'include'})
    .then(res=>res.json())
    .then(user=>{
      if(user) this.userService.setUser(user)
    })
  }
  openLogin() {
    this.dialog.openLogin();
  }
  logout() {
    fetch('http://localhost:3000/logout', { credentials: 'include' }).then(() =>
      this.userService.clearUser()
    );
  }
}
