import { Component, ViewEncapsulation, OnInit } from '@angular/core';
import { CookieService } from 'angular2-cookie/core';
import { FacebookService, FacebookInitParams } from 'ng2-facebook-sdk';

import { AuthService, CustomCookieService } from '../../../shared/services';
import { PubSubService } from '../../../shared/services/pub-sub-service'

@Component({
    selector: 'facebook-login',
    providers: [CookieService, FacebookService],
    templateUrl: './facebook-login.html'
})
export class FacebookLoginComponent {
    public signInMessage = "";

    constructor(private _cookieService: CookieService, private authService: AuthService,private _customCookieService: CustomCookieService,
        private pubSubService: PubSubService, private facebook: FacebookService) {

        let fbParams: FacebookInitParams = {
            appId: '1764304390530081',
            xfbml: true,
            version: 'v2.8',
        };

        this.facebook.init(fbParams);
    }

    facebookSignIn(): void {
        this.facebook.login({ scope: 'public_profile, email', return_scopes: true, enable_profile_selector: true })
            .then((auth) => {
                if (auth.authResponse) {
                    return this.facebook.api('/me', 'get', { fields: 'id, email, name, first_name, last_name' });
                }
                else {
                    return {}
                }
            })
            .then(response => {
                this.authService.facebookLogin(response).subscribe((response) => {
                    if (response.token != undefined) {
                        this.setCookie('token', response.token);
                        this.setCookie('sub_id', response._id);
                        this.pubSubService.AuthStatusStream.emit({ status: true, showSignInModal:false});
                    }
                    else {
                        this.signInMessage = response.message;
                    }
                });
            });
    }

    setCookie(key: string, value: string) {
        this._customCookieService.setCookie(key, value, 500);
    }
}