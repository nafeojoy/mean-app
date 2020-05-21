import { Component, ViewEncapsulation } from '@angular/core';
import { Subscription } from 'rxjs';

import { StaticPagesService } from '../../../shared/services/static-pages.service';
import { SeoContentLoaderService } from '../../../shared/services';

@Component({
  selector: 'privacy-policy',
  templateUrl: './privacy-policy.html'
})
export class PrivacyPolicyComponent {
  public busy: Subscription;

  public content_object: any = {};

  constructor(private staticPagesService: StaticPagesService, private seoContentLoaderService:SeoContentLoaderService) { }

  ngOnInit() {
    window.scrollTo(0, 0);

    this.busy = this.staticPagesService.get('privacy-policy').subscribe(result => {
      this.content_object = result;
      this.seoContentLoaderService.setContent(this.content_object.title, this.content_object.meta_tag_description, this.content_object.meta_tag_keywords);
    });
  }
}