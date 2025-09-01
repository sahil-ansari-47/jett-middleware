import { Component, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogService } from '../../services/dialog';
@Component({
  selector: 'app-login-dialog',
  imports: [CommonModule],
  templateUrl: './login-dialog.html',
  styles: ``,
})
export class LoginDialog {
  private dialog = inject(DialogService);

  login(provider: 'google' | 'github') {
    window.location.href = `http://localhost:3000/auth/${provider}`;
  }

  close(){
    this.dialog.close()
  }
}
