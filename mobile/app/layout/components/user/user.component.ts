import { Component, ViewEncapsulation } from '@angular/core';
import { CookieService } from 'angular2-cookie/core';

import { AuthService } from '../../../shared/services/auth.service';
import { PubSubService } from '../../../shared/services/pub-sub-service';

import 'style-loader!./user.scss';

@Component({
    selector: 'user',
    providers: [CookieService],
    templateUrl: './user.html',
    encapsulation: ViewEncapsulation.None
})

export class UserComponent {

    public user: string;
    private subAuthStatusStream: any;

    constructor(public authService: AuthService, private cookieService: CookieService, private pubSubService: PubSubService) { }

    ngOnInit() {
        this.subAuthStatusStream = this.pubSubService.AuthStatusStream.subscribe((result) => {
            if (result.status === true) {
                this.user = this.authService.getUserFirstname();
            }
        })
    }

    ngOnDestroy() {
        this.subAuthStatusStream.unsubscribe();
    }

    logout() {
        this.authService.logout().subscribe(status => {
            if (status.success) {
                let res = this.cookieService.remove('token');
                this.cookieService.remove('sub_id');
                this.pubSubService.AuthStatusStream.emit({ status: false, redirectToHome: true });
            }
        })
    }
}