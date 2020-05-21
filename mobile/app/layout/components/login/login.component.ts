import { Component, ViewEncapsulation, OnInit, ViewChild } from '@angular/core';
import { Location } from '@angular/common';
import { Router, NavigationEnd } from "@angular/router";
import { ModalDirective } from 'ngx-bootstrap';
import { CookieService } from 'angular2-cookie/core';
import { BaseService } from '../../../shared/services/base-service';

import { AuthService, CustomCookieService } from '../../../shared/services';
import { PubSubService } from '../../../shared/services/pub-sub-service';
import { MessageService } from '../signup/message.service';

import 'style-loader!./login.scss';

@Component({
    selector: 'app-login',
    providers: [CookieService],
    templateUrl: './login.html',
    encapsulation: ViewEncapsulation.None
})
export class LoginComponent {

    @ViewChild('loginModal') loginModal: ModalDirective;

    staticImageBaseUrl: string = this.authService.staticImageBaseUrl;

    public submitted: boolean = false;
    navigateTo: string;
    public signInMessage = "";
    public subscriber: any = {};
    public validation: any = {};
    public can_resend: boolean;
    public show_phone_resend_part: boolean;
    public show_code_submit_part: boolean;
    public wait_timer: number = 60;
    public successVreify: boolean;
    public vrification: any = {};
    private subAuthStatusStream: any;
    currentLanguage: string;
    subLanguageStream: any;
    public logo_url: any;
    private intrvl_id;
    myroute: string;


    constructor(private baseService: BaseService, public authService: AuthService, private router: Router,
        private location: Location, private _cookieService: CookieService, private _customCookieService: CustomCookieService,
        private pubSubService: PubSubService, private messageService: MessageService) {
            router.events
            .filter((event) => event instanceof NavigationEnd)
            .map(() => this.router.routerState)
            .subscribe((event) => {
                this.myroute = event.snapshot.url;
            });
    }

    ngOnInit() {
        this.updateLogo();
        this.subLanguageStream = this.pubSubService.LanguageStream.subscribe((result) => {
            this.updateLogo();
        });
        this.subAuthStatusStream = this.pubSubService.AuthStatusStream.subscribe((result) => {
            if (result.showSignInModal === false) {
                this.loginModal.hide();
            }

            if (result.showSignInModal === true) {
                this.loginModal.show();
            }

            if (result.goToCartIfLogIn === true) {
                this.navigateTo = '/billing/cart';
            }

            if (result.goToPurchaseIfLogIn === true) {
                this.navigateTo = '/contents/purchase-list';
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
        this.show_phone_resend_part = false;
        this.show_code_submit_part = false;
        this.subscriber = {};
        this.loginModal.show()
    }

    validate(field) {
        this.validation[field] = { required_error: false, length_error: false }
        if (!this.subscriber[field] && this.subscriber[field] != "") {
            this.validation[field].required_error = true;
        } else {
            if (this.subscriber[field].length < 6) {
                this.validation[field].required_error = false;
                this.validation[field].length_error = true;
            } else {
                this.validation[field].required_error = false;
                this.validation[field].length_error = false;
            }
        }
    }
    signIn(subscriber) {
        let signInUser = {
            username: subscriber.EmailOrUserName,
            password: subscriber.signInPassword
        }
        this.authService.login(signInUser).subscribe((response) => {
            if (response.token != undefined) {
                this.setCookie('token', response.token);
                this.setCookie('sub_id', response._id);
                this.signInMessage = "";
                this.subscriber = {};
                this.loginModal.hide();
                this.pubSubService.AuthStatusStream.emit({ status: true });
                if (this.myroute.includes('billing/shipping')) {
                    window.location.reload();
                }
            } else {
                this.signInMessage = response.message;
                if (this.signInMessage == "Phone Number is not verified. Please verify first" || this.signInMessage == "Email is not verified. Please verify first") {
                    this.show_phone_resend_part = true;
                }
            }
        });
    }

    viewResend() {
        this.signInMessage = "";
        // this.show_code_submit_part = true;
        this.authService.getUnverifiedUser(this.subscriber.EmailOrUserName).subscribe(result => {
            if (result.success) {
                if (result.user.provider == "local_phone") {
                    this.wait_timer = 60;
                    this.show_code_submit_part = true;
                    let signup_info = { _id: result.user._id, user: result.user }
                    this.authService.updateVerificationCode(signup_info._id).subscribe(result => {
                        signup_info = (result && result._id) ? { _id: result._id, user: result } : signup_info;
                        let message_text = "Dear " + signup_info.user.first_name + " Welcome to boibazar. Your signup verification code is " + signup_info.user.verification_code + " Thank You for being with us.";
                        let data = "user=boibazar&pass=35@7L19j&sid=BoiBazarBrand&sms[0][0]=88" + signup_info.user.phone_number + "&sms[0][1]=" + message_text + "&sms[0][2]=123456789"
                        this.messageService.sendMessage(data).subscribe((res) => {
                            //     console.log('');
                        })

                        this.intrvl_id = setInterval(() => {
                            this.wait_timer--
                            if (this.wait_timer == 0) {
                                this.can_resend = true;
                                clearInterval(this.intrvl_id);
                            }
                        }, 1000);
                    })
                } else {
                    this.authService.sendMailToUser(result.user).subscribe(result => {
                        this.signInMessage = "A mail has been sent.";
                        this.show_phone_resend_part = false;
                    })
                }
            } else {
                this.signInMessage = result.message;
            }
        })
    }

    verifyPhone() {
        this.signInMessage = "";
        let signup_info = JSON.parse(window.localStorage.getItem('signup_info'));
        signup_info.user.verification_code = this.vrification.code;
        this.authService.verifyPhone(signup_info).subscribe(result => {
            if (result.success) {
                this.successVreify = true;
                this.show_phone_resend_part = false;
                this.signInMessage = result.message;
            } else {
                this.signInMessage = result.message;
            }
        })

    }


    resendCode() {
        this.signInMessage = "";
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

            this.intrvl_id = setInterval(() => {
                this.wait_timer--
                if (this.wait_timer == 0) {
                    this.can_resend = true;
                    clearInterval(this.intrvl_id);
                }
            }, 1000);
        })
    }

    showSignIn() {
        this.show_code_submit_part = false;
        this.show_phone_resend_part = false;
        this.signInMessage = '';
    }


    setCookie(key: string, value: string) {
        this._customCookieService.setCookie(key, value, 500);
    }
    getCookie(key: string) {
        return this._cookieService.get(key);
    }

    showSignupModal() {
        this.loginModal.hide();
        this.pubSubService.AuthStatusStream.emit({ showSignupModal: true })
    }

    public onHidden(): void {
        this.subscriber = {};
        this.validation = {};
        this.signInMessage = "";
    }
}