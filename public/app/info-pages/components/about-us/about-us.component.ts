import { Component, ViewEncapsulation } from '@angular/core';
import { Subscription } from 'rxjs';
import { PubSubService } from '../../../shared/services/pub-sub-service';
import { SeoContentLoaderService } from '../../../shared/services';

import { StaticPagesService } from '../../../shared/services/static-pages.service';


@Component({

  selector: 'about-us',
  templateUrl: './about-us.html',
  encapsulation: ViewEncapsulation.None
})
export class AboutUsComponent {

  // // Use Of JQuery

  // title = 'angular 4 with jquery';
  // toggleTitle() {
  //   $('.title').slideToggle();

  // }



  public busy: Subscription;

  public content_object: any = {};
  zoomLevel = 1;

  constructor(private staticPagesService: StaticPagesService, private pubSubService: PubSubService, private seoContentLoaderService: SeoContentLoaderService) {
  }



  ngOnInit() {

    window.scrollTo(0, 0);

    this.loadContent();
    this.pubSubService.LanguageStream.subscribe(result => {
      this.loadContent();
    })
  }


  loadContent() {
    this.busy = this.staticPagesService.get('about-us').subscribe(result => {
      this.content_object = result;
      this.seoContentLoaderService.setContent(this.content_object.title, this.content_object.meta_tag_description, this.content_object.meta_tag_keywords);
    });
  }

}