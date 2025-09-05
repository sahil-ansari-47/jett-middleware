import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogService } from '../../services/dialog';
import { environment } from '../../../environments/environment';
@Component({
  selector: 'app-login-dialog',
  imports: [CommonModule],
  templateUrl: './login-dialog.html',
  styles: ``,
})
export class LoginDialog {
  private dialog = inject(DialogService);
  private apiUrl = 'https://jett-middleware.vercel.app';
  login(provider: 'google' | 'github') {
    window.location.href = `https://jett-middleware.vercel.app/api/auth/${provider}`;
  }

  close(){
    this.dialog.closeDialog()
  }
}
