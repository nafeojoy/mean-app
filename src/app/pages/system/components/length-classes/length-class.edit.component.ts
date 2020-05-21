import { Component, ViewEncapsulation } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Location } from '@angular/common';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

import { LengthClassService } from './length-class.service';

@Component({
    selector: 'length-class-edit',
    templateUrl: './length-class.edit.html',
})
export class LengthClassEditComponent {
    form: FormGroup;

    constructor(fb: FormBuilder, private route: ActivatedRoute, private router: Router,
        private lengthClassService: LengthClassService, private location: Location) {
        this.form = fb.group({
            'title': ['', Validators.compose([Validators.required])],
            'unit': ['', Validators.compose([Validators.required])],
            'value': [''],
            'is_enabled': [true]
        });
    }

    ngOnInit() {
        let lengthClassId = this.route.snapshot.params['id'];

        if (lengthClassId) {
            this.lengthClassService.get(lengthClassId).subscribe((res) => {
                this.form.controls['title'].setValue(res.title);
                this.form.controls['unit'].setValue(res.unit);
                this.form.controls['value'].setValue(res.value);
                this.form.controls['is_enabled'].setValue(res.is_enabled);
            });
        }
    }

    editLengthClass() {
        this.lengthClassService.update(this.form.value).subscribe(() => {
            this.location.back();
        })
    }
}