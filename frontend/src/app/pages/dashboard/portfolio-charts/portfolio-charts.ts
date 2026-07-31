import { Component, computed, input } from "@angular/core";
import { BaseChartDirective } from "ng2-charts";
import { ChartConfiguration } from "chart.js";
import { PortfolioResponse } from "../../../core/models";
import { PALETTE } from "../../../core/palette";

@Component({
  selector: "app-portfolio-charts",
  imports: [BaseChartDirective],
  templateUrl: "./portfolio-charts.html",
})
export class PortfolioCharts {
  data = input.required<PortfolioResponse>();
  primary = input("momentum");

  primarySnapshot = computed(() => this.data()[this.primary()]);

  symbols = computed(() =>
    Object.keys(this.primarySnapshot()?.positions ?? {}),
  );

  doughnutData = computed<ChartConfiguration<"doughnut">["data"]>(() => {
    const strategies = Object.keys(this.data());
    return {
      labels: ["Realized PNL", "Unrealized PNL", "Net PNL"],
      datasets: strategies.map((strategy) => ({
        data: [
          this.data()[strategy].realized_pnl,
          this.data()[strategy].unrealized_pnl,
          this.data()[strategy].net_pnl,
        ],
        backgroundColor: [PALETTE.one.rgb, PALETTE.five.rgb, PALETTE.three.rgb],
      })),
    };
  });

  doughnutOptions = computed<ChartConfiguration<"doughnut">["options"]>(() => {
    const strategies = Object.keys(this.data());
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        tooltip: {
          callbacks: {
            label: (ctx) => `${strategies[ctx.datasetIndex]}: ${ctx.parsed}`,
          },
        },
      },
    };
  });

  positionsData = computed<ChartConfiguration<"bar">["data"]>(() => {
    const snapshot = this.primarySnapshot();
    const symbols = this.symbols();
    return {
      labels: symbols,
      datasets: [
        {
          label: "Positions",
          data: symbols.map((symbol) => snapshot?.positions[symbol] ?? 0),
          backgroundColor: PALETTE.one.rgb,
        },
      ],
    };
  });

  avgCostData = computed<ChartConfiguration<"bar">["data"]>(() => {
    const snapshot = this.primarySnapshot();
    const symbols = this.symbols();
    return {
      labels: symbols,
      datasets: [
        {
          label: "Average Cost",
          data: symbols.map((symbol) => snapshot?.average_cost[symbol] ?? 0),
          backgroundColor: PALETTE.five.rgb,
        },
      ],
    };
  });

  positionsOptions = PortfolioCharts.barOptions("Positions by Symbol");
  avgCostOptions = PortfolioCharts.barOptions("Average Cost by Symbol");

  static barOptions(title: string): ChartConfiguration<"bar">["options"] {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: { display: true, text: title },
        legend: { display: false },
      },
    };
  }
}
