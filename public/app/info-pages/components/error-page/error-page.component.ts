import { Component, ViewEncapsulation } from '@angular/core';
import { Subscription } from 'rxjs';
import { PubSubService } from '../../../shared/services/pub-sub-service';

import { StaticPagesService } from '../../../shared/services/static-pages.service';

@Component({
  selector: 'error-page',
  templateUrl: './error-page.html',
  encapsulation: ViewEncapsulation.None
})
export class ErrorPageComponent {
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
  this.busy = this.staticPagesService.get('error-page').subscribe(result => {
    this.content_object = result;
  });
}

}