import { Injector, Injectable } from '@angular/core';
import { FormGroup, FormControl, FormArray, Validators, } from '@angular/forms';
import { EmailValidator } from '../../../../theme/validators';

import { MultiLanguageModelService } from '../../../../shared/services/multi-language-model.service';
import { LanguageFormGroup } from '../../../../shared/interfaces/language-form-group.interface';
// import { attributesAsyncValidator } from './attributes.validator';

@Injectable()
export class AttributesModelService extends MultiLanguageModelService {
    constructor(injector: Injector) {
        super(injector);
    }

    public getFormModel(): FormGroup {
        return this.formBuilder.group({
            name: new LanguageFormGroup({}),
            is_enabled: [true],
            is_featured:[false],
            featured_order:[1000]
        });
    }
}