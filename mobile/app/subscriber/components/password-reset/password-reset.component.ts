import { Component, ViewEncapsulation } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { PasswordResetService } from './password-reset.service'
import 'style-loader!./password-reset.scss';

@Component({
    selector: 'password-reset',
    templateUrl: './password-reset.html',
    encapsulation: ViewEncapsulation.None
})

export class PasswordResetComponent {

    public valid: boolean;
    public reset: any = {};
    public token: string;
    public res_pending: boolean;

    constructor(private passwordResetService: PasswordResetService, private router: Router, private route: ActivatedRoute) { }

    ngOnInit() {
        this.token = this.route.snapshot.params['token'];
    }

    validate(reset) {
        if (reset.password && reset.password.length > 5 && reset.password == reset.repeatPassword) {
            this.valid = true;
        } else {
            this.valid = false;
        }
    }

    updatePassword() {
        this.reset.token = this.token;
        this.res_pending = true;
        this.passwordResetService.updatePassword(this.reset).subscribe(result => {
            if (result.success) {
                this.res_pending = false;
                this.valid = false;
                this.reset = {};
                alert('Password reset success')
                window.location.href='https://www.boibazar.com';
            }
        })
    }
}