import { Component, ViewEncapsulation, OnInit } from '@angular/core';
import { CookieService, CookieOptionsArgs } from 'angular2-cookie/core';

import { TranslateService } from '../../../shared/translate/translate.service';
import { PubSubService } from '../../../shared/services/pub-sub-service';

import 'style-loader!./language.scss';

@Component({
  selector: 'app-language',
  providers: [CookieService],
  templateUrl: './language.html',
  encapsulation: ViewEncapsulation.None
})

export class LanguageComponent {

  currentLanguage: string;
  supportedLanguages: any[];

  constructor(private _translate: TranslateService, private _cookieService: CookieService, private pubSubService: PubSubService) { }

  ngOnInit() {
    this.supportedLanguages = [
      { display: 'En', value: 'en' },
      { display: 'বাং', value: 'bn' },
    ];
    this.currentLanguage = this.getCookie('lang');

    if (!this.currentLanguage) {
      this.setCookie('lang', 'bn');
      this.currentLanguage = 'bn';
    }
  }


  selectLang(lang: string) {
    this.currentLanguage = lang;

    this.updateCookie('lang', lang, 500).then(isUpdate => {
      if (isUpdate) {
        this.pubSubService.LanguageStream.emit(lang);
      }
    })
    // On Language Change Page Content Update
  }

  getCookie(key: string) {
    return this._cookieService.get(key);
  }

  setCookie(key: string, value: string) {
    this._cookieService.put(key, value);
  }

  updateCookie(name, value, days) {
    return new Promise((resolve, reject) => {
      if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        var expires = "; expires=" + date.toUTCString();
      }
      else {
        var expires = "";
      }
      document.cookie = name + "=" + value + expires + "; path=/";
      resolve(true)
    })
  }

}


