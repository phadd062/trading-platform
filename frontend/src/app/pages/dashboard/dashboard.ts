import { Component, computed } from "@angular/core";
import { httpResource } from "@angular/common/http";
import { PortfolioResponse } from "../../core/models";
import { PageTitle } from "../../shared/page-title/page-title";
import { CardDisplay } from "../../shared/card-display/card-display";
import { Loading } from "../../shared/loading/loading";
import { PortfolioCharts } from "./portfolio-charts/portfolio-charts";
import { DashboardButtons } from "./dashboard-buttons/dashboard-buttons";

@Component({
  selector: "app-dashboard",
  imports: [PageTitle, CardDisplay, Loading, PortfolioCharts, DashboardButtons],
  templateUrl: "./dashboard.html",
})
export class Dashboard {
  portfolio = httpResource<PortfolioResponse>(
    () => "/api/portfolio/all-strategies",
  );

  momentum = computed(() => this.portfolio.value()?.["momentum"]);
}
