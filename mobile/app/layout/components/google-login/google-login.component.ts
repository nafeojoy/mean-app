import { Component, ViewEncapsulation, OnInit, Input } from '@angular/core';
import { CookieService } from 'angular2-cookie/core';

import { AuthService } from '../../../shared/services/auth.service';
import { PubSubService } from '../../../shared/services/pub-sub-service'
declare const gapi: any;

@Component({
    selector: 'google-login',
    providers: [CookieService],
    templateUrl: './google-login.html'
})
export class GoogleLoginComponent {
    public signInMessage = "";
    public auth2: any;
    @Input() public type: string;

    constructor(private _cookieService: CookieService, private authService: AuthService,
        private pubSubService: PubSubService) { }

    ngAfterViewInit() {
        this.googleInit();
    }

    public googleInit() {
        let thisComponent = this;
        gapi.load('auth2', function () {
            thisComponent.auth2 = gapi.auth2.init({
                client_id: '370202831760-d0777bbrqsi57hpbcuih5dev0hbfrqsd.apps.googleusercontent.com',
                cookiepolicy: 'single_host_origin',
                scope: 'profile email'
            });
            thisComponent.attachSignin(document.getElementById('googleBtn_' + thisComponent.type));
        });
    }

    public attachSignin(element) {
        let thisComponent = this;
        this.auth2.attachClickHandler(element, {},
            function (googleUser) {
                let profile = googleUser.getBasicProfile();
                let googleUserInfo = {
                    id: profile.getId(),
                    name: profile.getName(),
                    first_name: profile.getGivenName(),
                    last_name: profile.getFamilyName(),
                    email: profile.getEmail(),
                }

                thisComponent.googleSignIn(googleUserInfo);

            }, function (error) {
             //   console.log(JSON.stringify(error, undefined, 2));
            });
    }

    googleSignIn(googleUserInfo: any) {
        this.authService.googleLogin(googleUserInfo).subscribe((response) => {
            if (response.token != undefined) {
                this.setCookie('token', response.token);
                this.pubSubService.AuthStatusStream.emit({ status: true, showSignInModal: false });

            }
            else {
                this.signInMessage = response.message;
            }
        });
    }

    setCookie(key: string, value: string) {
        this._cookieService.put(key, value);
    }
}