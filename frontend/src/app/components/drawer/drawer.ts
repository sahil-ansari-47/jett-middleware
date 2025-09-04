import { Component, inject, Input } from '@angular/core';
import { NgClass } from '@angular/common';
import { DrawerService } from '../../services/drawer';
import { UserService } from '../../services/user';
import { RouterModule } from '@angular/router';
import { environment } from '../../../environments/environment';
@Component({
  selector: 'app-drawer',
  standalone: true,
  imports: [NgClass, RouterModule],
  templateUrl: './drawer.html',
})
export class DrawerComponent {
  @Input() userprojects: number = 0;
  @Input() communityprojects: number = 0;
  public user = inject(UserService);
  constructor(public drawer: DrawerService) {}
  private apiUrl = environment.apiUrl;
  logout() {
    fetch(`${this.apiUrl}/api/logout`, { credentials: 'include' }).then(() =>{
      this.user.clearUser();
      window.location.reload();
    });
  }

}
