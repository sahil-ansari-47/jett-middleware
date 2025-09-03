import { CanActivateFn, Router } from '@angular/router';
import { isPlatformServer } from '@angular/common';
import { inject, PLATFORM_ID } from '@angular/core';

export const authGuard: CanActivateFn = async() => {
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);

  const apiUrl = isPlatformServer(platformId)
    ? process.env['API_URL'] || 'http://localhost:3000'
    : 'http://localhost:3000';

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
