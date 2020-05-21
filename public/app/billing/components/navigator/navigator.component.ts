import { Component, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
//import 'rxjs/add/operator/pairwise';

import 'style-loader!./navigator.scss';

@Component({
  selector: 'navigator-block',
  templateUrl: './navigator.html',
  encapsulation: ViewEncapsulation.None
})
export class NavigatorComponent {
  public active_route: any;

  constructor(private router: Router) {

    this.router.events.subscribe(e => {
      this.active_route = this.router.url;
    });
  }
  ngOnInit() {
    this.active_route = this.router.url;
  }
}
