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
  private apiUrl = environment.apiUrl;
  login(provider: 'google' | 'github') {
    window.location.href = `${this.apiUrl}/api/auth/${provider}`;
  }

  close(){
    this.dialog.closeDialog()
  }
}
