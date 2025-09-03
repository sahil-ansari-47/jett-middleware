import { Component, inject } from '@angular/core';
import { LazyLoadDirective } from '../directives/lazyloader';
import { UserService } from '../services/user';
import { DialogService } from '../services/dialog';
@Component({
  selector: 'app-home',
  imports: [LazyLoadDirective],
  templateUrl: './home.html',
  styles: ``
})
export class Home {
  public user = inject(UserService)
  public dialog = inject(DialogService)

  deploybutton() {
    if(!this.user.user) this.dialog.openDialog();
    else window.location.href = '/dashboard';
  }
}
