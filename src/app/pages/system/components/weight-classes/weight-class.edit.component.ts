import { Component, ViewEncapsulation } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Location } from '@angular/common';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

import { WeightClassService } from './weight-class.service';

import 'style-loader!./weight-class.scss';

@Component({
    selector: 'weight-class-edit',
    templateUrl: './weight-class.edit.html',
})
export class WeightClassEditComponent {
    form: FormGroup;

    constructor(fb: FormBuilder, private route: ActivatedRoute, private router: Router,
        private weightClassService: WeightClassService, private location: Location) {
        this.form = fb.group({
            'title': ['', Validators.compose([Validators.required])],
            'unit': ['', Validators.compose([Validators.required])],
            'value': [''],
            'is_enabled': [true]
        });
    }

    ngOnInit() {
        let weightClassId = this.route.snapshot.params['id'];

        if (weightClassId) {
            this.weightClassService.get(weightClassId).subscribe((res) => {
                this.form.controls['title'].setValue(res.title);
                this.form.controls['unit'].setValue(res.unit);
                this.form.controls['value'].setValue(res.value);
                this.form.controls['is_enabled'].setValue(res.is_enabled);
            });
        }
    }

    editWeightClass() {
        this.weightClassService.update(this.form.value).subscribe(() => {
            this.location.back();
        })
    }
}