import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { environment } from '../../environments/environment';

export const authGuard: CanActivateFn = async() => {
  const router = inject(Router);

  const apiUrl = 'https://jett-middleware.onrender.com';

  try {
    const res = await fetch(`${apiUrl}/api/auth/me`, {
      method: 'GET',
      credentials: 'include',
    });

    // Parse JSON
    const user = await res.json();

    if (user) {
      return true;
    } else {
      router.navigate(['/']);
      return false;
    }
  } catch (err) {
    console.error('authGuard error:', err);
    router.navigate(['/']);
    return false;
  }
};
