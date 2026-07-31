import { Component, input } from '@angular/core';

@Component({
  selector: 'app-card-display',
  template: `
    <div class="card">
      <div class="card-body">
        <div class="row align-items-center">
          <div class="col me-2">
            <div class="text-xs fw-bold text-uppercase mb-1">{{ title() }}</div>
            <div class="h5 mb-0 fw-bold text-gray-800">{{ body() }}</div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class CardDisplay {
  title = input.required<string>();
  body = input.required<string | number>();
}
