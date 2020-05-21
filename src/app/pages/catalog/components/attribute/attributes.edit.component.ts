import { Component, ViewEncapsulation, ViewChild } from "@angular/core";
import { Location } from "@angular/common";
import { FormGroup, FormBuilder, FormArray, Validators, FormControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { AttributesService } from "./attributes.service";
import { AttributesModelService } from './attributes.model.service';

import 'style-loader!./attributes.scss';

@Component({
    selector: 'attributes-edit',
    templateUrl: './attributes.edit.html',
})

export class AttributesEditComponent {
    public form: FormGroup;

    private attributes_id: string;
    attributes_name: any = {};

    constructor(private route: ActivatedRoute, private modelService: AttributesModelService,
        private attributesService: AttributesService, private location: Location) { }

    ngOnInit() {
        this.form = this.modelService.getFormModel();
        let defaultLanguageCode = this.modelService.defaultLanguageCode;
        this.attributes_id = this.route.snapshot.params['id'];
        // this.attributesService.getById(this.attributes_id).subscribe((result) => {
            let result = JSON.parse(window.localStorage.getItem(this.attributes_id));
            this.form.controls['is_enabled'].setValue(result.is_enabled);
            this.form.controls['is_featured'].setValue(result.is_featured);
            this.form.controls['featured_order'].setValue(result.featured_order);
            this.attributes_name[defaultLanguageCode] = result.name;
            let languages = result.lang;

            for (var i in languages) {
                this.attributes_name[languages[i].code] = languages[i].content.name;
            }
        // })
    }

    update() {
        let attributes = this.modelService.getFormValue(this.form);
        attributes._id = this.attributes_id
        this.attributesService.update(attributes).subscribe(result=>{
            if(result._id){
                alert("Updated Successfully");
                this.location.back();
            }else{
                alert("Update Failed!")
            }
        })

    }
}