import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { TokenService } from './token-service';


export const authGuard: CanActivateFn = async () => {
  const tokens = inject(TokenService);
  const router = inject(Router);

  const authenticated = await tokens.isAuthenticated();
  return authenticated ? true : router.createUrlTree(['/login']);
};
