import { Component, ViewEncapsulation, OnInit, ViewChild } from '@angular/core';
import { ReCaptchaComponent } from 'angular2-recaptcha';

import { Router } from "@angular/router";
import { ModalDirective } from 'ngx-bootstrap';
// import { EmailValidator, EqualPasswordsValidator } from '../../../shared/validators';
import { AuthService } from '../../../shared/services/auth.service';
import { PubSubService } from '../../../shared/services/pub-sub-service';
import { MessageService } from './message.service';
import { BaseService } from '../../../shared/services/base-service';

import { CookieService } from 'angular2-cookie/core';

import 'style-loader!./signup.scss';

@Component({
    selector: 'app-signup',
    templateUrl: './signup.html',
    encapsulation: ViewEncapsulation.None
})
export class SignupComponent {

    @ViewChild('createAccountModal') createAccountModal: ModalDirective;
    @ViewChild(ReCaptchaComponent) captcha: ReCaptchaComponent;

    staticImageBaseUrl: string = this.authService.staticImageBaseUrl;

    public res_pending: boolean = false;
    public registerMessage = "";
    public registerStatus: boolean = false;
    public subscriber: any = {};
    public passowrd_match_error: boolean = false;
    public validation: any = {};
    // public initial: boolean = true;
    private subAuthStatusStream: any;

    public vrification: any = {};
    // public initial: boolean = true;
    public show_code_submit_part: boolean;
    public can_resend: boolean;
    public wait_timer: number = 60;
    currentLanguage: string;
    subLanguageStream: any;
    public logo_url: any;
    public captcha_valid: boolean;
    public is_success_register: boolean;
    public user: any = {};

    constructor(private baseService: BaseService, public authService: AuthService, private router: Router, private _cookieService: CookieService,
        private pubSubService: PubSubService, private messageService: MessageService) {
    }

    ngOnInit() {
        this.updateLogo();
        this.subLanguageStream = this.pubSubService.LanguageStream.subscribe((result) => {
            this.updateLogo();
        });
        this.subAuthStatusStream = this.pubSubService.AuthStatusStream.subscribe((result) => {
            if (result.showSignupModal === true) {
                this.captcha.reset();
                this.is_success_register = false;
                this.captcha_valid = false;
                this.show_code_submit_part = false;
                this.subscriber = {};
                this.createAccountModal.show();
                this.createAccountModal.show();
            }
            if (result.status && !result.showSignInModal) {
                this.createAccountModal.hide();
            }
        })
    }

    updateLogo() {
        this.currentLanguage = this._cookieService.get('lang');
        this.logo_url = this.currentLanguage == 'en' ? this.baseService.staticImageBaseUrl + 'logo_en.png' : this.baseService.staticImageBaseUrl + 'logo_bn.png';

    }
    ngOnDestroy() {
        this.subAuthStatusStream.unsubscribe();
        this.subLanguageStream.unsubscribe();
    }


    openModal() {
        this.captcha.reset();
        this.is_success_register = false;
        this.captcha_valid = false;
        this.show_code_submit_part = false;
        this.subscriber = {};
        this.createAccountModal.show()
    }

    handleCorrectCaptcha(event) {
        this.res_pending = true;
        if (event && event != '') {
            this.authService.validateCaptcha(event).subscribe(result => {
                this.res_pending = false;
                this.captcha_valid = result.success;
            })
        }
    }


    validate(field) {
        if (field != 'email') {
            this.validation[field] = { required_error: false, length_error: false }
            if (!this.subscriber[field] && this.subscriber[field] != "") {
                this.validation[field].required_error = true;
            } else {
                if (this.subscriber[field].length < 4) {
                    this.validation[field].required_error = false;
                    this.validation[field].length_error = true;
                } else {
                    this.validation[field].required_error = false;
                    this.validation[field].length_error = false;
                }
            }
        } else {
            this.validation[field] = { required_error: false, invalid: false }
            if (!this.subscriber[field] && this.subscriber[field] != "") {
                this.validation[field].required_error = true;
            } else {
                if (isNaN(this.subscriber[field])) {
                    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
                    var result = re.test(this.subscriber[field]);
                    if (!result) {
                        this.validation[field].required_error = false;
                        this.validation[field].invalid = true;
                        this.validation[field].error_message = "Email/Phone is invalid.";
                    } else {
                        this.authService.validateDNS(this.subscriber[field].split('@')[1]).subscribe(dnsStatus => {
                            if (dnsStatus.valid) {
                                this.validation[field].required_error = false;
                                this.validation[field].invalid = false;
                            } else {
                                this.validation[field].required_error = false;
                                this.validation[field].invalid = true;
                                this.validation[field].error_message = "Email/Phone is invalid.";
                            }
                        })
                    }
                } else {
                    if (this.subscriber[field].length != 11) {
                        this.validation[field].required_error = false;
                        this.validation[field].invalid = true;
                        this.validation[field].error_message = "Email/Phone is invalid.";
                    } else {
                        this.validation[field].required_error = false;
                        this.validation[field].invalid = false;
                    }
                }
            }
        }
        if (this.subscriber.repeatPassword && this.subscriber.repeatPassword != '') {
            this.checkMatch();
        }
    }

