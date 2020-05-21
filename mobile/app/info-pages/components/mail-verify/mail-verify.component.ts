import { Component, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { CookieService } from 'angular2-cookie/core';
import { PubSubService } from '../../../shared/services/pub-sub-service';
import { StaticPagesService } from '../../../shared/services/static-pages.service';

@Component({
  selector: 'mail-verify',
  templateUrl: './mail-verify.html',
  encapsulation: ViewEncapsulation.None
})
export class MailVerifyComponent {
  public busy: Subscription;
  token;
  public content_object: any = {};
  public message: string;
  public can_login: boolean;
  constructor(private pubSubService: PubSubService,private staticPagesService: StaticPagesService, private route: ActivatedRoute, private router: Router, private _cookieService: CookieService) { }

  ngOnInit() {
    window.scrollTo(0, 0);
    this.token = this.route.snapshot.params['token'];
    this.staticPagesService.verifyToken(this.token).subscribe(result => {
      if (result._id && result.is_verified) {
        this.can_login = true;
        this.message = "Your mail is verified, You can login now";
      } else {
        this.message = "Mail verification Faild, Verification token has been expired!";
      }
    })
  }

  login() {
    let device = this._cookieService.get('deviceName');
    if (device == 'desktop') {
      window.location.href = 'https://www.boibazar.com?login=true';
    }else{
      this.pubSubService.AuthStatusStream.emit({ showSignInModal: true })
    }
  }

}