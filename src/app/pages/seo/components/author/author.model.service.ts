import { Injector, Injectable } from '@angular/core';
import { FormGroup, FormControl, FormArray } from '@angular/forms';

import { MultiLanguageModelService } from '../../../../shared/services/multi-language-model.service';
import { LanguageFormGroup } from '../../../../shared/interfaces/language-form-group.interface';
import { TypeaheadFormGroup } from '../../../../shared/interfaces/typeahead-form-group.interface';

@Injectable()
export class AuthorModelService extends MultiLanguageModelService {
    constructor(injector: Injector) {
        super(injector);
    }
    public getFormModel(): FormGroup {
        return this.formBuilder.group({
            name: new LanguageFormGroup({}),
            description: new LanguageFormGroup({}),
            meta_tag_title: new LanguageFormGroup({}),
            meta_tag_description: new LanguageFormGroup({}),
            meta_tag_keywords: new LanguageFormGroup({}),
            seo_url: new LanguageFormGroup({})
        });
    }
}