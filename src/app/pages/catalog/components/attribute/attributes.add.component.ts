import { Component, ViewEncapsulation, ViewChild } from "@angular/core";
import { Location } from "@angular/common";
import { FormGroup, FormControl, FormArray, FormBuilder, Validators } from '@angular/forms';

import { AttributesService } from "./attributes.service";
import { AttributesModelService } from './attributes.model.service';

import 'style-loader!./attributes.scss';

@Component({
  selector: 'add-attributes',
  templateUrl: './attributes.add.html',
})


export class AttributesAddComponent {

  public form: FormGroup;

  constructor(private attributesService: AttributesService, private modelService: AttributesModelService, private location: Location) { }


  ngOnInit() {
    this.form = this.modelService.getFormModel();
    this.form.controls['is_enabled'].setValue(true);
  }

  save() {
      let attributes = this.modelService.getFormValue(this.form);
      this.attributesService.addAttribute(attributes).subscribe(result=>{
          alert("Saved Successfully")
          this.location.back();
      })
    }
}
