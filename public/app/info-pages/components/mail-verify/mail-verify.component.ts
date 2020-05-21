import { Component, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';

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
  constructor(private staticPagesService: StaticPagesService, private route: ActivatedRoute, private router: Router) { }

  ngOnInit() {
    this.token = this.route.snapshot.params['token'];
    this.staticPagesService.verifyToken(this.token).subscribe(result => {
      if (result._id && result.is_verified) {
        this.message = "Your mail is verified, You can login now";
      } else {
        this.message = "Mail verification failed";
      }

      setTimeout(()=>{
        this.router.navigate(['/',]);
      }, 5000)

    })
  }
}