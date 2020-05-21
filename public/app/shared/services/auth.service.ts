import { Injector, Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';
import { CookieService } from 'angular2-cookie/core';
import { JwtHelper, tokenNotExpired } from 'angular2-jwt';

import { BaseService } from './base-service';

@Injectable()
export class AuthService extends BaseService {

    private signupUrl = this.apiBaseUrl + 'auth/signup';
    private loginUrl = this.apiBaseUrl + 'auth/login';
    private loggedInUrl = this.apiBaseUrl + 'auth/loggedIn';
    private logoutUrl = this.apiBaseUrl + 'auth/logout';
    private facebookLoginUrl = this.apiBaseUrl + 'auth/facebook-login';
    private googleLoginUrl = this.apiBaseUrl + 'auth/google-login';
    private subscriberUrl = this.apiBaseUrl + 'subscriber/';

    private jwtHelper: JwtHelper;

    constructor(injector: Injector, private cookieService: CookieService) {
        super(injector);

        this.jwtHelper = new JwtHelper();
    }

    public signup(item: any) {
        return this.http.post(this.signupUrl, JSON.stringify(item), { headers: this.headers })
            .map(res => res.json());
    }

    public login(item: any) {
        return this.http.post(this.loginUrl, JSON.stringify(item), { headers: this.headers })
            .map(res => res.json());
    }

    public getLoggedInUser() {
        return this.http.get(this.loggedInUrl).map(res => res.json())
    }

    public logout() {
        return this.http.post(this.logoutUrl, { headers: this.headers })
            .map(res => res.json());
    }

    public facebookLogin(fbUserInfo: any) {
        return this.http.post(this.facebookLoginUrl, JSON.stringify(fbUserInfo), { headers: this.headers })
            .map(res => res.json());
    }

    public googleLogin(googleUserInfo: any) {
        return this.http.post(this.googleLoginUrl, JSON.stringify(googleUserInfo), { headers: this.headers })
            .map(res => res.json());
    }

    public verifyPhone(data) {
        return this.http.post(this.signupUrl + '/verify-phone', JSON.stringify(data), { headers: this.headers })
            .map(res => res.json());
    }

    public getUnverifiedUser(phone_number) {
        return this.http.get(this.signupUrl + '/unverified-subscriber/' + phone_number)
            .map(res => res.json());
    }

    public validateCaptcha(token) {
        return this.http.get(this.signupUrl + '/validate_captcha?token=' + token)
            .map(res => res.json());
    }

    public sendMailToUser(data) {
        return this.http.post(this.signupUrl + '/send-mail', JSON.stringify(data), { headers: this.headers })
            .map(res => res.json());
    }

    public verifyCode(data) {
        return this.http.post(this.signupUrl + '/verify-code', JSON.stringify(data), { headers: this.headers })
            .map(res => res.json());
    }


    public isLoggedIn() {
        var token = this.cookieService.get('token');

        if (token) {
            return !this.jwtHelper.isTokenExpired(token);
        }

        return false;
    }

    public getUserFirstname() {
        var token = this.cookieService.get('token');

        if (token) {
            let userInfo = this.jwtHelper.decodeToken(token);
            return userInfo._doc.first_name.split(" ", 1);
        }
    }
    public getUserId() {
        var token = this.cookieService.get('token');

        if (token) {
            let userInfo = this.jwtHelper.decodeToken(token);
            return userInfo._doc._id;
        }
    }

    public getUserEmail() {
        var token = this.cookieService.get('token');

        if (token) {
            let userInfo = this.jwtHelper.decodeToken(token);
            return userInfo._doc.email.split(" ", 1);
        }
    }

    public updateVerificationCode(id) {
        return this.http.get(this.subscriberUrl + 'update-verification-code/' + id).map(res => res.json());
    }

    public validateDNS(dns) {
        return this.http.get(this.apiBaseUrl + 'auth/check-dns/' + dns).map(res => res.json());
    }
}