import { Injector, Injectable } from '@angular/core';
import { FormGroup, FormControl, FormArray } from '@angular/forms';

import { MultiLanguageModelService } from '../../../../shared/services/multi-language-model.service';
import { LanguageFormGroup } from '../../../../shared/interfaces/language-form-group.interface';

@Injectable()
export class OrderStatusModelService extends MultiLanguageModelService {
    constructor(injector: Injector) {
        super(injector);
    }

    public getFormModel(): FormGroup {
        return this.formBuilder.group({
            name: new LanguageFormGroup({}),
            description: new LanguageFormGroup({}),
            is_enabled: [true],
            prinit_inprocess: [false],
            send_message: [false],
            message_text: [''],
        });
    }
}