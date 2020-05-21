import { Component, ViewEncapsulation } from '@angular/core';
import { Subscription } from 'rxjs';
import { PubSubService } from '../../../shared/services/pub-sub-service';

import { StaticPagesService } from '../../../shared/services/static-pages.service';
import { SeoContentLoaderService } from '../../../shared/services';

@Component({
  selector: 'faq',
  templateUrl: './faq.html'
})
export class FaqComponent {
  public busy: Subscription;

  public content_object: any = {};

  constructor(private staticPagesService: StaticPagesService, private pubSubService: PubSubService, private seoContentLoaderService:SeoContentLoaderService) { }

  ngOnInit() {
    window.scrollTo(0, 0);

    this.busy = this.staticPagesService.get('faq').subscribe(result => {
      this.content_object = result;
      this.seoContentLoaderService.setContent(this.content_object.title, this.content_object.meta_tag_description, this.content_object.meta_tag_keywords);
    });
  }

}