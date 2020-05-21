import { Injectable } from '@angular/core'
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot, ActivatedRoute } from '@angular/router';
import { CookieService } from 'angular2-cookie/core';

@Injectable()
export class AuthManager implements CanActivate {
    constructor(private router: Router, private _cookieService: CookieService) {

    }

    canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        let device = this._cookieService.get('deviceName');
        if (device == "desktop") {
            window.location.href = 'https://www.boibazar.com' + state.url;
        }
        return true;
    }

}