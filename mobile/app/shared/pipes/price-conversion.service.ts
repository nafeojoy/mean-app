// app/translate/translate.service.ts

import { Injectable, Inject } from '@angular/core';
import { CookieService } from 'angular2-cookie/core';

import { PubSubService } from '../services/pub-sub-service';

@Injectable()
export class PriceService {
    private _currentLang: string;

    public get currentLang() {
        return this._currentLang;
    }

    constructor(private pubSubService: PubSubService, private _cookieService: CookieService) {
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


    public convertPrice(value: number) {

        let originalValue = value.toString();

        if (this._currentLang == 'en') {
            originalValue = 'Tk. ' + originalValue;
            return originalValue;
        }

        let convertedValue: string = '';

        for (var i = 0; i < originalValue.length; i++) {
            switch (originalValue[i]) {
                case '0':
                    convertedValue = convertedValue + '০';
                    break;
                case '1':
                    convertedValue = convertedValue + '১';
                    break;

                case '2':
                    convertedValue = convertedValue + '২';
                    break;

                case '3':
                    convertedValue = convertedValue + '৩';
                    break;

                case '4':
                    convertedValue = convertedValue + '৪';
                    break;

                case '5':
                    convertedValue = convertedValue + '৫';
                    break;

                case '6':
                    convertedValue = convertedValue + '৬';
                    break;

                case '7':
                    convertedValue = convertedValue + '৭';
                    break;

                case '8':
                    convertedValue = convertedValue + '৮';
                    break;

                case '9':
                    convertedValue = convertedValue + '৯';
                    break;
            }
        }

        
         convertedValue = '৳ ' + convertedValue;
        
        return convertedValue;
    }

    public convertNumber(value: number) {

        let originalValue = value.toString();

        if (this._currentLang == 'en') {
           // originalValue = 'Tk ' + originalValue;
            return originalValue;
        }

        let convertedValue: string = '';

        for (var i = 0; i < originalValue.length; i++) {
            switch (originalValue[i]) {
                case '0':
                    convertedValue = convertedValue + '০';
                    break;
                case '1':
                    convertedValue = convertedValue + '১';
                    break;

                case '2':
                    convertedValue = convertedValue + '২';
                    break;

                case '3':
                    convertedValue = convertedValue + '৩';
                    break;

                case '4':
                    convertedValue = convertedValue + '৪';
                    break;

                case '5':
                    convertedValue = convertedValue + '৫';
                    break;

                case '6':
                    convertedValue = convertedValue + '৬';
                    break;

                case '7':
                    convertedValue = convertedValue + '৭';
                    break;

                case '8':
                    convertedValue = convertedValue + '৮';
                    break;

                case '9':
                    convertedValue = convertedValue + '৯';
                    break;
            }
        }

        
        // convertedValue = '৳ ' + convertedValue;
        
        return convertedValue;
    }

   
}