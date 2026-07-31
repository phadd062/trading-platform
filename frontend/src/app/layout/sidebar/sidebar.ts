import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faBars, faTags, faExternalLink, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import { faBuilding } from '@fortawesome/free-regular-svg-icons';
import { TokenService } from '../../core/token-service';

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive, FaIconComponent],
  templateUrl: './sidebar.html',
  styles: ':host { display: contents; }',
})
export class Sidebar {
  tokens = inject(TokenService);
  expanded = signal(true);
  extraOpen = signal(false);
  faBars = faBars;
  faBuilding = faBuilding;
  faTags = faTags;
  faExternalLink = faExternalLink;
  faSignOut = faSignOutAlt;

  toggleSidebar = () => {
    this.expanded.update((expandedBool) => !expandedBool);
  };

  toggleExtra = () => {
    this.extraOpen.update((extraOpenBool) => !extraOpenBool);
  };

  logout = () => {
    this.tokens.logout();
  };
}
