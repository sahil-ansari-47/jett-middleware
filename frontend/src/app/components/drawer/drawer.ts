import { Component, inject } from '@angular/core';
import { NgClass } from '@angular/common';
import { DrawerService } from '../../services/drawer';
import { UserService } from '../../services/user';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-drawer',
  standalone: true,
  imports: [NgClass, RouterModule],
  templateUrl: './drawer.html',
})
export class DrawerComponent {
  public user = inject(UserService);
  constructor(public drawer: DrawerService) {}

}
