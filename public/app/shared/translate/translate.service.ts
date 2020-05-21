// app/translate/translate.service.ts

import { Injectable, Inject } from '@angular/core';
import { CookieService } from 'angular2-cookie/core';

import { TRANSLATIONS } from './translations'; // import our opaque token
import { PubSubService } from '../services/pub-sub-service';

@Injectable()
export class TranslateService {
    private _currentLang: string;

    public get currentLang() {
        return this._currentLang;
    }

    // inject our translations
    constructor( @Inject(TRANSLATIONS) private _translations: any, 
        private pubSubService: PubSubService, private _cookieService: CookieService) {
        this._currentLang = this._cookieService.get('lang');
        
        this.pubSubService.LanguageStream.subscribe((result) => {
            this._currentLang = this._cookieService.get('lang');
            this.use(this._currentLang);
        });
    }

    public use(lang: string): void {
        // set current language
        this._currentLang = lang;
    }

    private translate(key: string): string {
        // private perform translation
        let translation = key;

        if (this._translations[this.currentLang] && this._translations[this.currentLang][key]) {
            return this._translations[this.currentLang][key];
        }

        return translation;
    }

    public instant(key: string) {
        // call translation
        return this.translate(key);
    }
}