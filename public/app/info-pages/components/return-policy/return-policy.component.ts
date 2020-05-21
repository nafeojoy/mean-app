import { Component, ViewEncapsulation } from '@angular/core';
import { Subscription } from 'rxjs';

import { PubSubService } from '../../../shared/services/pub-sub-service';
import { StaticPagesService } from '../../../shared/services/static-pages.service';
import { SeoContentLoaderService } from '../../../shared/services';

import 'style-loader!../../info-pages.scss';

@Component({
  selector: 'return-policy',
  templateUrl: './return-policy.html',
  encapsulation: ViewEncapsulation.None
})
export class ReturnPolicyComponent {
  public busy: Subscription;

  public content_object: any = {};

  constructor(private staticPagesService: StaticPagesService, private pubSubService: PubSubService, private seoContentLoaderService:SeoContentLoaderService) { }

  ngOnInit() {
    window.scrollTo(0, 0);

    this.loadContent();
    this.pubSubService.LanguageStream.subscribe(result => {
      this.loadContent();
    })
  }


  loadContent() {
    this.busy = this.staticPagesService.get('return-policy').subscribe(result => {
      this.content_object = result;
      this.seoContentLoaderService.setContent(this.content_object.title, this.content_object.meta_tag_description, this.content_object.meta_tag_keywords);
    });
  }

}