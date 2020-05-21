import { Component, ViewEncapsulation } from "@angular/core";
import { Router, ActivatedRoute, Params } from "@angular/router";
import { NgUploaderOptions } from "ngx-uploader";
import { Location } from "@angular/common";

import { GenerationSmsService } from "./generation-sms.service";

@Component({
  selector: "generation-sms.edit",
  templateUrl: "./generation-sms.edit.html"
})
export class GenerationSmsEditComponent {
  public _id: string;
  public smsList: any = [];
  public message_template: any = [];

  sms_generation: any = {};
  public selectedMsg: any = {};


  constructor(
    private route: ActivatedRoute,
    private generationSmsService: GenerationSmsService
  ) {}

  ngOnInit() {
    this._id = this.route.snapshot.params["id"];
    // console.log(this._id);

    this.generationSmsService.getMessages().subscribe(messages => {
      this.message_template = messages;
    //   console.log(this.message_template);
    });


    this.generationSmsService.getById(this._id).subscribe(result => {
      this.smsList = result;
       console.log(this.smsList);
    });
  }
  //----------Message Template Select
  selectMsg(msg) {
    this.smsList.message_text = msg.message_text;
    // this.selectedMsg = msg;
    // this.smsList = msg;
    // console.log(msg);

  }
  updateGeneratedSms(data) {
    console.log(data);
    let smsList = data;

    this.generationSmsService.update(smsList).subscribe(response => {
      if (response.success == true) {
        alert("Generated Code Updated");
      } else {
        alert("Update Failed");
      }
    });
  }
}
