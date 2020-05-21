import {Component} from '@angular/core';

@Component({
  selector: 'dynamic-page',
  template: `<router-outlet></router-outlet>`
})
export class DynamicPageComponent {
  constructor() {
  }
}
