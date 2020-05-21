import { Component, ViewEncapsulation } from '@angular/core';
import { Subscription } from 'rxjs';

import { PubSubService } from '../../../shared/services/pub-sub-service';
import { StaticPagesService } from '../../../shared/services/static-pages.service';

@Component({
  selector: 'news',
  templateUrl: './news.html',
  encapsulation: ViewEncapsulation.None
})
export class NewsComponent {
  public busy: Subscription;

  public content_object: any = {};

  constructor(private staticPagesService: StaticPagesService, private pubSubService: PubSubService) { }

  ngOnInit() {
    this.loadContent();
    this.pubSubService.LanguageStream.subscribe(result => {
      this.loadContent();
    })
  }


  loadContent() {
    window.scrollTo(0, 0);
    this.busy = this.staticPagesService.get('news').subscribe(result => {
      this.content_object = result;
    });
  }

}