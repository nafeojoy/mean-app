import { Component, ViewEncapsulation } from '@angular/core';
import { Location } from '@angular/common';

import { LanguageService } from './language.service';

@Component({
    selector: 'language-add',
    templateUrl: './language.add.html',
})
export class LanguageAddComponent {
    newLanguage: any = {};

    constructor(private languageService: LanguageService, private location: Location) {
        this.newLanguage.is_enabled = true;
    }

    addLanguage() {
        this.languageService.add(this.newLanguage).subscribe(() => {
            this.location.back();
        })
    }
}