import { Component, ViewEncapsulation } from '@angular/core';
import { Subscription } from 'rxjs';

import { PubSubService } from '../../../shared/services/pub-sub-service';
import { StaticPagesService } from '../../../shared/services/static-pages.service';

import 'style-loader!../../info-pages.scss';

@Component({
  selector: 'return-policy',
  templateUrl: './return-policy.html',
  encapsulation: ViewEncapsulation.None
})
export class ReturnPolicyComponent {
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
    this.busy = this.staticPagesService.get('return-policy').subscribe(result => {
      this.content_object = result;
    });
  }

}