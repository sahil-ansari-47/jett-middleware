import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { from, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

export const authGuard: CanActivateFn = () => {
  const router = inject(Router);

  return from(
    fetch('http://localhost:3000/auth/me', {
      method: 'GET',
      credentials: 'include',
    })
  ).pipe(
    switchMap((res) => res.json()),
    map((user) => {
      console.log('authGuard user:', user);
      if (user) {
        return true;
      } else {
        router.navigate(['/']);
        return false;
      }
    }),
    catchError(() => {
      router.navigate(['/']);
      return of(false);
    })
  );
};
