import { Component, signal } from "@angular/core";
import { ICellRendererAngularComp } from "ag-grid-angular";
import { ICellRendererParams } from "ag-grid-community";

@Component({
  selector: "app-loading-cell",
  template: `
    @if (rowNumber() !== null) {
      {{ rowNumber() }}
    } @else {
      <div class="spinner-border spinner-border-sm" role="status"></div>
    }
  `,
})
export class LoadingCell implements ICellRendererAngularComp {
  protected readonly rowNumber = signal<number | null>(null);

  agInit(params: ICellRendererParams): void {
    this.update(params);
  }

  refresh(params: ICellRendererParams): boolean {
    this.update(params);
    return true;
  }

  private update(params: ICellRendererParams): void {
    const value = params.value;
    this.rowNumber.set(
      value !== null && value !== undefined && value !== ""
        ? parseInt(value, 10) + 1
        : null,
    );
  }
}
