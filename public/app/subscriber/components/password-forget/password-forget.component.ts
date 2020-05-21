import { Component, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';

import { PasswordForgetService } from './password-forget.service';
import { MessageService } from './message.service';
import { AuthService } from '../../../shared/services/auth.service';

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

    public phone_number: string;
    public show_code_submit_part: boolean;
    public wait_timer: number = 60;
    public can_resend: boolean;
    public httpMessage: string;
    public vrification: any = {};
    public validRecoveryCode: boolean;
    public reset: any = {};
    public is_success: boolean;

    constructor(private passwordForgetService: PasswordForgetService, private router: Router, private authService: AuthService, private messageService: MessageService) { }

    ngOnInit() {

    }

    validate(data) {
        if (isNaN(data)) {
            var regex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            this.valid = regex.test(data);
        } else {
            this.valid = data.length == 11 ? true : false;
        }
    }

    sendEmail(data) {
        this.res_pending = true;
        if (isNaN(data)) {
            this.passwordForgetService.sendMail(data).subscribe(result => {
                if (result.success) {
                    this.is_success = true;
                    this.res_pending = false;
                    this.httpMessage = 'An Email has been sent to you. Please check!';
                } else {
                    this.is_success = true;
                    this.res_pending = false;
                    this.httpMessage = result.message;
                }
            })
        } else {
            this.authService.getUnverifiedUser(data).subscribe(result => {
                this.res_pending = false;
                if (result.success) {
                    window.localStorage.setItem('signup_info', JSON.stringify({ _id: result.user._id, user: result.user }))
                    this.show_code_submit_part = true;
                    let intrvl_id = setInterval(() => {
                        this.wait_timer--
                        if (this.wait_timer == 0) {
                            this.can_resend = true;
                            clearInterval(intrvl_id);
                        }
                    }, 1000);
                    let message_text = "Dear " + result.user.first_name + " Welcome to boibazar. Your password recovery code is " + result.user.verification_code + " Thank You for being with us.";
                    let data = "user=boibazar&pass=35@7L19j&sid=BoiBazarBrand&sms[0][0]=88" + result.user.phone_number + "&sms[0][1]=" + message_text + "&sms[0][2]=123456789"
                    this.messageService.sendMessage(data).subscribe((res) => {
                    })
                } else {
                    this.httpMessage = result.message;
                }
            })

        }
    }

    verifyCode() {
        this.httpMessage = '';
        let signup_info = JSON.parse(window.localStorage.getItem('signup_info'));
        signup_info.verification_code = this.vrification.code;
        this.authService.verifyCode(signup_info).subscribe(result => {
            if (result.success) {
                this.validRecoveryCode = true;
            } else {
                this.httpMessage = result.message;
            }
        })
    }

    resendCode() {
        this.httpMessage = '';
        this.can_resend = false;
        this.wait_timer = 60;
        let signup_info = JSON.parse(window.localStorage.getItem('signup_info'));
        let message_text = "Dear " + signup_info.user.first_name + " Welcome to boibazar. Your password recovery code is " + signup_info.user.verification_code + " Thank You for being with us.";
        let data = "user=boibazar&pass=35@7L19j&sid=BoiBazarBrand&sms[0][0]=88" + signup_info.user.phone_number + "&sms[0][1]=" + message_text + "&sms[0][2]=123456789"
        this.messageService.sendMessage(data).subscribe((res) => {
        })

        let intrvl_id = setInterval(() => {
            this.wait_timer--
            if (this.wait_timer == 0) {
                this.can_resend = true;
                clearInterval(intrvl_id);
            }
        }, 1000);
    }


    validatePass(reset) {
        if (reset.password && reset.password.length > 5 && reset.password == reset.repeatPassword) {
            this.valid = true;
        } else {
            this.valid = false;
        }
    }

    updatePassword() {
        this.httpMessage = '';
        this.res_pending = true;
        let signup_info = JSON.parse(window.localStorage.getItem('signup_info'));
        this.reset.signup_info = signup_info;
        this.passwordForgetService.updatePassword(this.reset).subscribe(result => {
            this.res_pending = false;
            if (result.success) {
                this.reset = {};
                this.httpMessage = 'Password reset success!';
                this.is_success = true;
            } else {
                this.httpMessage = 'Password reset Failed, For internal error';
                this.is_success = true;
            }
        })
    }

}