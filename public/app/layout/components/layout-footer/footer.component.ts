import { Component, ViewEncapsulation, ViewChild } from '@angular/core';
import { BaseService } from '../../../shared/services/base-service';
import { CookieService } from 'angular2-cookie/core';
import { PubSubService } from '../../../shared/services/pub-sub-service';
import { ModalDirective } from 'ngx-bootstrap';


import 'style-loader!./footer.scss';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.html',
  encapsulation: ViewEncapsulation.None
})
export class FooterComponent {
  currentLanguage: string;
  subLanguageStream: any;
  public logo_url: any;
  staticImageBaseUrl: string = this.baseService.staticImageBaseUrl;

  pdfLang: string;
  banglaImages: any = [];

  constructor(private baseService: BaseService, private _cookieService: CookieService, private pubsubService: PubSubService) { }

  ngOnInit() {
    this.getFooterContent();
    this.pubsubService.LanguageStream.subscribe((result) => {
      this.getFooterContent();
    });

  }
  ngOnDestroy() {
    this.subLanguageStream.unsubscribe();
  }
  getFooterContent() {
    this.currentLanguage = this._cookieService.get('lang');
    this.logo_url = this.currentLanguage == 'en' ? this.baseService.staticImageBaseUrl + 'logo_en.png' : this.baseService.staticImageBaseUrl + 'logo_bn.png';
    this.banglaImages = ["/assets/images/Bangla/1.jpg"];

  }
  @ViewChild('imageModal') imageModal: ModalDirective;

  showPdf(lang) {
    this.pdfLang = lang;
    this.imageModal.show();
  }
}