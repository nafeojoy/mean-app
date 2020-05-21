import { Component, ViewEncapsulation } from '@angular/core';
import { Subscription } from 'rxjs';

import { StaticPagesService } from '../../../shared/services/static-pages.service';

@Component({
  selector: 'terms-of-use',
  templateUrl: './terms-of-use.html'
})
export class TermsOfUseComponent {
  public busy: Subscription;

  public content_object: any = {};

  constructor(private staticPagesService: StaticPagesService) { }

  ngOnInit() {
    window.scrollTo(0, 0);

    this.busy = this.staticPagesService.get('terms-of-use').subscribe(result => {
      this.content_object = result;
    });
  }
}