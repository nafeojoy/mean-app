import { Injector, Injectable } from '@angular/core';
import { FormGroup, FormControl, FormArray } from '@angular/forms';

import { MultiLanguageModelService } from '../../../../shared/services/multi-language-model.service';
import { LanguageFormGroup } from '../../../../shared/interfaces/language-form-group.interface';
import { TypeaheadFormGroup } from '../../../../shared/interfaces/typeahead-form-group.interface';

@Injectable()
export class ProductModelService extends MultiLanguageModelService {
	constructor(injector: Injector) {
		super(injector);
	}
	public getFormModel(): FormGroup {
		return this.formBuilder.group({
			name: new LanguageFormGroup({}),
			description: new LanguageFormGroup({}),
			published_at: [null],
			isbn: [''],
			discount_rate: [0],
			current_offer: [],
			price:[0],
			previous_price: [0],
			is_enabled: [true],
			is_out_of_stock: [false],
			is_out_of_print: [false],
			number_of_pages:[0],
			priority: [25000],
			is_bundle: [false],
			bundle_items: new TypeaheadFormGroup({}),
			free_delivery: [false],
			attributes: new TypeaheadFormGroup({}),
			category: new TypeaheadFormGroup({}),
			publisher: new TypeaheadFormGroup({}),
			author: new TypeaheadFormGroup({}),
			translator: new TypeaheadFormGroup({}),
			editor: new TypeaheadFormGroup({}),
			composer: new TypeaheadFormGroup({}),
			quantity: [],
			meta_tag_title: new LanguageFormGroup({}),
			meta_tag_description: new LanguageFormGroup({}),
			meta_tag_keywords: new LanguageFormGroup({}),
			seo_url: new LanguageFormGroup({}),
		});
	}
}
