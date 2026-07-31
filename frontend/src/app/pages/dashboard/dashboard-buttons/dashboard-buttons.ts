import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faChartArea } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-dashboard-buttons',
  imports: [RouterLink, FaIconComponent],
  templateUrl: './dashboard-button.html',
})
export class DashboardButtons {
  faChartArea = faChartArea;
  strategies = ['Momentum', 'RSI'];
}
