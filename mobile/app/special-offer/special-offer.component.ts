import { Component, ViewEncapsulation } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';

import { SpecialOfferService } from './special-offer.service';
import { MessageService } from './message.service';

import { PubSubService } from '../shared/services/pub-sub-service';
import { AuthService } from '../shared/services/auth.service';

import 'style-loader!./special-offer.scss';

@Component({
  selector: 'special-offer',
  templateUrl: './special-offer.html',
  encapsulation: ViewEncapsulation.None
})

export class SpecialOfferComponent {

  public user: any = {};
  public validation: any = { email: {}, phone_number: {} };
  public passowrd_match_error: boolean = false;
  public res_pending: boolean;
  public res_message: string;

  public professions: any = [
    { name: "Select" },
    { name: "Student" },
    { name: "Service" },
    { name: "Engineering/Medical" },
    { name: "Business" },
    { name: "BBA" },
    { name: "Othres" }
  ]


  constructor(private authService: AuthService, private specialOfferService: SpecialOfferService, private pubSubService: PubSubService,
    private router: Router, private route: ActivatedRoute, private messageService: MessageService) { }

  ngOnInit() {
    this.user.profession = "Select";
  }

  validate(field) {
    if (field == 'phone_number') {
      this.validation[field] = { required_error: false, invalid: false }
      if (!this.user[field] && this.user[field] != "") {
        this.validation[field].required_error = true;
      } else {
        let result = '' + this.user[field];

        if (result.length != 10) {
          this.validation[field].required_error = false;
          this.validation[field].invalid = true;
          this.user.mobile_no = parseInt(this.user[field]);

        } else {
          this.validation[field].required_error = false;
          this.validation[field].invalid = false;
        }
      }

    } else if (field == 'email') {
      var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      var result = re.test(this.user[field]);
      if (!result) {
        this.validation[field].required_error = false;
        this.validation[field].invalid = true;
        this.validation[field].error_message = "Email is invalid.";
      } else {
        this.authService.validateDNS(this.user[field].split('@')[1]).subscribe(dnsStatus => {
          if (dnsStatus.valid) {
            this.validation[field].required_error = false;
            this.validation[field].invalid = false;
          } else {
            this.validation[field].required_error = false;
            this.validation[field].invalid = true;
            this.validation[field].error_message = "Email is invalid.";
          }
        })
      }
    }
    else {
      this.validation[field] = { required_error: false, length_error: false }
      if (!this.user[field] && this.user[field] != "") {
        this.validation[field].required_error = true;
      } else {
        if (this.user[field].length < 4) {
          this.validation[field].required_error = false;
          this.validation[field].length_error = true;
        } else {
          this.validation[field].required_error = false;
          this.validation[field].length_error = false;
        }
      }
    }
  }

  checkMatch() {
    if (this.user.repeatPassword == this.user.password) {
      this.passowrd_match_error = false;
    } else {
      this.passowrd_match_error = true;
    }
  }

  save(user) {
    this.res_pending = true;
    if (user.profession == 'Select') delete user.profession;
    user.username = user.email;
    user.no_need_verify = true;
    this.authService.signup(user).subscribe(result => {
      this.res_pending = false;
      if (result && result._id) {
        this.res_message = result.message;
        this.user = {};
        this.sendTextToPhone(result.user)
        setTimeout(() => {
          this.router.navigateByUrl('/');
        }, 5000)
      } else {
        this.res_message = result.message;
        setTimeout(() => {
          this.res_message = "";
        }, 5000)
      }
    })
  }

  sendTextToPhone(info) {
    let message_text = "Dear " + info.first_name + " Welcome to boibazar. Now you are registered with your Promo code: " + info.qrCode + " Thank You for being with us.";
    let data = "user=boibazar&pass=35@7L19j&sid=BoiBazarBrand&sms[0][0]=88" + info.phone_number + "&sms[0][1]=" + message_text + "&sms[0][2]=123456789"

    // console.log(data);
    this.messageService.sendMessage(data).subscribe((res) => {
      //      console.log('');
    })
  }
}
