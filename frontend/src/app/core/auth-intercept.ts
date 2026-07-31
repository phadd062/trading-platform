import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { from, switchMap, throwError } from 'rxjs';
import { TokenService } from './token-service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.startsWith('/api')) {
    return next(req);
  }

  const tokens = inject(TokenService);

  return from(tokens.ensureValidAccessToken()).pipe(
    switchMap((token) => {
      if (!token) {
        tokens.navigateToLogin();
        return throwError(() => new Error('Not authenticated'));
      }
      const authReq = req.clone({
        setHeaders: { Authorization: `Bearer ${token}` },
      });
      return next(authReq);
    }),
  );
};
