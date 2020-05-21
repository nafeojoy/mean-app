import { Component, Input, forwardRef } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { LanguageService } from '../../../pages/system/components/languages/language.service';

import 'style-loader!./multi-language-input.scss';

@Component({
    selector: 'multi-language-input',
    providers: [LanguageService],
    templateUrl: './multi-language-input.html',
})
export class MultiLanguageInputComponent {
    @Input() public type: string;
    @Input() public name: string;
    @Input() public label: string;
    @Input() public isRequired: boolean;
    @Input() public parentGroup: FormGroup;
    @Input() public inputValue: any;
    @Input() public readOnly: boolean;

    languages: any;
    constructor(private languageService: LanguageService) { }
    ngOnInit() {
        this.languages = JSON.parse(window.localStorage.getItem('languages'));
        this.languages.forEach((language, i) => {
            if (this.isRequired) {
                if (this.inputValue) {
                    this.parentGroup.addControl(language.code,
                        new FormControl({ value: this.inputValue[language.code], disabled: this.readOnly }, Validators.required));
                } else {
                    this.parentGroup.addControl(language.code, new FormControl('', Validators.required));
                }

            } else {
                if (this.inputValue) {
                    this.parentGroup.addControl(language.code,
                        new FormControl({ value: this.inputValue[language.code], disabled: this.readOnly }));
                } else {
                    this.parentGroup.addControl(language.code, new FormControl(''));
                }
            }
        })
    }
}