import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';

@Component({
  selector: 'app-view-order-cell',
  template: `
    @if (enabled()) {
      <button class="btn btn-outline-secondary btn-sm" (click)="view()">
        View Order
      </button>
    }
  `,
})
export class ViewOrderCell implements ICellRendererAngularComp {
  private readonly router = inject(Router);
  protected readonly enabled = signal(false);

  agInit(params: ICellRendererParams): void {
    this.enabled.set(!!params.data);
  }

  refresh(params: ICellRendererParams): boolean {
    this.enabled.set(!!params.data);
    return true;
  }

  view(): void {
    this.router.navigate(['/portfolio/dashboard']);
  }
}
