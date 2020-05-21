import { Injector, Injectable } from '@angular/core';
import { FormGroup, FormControl, FormArray, Validators, } from '@angular/forms';
import { EmailValidator } from '../../../../theme/validators';

import { MultiLanguageModelService } from '../../../../shared/services/multi-language-model.service';
import { LanguageFormGroup } from '../../../../shared/interfaces/language-form-group.interface';
import { PublisherAsyncValidator } from './publisher.validator';
import { TypeaheadFormGroup } from '../../../../shared/interfaces/typeahead-form-group.interface';

@Injectable()
export class PublisherModelService extends MultiLanguageModelService {
    constructor(injector: Injector) {
        super(injector);
    }

    public getFormModel(): FormGroup {
        return this.formBuilder.group({
            name: new LanguageFormGroup({}),
            description: new LanguageFormGroup({}),
            is_featured:[false],
            featured_order:[1000],
            phone: ['', Validators.compose([Validators.required, Validators.minLength(8)])],
            email: ['', Validators.compose([Validators.required, EmailValidator.validate])],
            address: ['', Validators.compose([Validators.required])],
            website: [''],
            page_url: ['', Validators.compose([Validators.required])],
            is_author:[false],
            author: new TypeaheadFormGroup({}),
            logo: [''],
            order: [''],
            meta_tag_title: new LanguageFormGroup({}),
            meta_tag_description: new LanguageFormGroup({}),
            meta_tag_keywords: new LanguageFormGroup({}),
            seo_url: new LanguageFormGroup({}),
            is_enabled: [true],
        });
    }
}