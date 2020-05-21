import { Component, ViewEncapsulation } from '@angular/core';
import { Subscription } from 'rxjs';

import { StaticPagesService } from '../../../shared/services/static-pages.service';

@Component({
  selector: 'support',
  templateUrl: './support.html'
})
export class HelpAndSupportComponent {
  public busy: Subscription;

  public content_object: any = {};

  constructor(private staticPagesService: StaticPagesService) { }

  ngOnInit() {
    window.scrollTo(0, 0);

    this.busy = this.staticPagesService.get('help-and-support').subscribe(result => {
      this.content_object = result;
    });
  }
}