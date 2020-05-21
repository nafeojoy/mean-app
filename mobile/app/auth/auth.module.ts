// import { NgModule } from '@angular/core';
// import { Http, RequestOptions } from '@angular/http';
// import { CookieService } from 'angular2-cookie/core';
// import { AuthHttp, AuthConfig } from 'angular2-jwt';

// export function authHttpServiceFactory(http: Http, options: RequestOptions, cookieService: CookieService) {
//     return new AuthHttp(new AuthConfig({
//         tokenName: 'token',
//         tokenGetter: (() => cookieService.get('token')),
//         globalHeaders: [{'Content-Type': 'application/json'}]
//     }), http, options);
// }

// @NgModule({
//     providers: [
//         {
//             provide: AuthHttp,
//             useFactory: authHttpServiceFactory,
//             deps: [Http, RequestOptions]
//         }
//     ]
// })
// export class AuthModule { }