import { Component, ViewEncapsulation } from '@angular/core';
import { Location } from '@angular/common';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';

import { WeightClassService } from './weight-class.service';

import 'style-loader!./weight-class.scss';

@Component({
    selector: 'weight-class-add',
    templateUrl: './weight-class.add.html',
})
export class WeightClassAddComponent {
    form: FormGroup;

    constructor(fb: FormBuilder, private weightClassService: WeightClassService, private location: Location) {
        this.form = fb.group({
            'title': ['', Validators.compose([Validators.required])],
            'unit': ['', Validators.compose([Validators.required])],
            'value': [''],
            'is_enabled': [true]
        });
    }

    addWeightClass() {
        this.weightClassService.add(this.form.value).subscribe(() => {
            this.location.back();
        })
    }
}