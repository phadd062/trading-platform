import { Component } from '@angular/core';

/**
 * Page header with a bottom border. Projects its children into a flex row
 * (title on the left, action buttons on the right), matching the old React PageTitle.
 */
@Component({
  selector: 'app-page-title',
  template: `
    <div class="row">
      <div class="col">
        <div
          class="d-flex justify-content-between align-items-center flex-wrap pt-3 pb-2 mb-3 border-bottom"
        >
          <ng-content />
        </div>
      </div>
    </div>
  `,
})
export class PageTitle {}
