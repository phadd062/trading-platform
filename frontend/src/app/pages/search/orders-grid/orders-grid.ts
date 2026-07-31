import { Component, effect, inject, signal } from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import { ActivatedRoute, Params } from "@angular/router";
import { map } from "rxjs";
import { AgGridAngular } from "ag-grid-angular";
import {
  AllCommunityModule,
  ColDef,
  GridApi,
  GridReadyEvent,
  IDatasource,
  IGetRowsParams,
  ModuleRegistry,
  provideGlobalGridOptions,
} from "ag-grid-community";
import { ApiService } from "../../../core/api-service";
import { LoadingCell } from "../loading-cell/loading-cell";
import { ViewOrderCell } from "../view-order-cell/view-order-cell";

ModuleRegistry.registerModules([AllCommunityModule]);
provideGlobalGridOptions({ theme: "legacy" });

@Component({
  selector: "app-orders-grid",
  imports: [AgGridAngular],
  templateUrl: "./orders-grid.html",
})
export class OrdersGrid {
  api = inject(ApiService);
  route = inject(ActivatedRoute);

  gridApi?: GridApi;
  gridReady = signal(false);

  search = toSignal(
    this.route.queryParams.pipe(
      map((params) => OrdersGrid.toQueryString(params)),
    ),
    { initialValue: "" },
  );

  defaultColDef: ColDef = { resizable: true, sortable: false };

  columnDefs: ColDef[] = [
    {
      headerName: "",
      maxWidth: 70,
      valueGetter: "node.id",
      cellRenderer: LoadingCell,
      pinned: "left",
    },
    { headerName: "Symbol", field: "symbol", width: 100 },
    { headerName: "Strategy", field: "strategy_id", width: 200 },
    { headerName: "Quantity", field: "quantity", width: 100 },
    { headerName: "Side", field: "side", width: 100 },
    { headerName: "Order Type", field: "order_type", width: 150 },
    { headerName: "Order ID", field: "order_id", width: 350 },
    { headerName: "Intent ID", field: "intent_id", width: 350 },
    {
      headerName: "actions",
      field: "id",
      cellRenderer: ViewOrderCell,
      width: 200,
    },
  ];

  constructor() {
    effect(() => {
      const search = this.search();
      if (this.gridReady() && this.gridApi) {
        this.gridApi.setGridOption("datasource", this.buildDatasource(search));
      }
    });
  }

  onGridReady(event: GridReadyEvent): void {
    this.gridApi = event.api;
    this.gridReady.set(true);
  }

  buildDatasource(search: string): IDatasource {
    return {
      getRows: async (params: IGetRowsParams) => {
        try {
          const rows = await this.api.getOrders(
            search,
            params.startRow,
            params.endRow,
          );
          params.successCallback(rows, rows.length);
        } catch {
          params.failCallback();
        }
      },
    };
  }

  static toQueryString(params: Params): string {
    const keys = Object.keys(params);
    if (keys.length === 0) return "";
    const usp = new URLSearchParams();
    for (const key of keys) {
      const value = params[key];
      if (Array.isArray(value)) {
        value.forEach((v) => usp.append(key, v));
      } else {
        usp.append(key, value);
      }
    }
    return `?${usp.toString()}`;
  }
}
