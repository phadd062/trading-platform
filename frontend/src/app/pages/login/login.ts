import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { form, required, submit, FormField } from '@angular/forms/signals';
import { TokenService } from '../../core/token-service';

const REDIRECT_URL = '/portfolio/dashboard';

interface LoginModel {
  username: string;
  password: string;
}

@Component({
  selector: 'app-login',
  imports: [FormField],
  templateUrl: './login.html',
})
export class Login {
  tokens = inject(TokenService);
  router = inject(Router);

  showPage = signal(false);
  error = signal('');

  model = signal<LoginModel>({ username: '', password: '' });
  loginForm = form(this.model, (path) => {
    required(path.username);
    required(path.password);
  });

  constructor() {
    this.tokens.isAuthenticated().then((authenticated) => {
      if (authenticated) {
        this.router.navigateByUrl(REDIRECT_URL);
      } else {
        this.showPage.set(true);
      }
    });
  }

  async onSubmit() {
    this.error.set('');
    await submit(this.loginForm, async () => {
      const { username, password } = this.model();
      const status = await this.tokens.login(username, password);

      if (status === 200) {
        this.router.navigateByUrl(REDIRECT_URL);
        return;
      }

      if (status === 403) {
        this.error.set(
          'Your account has been temporarily locked for security reasons. ' +
            'Please try again later or reset your password if you continue to experience issues.',
        );
      } else {
        this.error.set("Your username and password didn't match. Please try again");
      }

      this.model.set({ username: '', password: '' });
      this.loginForm().reset();
    });
  }
}
