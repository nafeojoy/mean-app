import { Injector, Injectable } from '@angular/core';
import { FormGroup, FormControl, FormArray } from '@angular/forms';

import { MultiLanguageModelService } from '../../../../shared/services/multi-language-model.service';
import { LanguageFormGroup } from '../../../../shared/interfaces/language-form-group.interface';

@Injectable()
export class AuthorModelService extends MultiLanguageModelService {
    constructor(injector: Injector) {
        super(injector);
    }
    public getFormModel(): FormGroup {
        return this.formBuilder.group({
            name: new LanguageFormGroup({}),
            birth_at: [null],
            birth_place: new LanguageFormGroup({}),
            occupation: new LanguageFormGroup({}),
            nationality: [''],
            description: new LanguageFormGroup({}),
            died_at: [null],
            is_featured:[false],
            featured_order:[1000],
            meta_tag_title: new LanguageFormGroup({}),
            meta_tag_description: new LanguageFormGroup({}),
            meta_tag_keywords: new LanguageFormGroup({}),
            seo_url: new LanguageFormGroup({}),
            awards: this.formBuilder.array([
                this.initAwards()
            ])
        });
    }

    initAwards() {
        return this.formBuilder.group({
            title: [''], //, Validators.required
            date: [null],
            reason: ['']
        });
    }
}