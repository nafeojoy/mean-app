import { Injector, Injectable } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { MultiLanguageModelService } from '../../../../shared/services/multi-language-model.service';

@Injectable()
export class GiftModelService extends MultiLanguageModelService {
    constructor(injector: Injector) {
        super(injector);
    }

    public getFormModel(): FormGroup {
        return this.formBuilder.group({
            name: ['', Validators.required],
            description: [''],
            is_enabled: [true],
            gift_cost: [0],
            estimated_qty: [0],
            allocated_qty: [0]
        });
    }
}