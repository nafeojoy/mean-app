import { Component, ViewEncapsulation, ViewContainerRef } from '@angular/core';

import 'style-loader!../assets/css/bootstrap.min.css';
import 'style-loader!../assets/css/font-awesome.min.css';
import 'style-loader!../assets/css/build.css';
import 'style-loader!../../sass/main.scss';

@Component({
  selector: 'app',
  encapsulation: ViewEncapsulation.None,
  template: `
          <app-header></app-header>
          <div style="min-height:500px">
            <router-outlet></router-outlet>
          </div>
          <app-footer></app-footer>
          `,
})
export class App {
 
  private viewContainerRef: ViewContainerRef;
  public constructor(viewContainerRef: ViewContainerRef) {
    // You need this small hack in order to catch application root view container ref
    this.viewContainerRef = viewContainerRef;
    
  }
}