import { Component, ViewEncapsulation } from '@angular/core';
import { Location } from '@angular/common';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';

import { LengthClassService } from './length-class.service';

@Component({
    selector: 'length-class-add',
    templateUrl: './length-class.add.html',
})
export class LengthClassAddComponent {
    form: FormGroup;

    constructor(fb: FormBuilder, private lengthClassService: LengthClassService, private location: Location) {
        this.form = fb.group({
            'title': ['', Validators.compose([Validators.required])],
            'unit': ['', Validators.compose([Validators.required])],
            'value': [''],
            'is_enabled': [true]
        });
    }

    addLengthClass() {
        this.lengthClassService.add(this.form.value).subscribe(() => {
            this.location.back();
        })
    }
}