    checkMatch() {
        if (this.subscriber.repeatPassword == this.subscriber.password) {
            this.passowrd_match_error = false;
        } else {
            this.passowrd_match_error = true;
        }
    }

    signup(subscriber) {
        let id_feild;
        id_feild = isNaN(subscriber.email) ? 'email' : 'phone_number';

        // if (this.captcha_valid) {
        subscriber.is_enabled = true;
        subscriber.provider = isNaN(subscriber.email) ? 'local_mail' : 'local_phone';
        subscriber.username = subscriber.email;
        subscriber[id_feild] = subscriber.email;
        isNaN(subscriber.email) ? this.withMail(subscriber) : this.withPhone(subscriber)
    }

    withMail(subscriber) {
        this.is_success_register = false;
        delete subscriber.phone_number;
        this.authService.signup(subscriber).subscribe((response) => {
            if (response._id) {
                this.user = response.user;
                this.is_success_register = true;
                this.subscriber = {};
                this.registerStatus = true;
                this.registerMessage = "A verification mail has been sent.Please check your email";
            }
            else {
                this.is_success_register = false;
                this.registerMessage = response.message;
            }
        });
    }

    withPhone(subscriber) {
        this.is_success_register = false;
        delete subscriber.email;
        this.authService.signup(subscriber).subscribe((response) => {
            if (response._id) {
                this.is_success_register = true;
                window.localStorage.setItem('signup_info', JSON.stringify(response));
                this.show_code_submit_part = true;
                this.subscriber = {};
                this.registerMessage = response.message;
                let intrvl_id = setInterval(() => {
                    this.wait_timer--
                    if (this.wait_timer == 0) {
                        this.can_resend = true;
                        clearInterval(intrvl_id);
                    }
                }, 1000);

                let message_text = "Dear " + response.user.first_name + " Welcome to boibazar. Your signup verification code is " + response.user.verification_code + " Thank You for being with us.";
                let data = "user=boibazar&pass=35@7L19j&sid=BoiBazarBrand&sms[0][0]=88" + response.user.phone_number + "&sms[0][1]=" + message_text + "&sms[0][2]=123456789"
                this.messageService.sendMessage(data).subscribe((res) => {
                    //      console.log('');
                })
            }
            else {
                this.is_success_register = false;
                this.registerMessage = response.message;
            }
        });
    }


    verifyPhone() {
        let signup_info = JSON.parse(window.localStorage.getItem('signup_info'));
        signup_info.user.verification_code = this.vrification.code;
        this.authService.verifyPhone(signup_info).subscribe(result => {
            if (result.success) {
                this.registerStatus = true;
                this.vrification = {};
                this.registerMessage = result.message;
            } else {
                this.registerMessage = result.message;
            }
        })

    }

    resendCode() {
        this.can_resend = false;
        this.wait_timer = 60;
        let signup_info = JSON.parse(window.localStorage.getItem('signup_info'));
        this.authService.updateVerificationCode(signup_info._id).subscribe(result => {
            signup_info = (result && result._id) ? { _id: result._id, user: result } : signup_info;
            let message_text = "Dear " + signup_info.user.first_name + " Welcome to boibazar. Your signup verification code is " + signup_info.user.verification_code + " Thank You for being with us.";
            let data = "user=boibazar&pass=35@7L19j&sid=BoiBazarBrand&sms[0][0]=88" + signup_info.user.phone_number + "&sms[0][1]=" + message_text + "&sms[0][2]=123456789"
            this.messageService.sendMessage(data).subscribe((res) => {
                //     console.log('');
            })

            let intrvl_id = setInterval(() => {
                this.wait_timer--
                if (this.wait_timer == 0) {
                    this.can_resend = true;
                    clearInterval(intrvl_id);
                }
            }, 1000);
        })
    }



    tabSelected() {
        // this.subscriber = {};
        // this.show_code_submit_part = false;
    }


    showLoginModal() {
        this.createAccountModal.hide();
        this.pubSubService.AuthStatusStream.emit({ showSignInModal: true });
    }

    public onHidden(): void {
        this.subscriber = {};
        this.validation = {};
        this.passowrd_match_error = false;
        this.registerStatus = false;
        this.registerMessage = "";
    }
}