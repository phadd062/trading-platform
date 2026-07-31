import { Component, inject, signal } from "@angular/core";
import { Router } from "@angular/router";
import { FaIconComponent } from "@fortawesome/angular-fontawesome";
import { faSearch, faClockRotateLeft } from "@fortawesome/free-solid-svg-icons";
import { PageTitle } from "../../shared/page-title/page-title";
import { OrdersGrid } from "./orders-grid/orders-grid";

@Component({
  selector: "app-search",
  imports: [FaIconComponent, PageTitle, OrdersGrid],
  templateUrl: "./search.html",
})
export class Search {
  router = inject(Router);

  accordionOpen = signal(true);
  faSearch = faSearch;
  faClockRotateLeft = faClockRotateLeft;

  strategy = signal("");
  symbol = signal("");
  side = signal("");
  orderType = signal("");

  toggleAccordion() {
    this.accordionOpen.update((accordionOpenBool) => !accordionOpenBool);
  }

  submit(event: Event) {
    event.preventDefault();
    const queryParams: Record<string, string> = {};
    if (this.strategy()) queryParams["strategy"] = this.strategy();
    if (this.symbol()) queryParams["symbol"] = this.symbol();
    if (this.side()) queryParams["side"] = this.side();
    if (this.orderType()) queryParams["order_type"] = this.orderType();
    this.router.navigate([], { queryParams });
  }

  clearFilters() {
    this.strategy.set("");
    this.symbol.set("");
    this.side.set("");
    this.orderType.set("");
    this.router.navigate([], { queryParams: {} });
  }
}
