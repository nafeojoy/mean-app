import { Component, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';

import { PasswordForgetService } from './password-forget.service'
import 'style-loader!./password-forget.scss';

@Component({
    selector: 'password-forget',
    templateUrl: './password-forget.html',
    encapsulation: ViewEncapsulation.None
})

export class PasswordForgetComponent {

    public valid: boolean;
    public email: string;
    public res_pending: boolean;
    constructor(private passwordForgetService: PasswordForgetService) { }

    ngOnInit() {

    }

    validate(mail) {
        var regex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        if (regex.test(mail)) {
            this.valid = true;
        } else {
            this.valid = false;
        }

    }

    sendEmail(mail) {
        this.res_pending = true;
        this.passwordForgetService.sendMail(mail).subscribe(result => {
            if (result.success) {
                this.res_pending = false;
                alert('An Email has been sent to you. Please check!')
            }
        })
    }
}