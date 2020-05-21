import { Component, ViewEncapsulation } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Location } from '@angular/common';

import { LanguageService } from './language.service';

@Component({
    selector: 'language-edit',
    templateUrl: './language.edit.html',
})
export class LanguageEditComponent {
    currentLanguage: any = {};

    constructor(private route: ActivatedRoute, private router: Router,
        private languageService: LanguageService, private location: Location) { }

    ngOnInit() {
        let languageId = this.route.snapshot.params['id'];

        if (languageId) {
            this.languageService.get(languageId).subscribe((res) => {
                this.currentLanguage = res
            });
        }
    }

    editLanguage() {
        this.languageService.update(this.currentLanguage).subscribe(() => {
            this.location.back();
        })
    }
}