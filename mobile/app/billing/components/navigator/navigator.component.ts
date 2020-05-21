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
    // Handle route change using rxjs/add/operator/pairwise
    /*   this.router.events.pairwise().subscribe((e) => {
              //console.log(this.router.url);
              this.active_route = this.router.url;
          });*/

    // Handle route change
    this.router.events.subscribe(e => {
      this.active_route = this.router.url;
     // console.log(this.router.url);
      
    });
  }
  ngOnInit() {
    this.active_route = this.router.url;
  }
}
