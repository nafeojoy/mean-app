import { Component } from '@angular/core';

import { GlobalState } from '../../../global.state';
import { Router } from "@angular/router";
import { PageTopService } from "./baPageTop.service";
import 'style-loader!./baPageTop.scss';
import { CookieService } from 'angular2-cookie/core';

@Component({
  selector: 'ba-page-top',
  templateUrl: './baPageTop.html',
})
export class BaPageTop {

  public isScrolled: boolean = false;
  public isMenuCollapsed: boolean = false;
  public loggedInBy: any = {};

  constructor(private _state: GlobalState, private router: Router, private pagetopService: PageTopService, private _cookieService: CookieService) {
    this.loggedInBy = JSON.parse(window.localStorage.getItem('user'));
    this._state.subscribe('menu.isCollapsed', (isCollapsed) => {
      this.isMenuCollapsed = isCollapsed;
    });
  }

  public toggleMenu() {
    this.isMenuCollapsed = !this.isMenuCollapsed;
    this._state.notifyDataChanged('menu.isCollapsed', this.isMenuCollapsed);
    return false;
  }

  public scrolledChanged(isScrolled) {
    this.isScrolled = isScrolled;
  }

  logOut() {
    this.pagetopService.loguot().subscribe((res) => {
      if (res.success) {
        window.localStorage.removeItem('auth_key');
        window.localStorage.removeItem('menu_permission');
        window.localStorage.removeItem('languages');
        window.localStorage.removeItem('menu');
        window.localStorage.removeItem('user');
        setTimeout(() => {
          window.location.reload();
        }, 500)
        this.router.navigateByUrl('/login');
      }
    })
  }

}
