import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';

const REFRESH_TOKEN_STORAGE_KEY = 'tokenRefresh';
const TOKEN_STORAGE_KEY = 'token';

const LOGIN_TOKEN_URL = '/token/login';
const REFRESH_TOKEN_URL = '/token/refresh';

interface JwtPayload {
  exp: number;
  sub?: string;
}


@Injectable({ providedIn: 'root' })
export class TokenService {
  router = inject(Router);

  async login(username: string, password: string) {
    const response = await fetch(LOGIN_TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    if (response.ok) {
      const data = await response.json();
      localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, data.refresh);
      localStorage.setItem(TOKEN_STORAGE_KEY, data.access);
    }
    return response.status;
  }

  logout() {
    this.clearTokens();
    this.navigateToLogin();
  }

  navigateToLogin() {
    this.router.navigate(['/login'], { replaceUrl: true });
  }

  async isAuthenticated() {
    if (this.hasValidToken()) return true;
    if (!this.hasValidRefreshToken()) return false;
    return this.writeNewTokenFromRefresh();
  }

  async ensureValidAccessToken() {
    if (this.hasValidToken()) return this.getTokenFromLocalStorage();
    if (this.hasValidRefreshToken()) {
      const refreshed = await this.writeNewTokenFromRefresh();
      if (refreshed) return this.getTokenFromLocalStorage();
    }
    return null;
  }

  private async writeNewTokenFromRefresh() {
    const refreshToken = this.getRefreshTokenFromLocalStorage();
    const resp = await fetch(REFRESH_TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh: refreshToken }),
    });
    if (!resp.ok) {
      this.clearTokens();
      return false;
    }
    const json = await resp.json();
    localStorage.setItem(TOKEN_STORAGE_KEY, json.access);
    return true;
  }

  private hasValidToken() {
    const token = this.getTokenFromLocalStorage();
    return !!token && !this.isTokenExpired(token);
  }

  private hasValidRefreshToken() {
    const refreshToken = this.getRefreshTokenFromLocalStorage();
    return !!refreshToken && !this.isTokenExpired(refreshToken);
  }

  private isTokenExpired(token: string) {
    const decoded = this.parseJwt(token);
    const nowWithSkew = Date.now() + 10000;
    return decoded.exp * 1000 < nowWithSkew;
  }

  private getRefreshTokenFromLocalStorage() {
    return localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY);
  }

  private getTokenFromLocalStorage() {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  }

  private clearTokens() {
    localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
    localStorage.removeItem(TOKEN_STORAGE_KEY);
  }

  private parseJwt(token: string) {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join(''),
    );
    return JSON.parse(jsonPayload) as JwtPayload;
  }
}
