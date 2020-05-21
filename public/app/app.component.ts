import { Component, ViewEncapsulation, ViewContainerRef } from '@angular/core';

import 'style-loader!../assets/css/bootstrap.min.css';
import 'style-loader!../assets/css/font-awesome.min.css';
import 'style-loader!../assets/css/build.css';
import 'style-loader!../../sass/main.scss';
import { Router, NavigationEnd } from "@angular/router";

import { HttpModule } from '@angular/http';


@Component({
  selector: 'app',
  encapsulation: ViewEncapsulation.None,
  templateUrl: './app.html',
})
export class App {
  checkFest: boolean = false;
  private viewContainerRef: ViewContainerRef;
  public constructor(viewContainerRef: ViewContainerRef, private httpModule: HttpModule, private router: Router) {
    // You need this small hack in order to catch application root view container ref
    this.viewContainerRef = viewContainerRef;

    router.events
      .filter((event) => event instanceof NavigationEnd)
      .map(() => this.router.routerState)
      .subscribe((event) => {
        if (event.snapshot.url == '/' || event.snapshot.url == '') {
          this.checkFest = true;
        } else {
          this.checkFest = false;
        }

      });



  }
}