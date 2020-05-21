import { Component, ViewEncapsulation, ViewChild } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { ModalDirective } from "ng2-bootstrap";
import { GenerationSmsService } from "./generation-sms.service";

import "style-loader!./generation-sms.scss";
import { String } from "shelljs";
import { OnInit } from "@angular/core/src/metadata/lifecycle_hooks";

@Component({
  selector: "generation-sms",
  templateUrl: "./generation-sms.html"
})
export class GenerationSmsComponent implements OnInit {
  sms_generation: any = {};
  public selectedMsg: any = {};

  isBulkUnChecked: boolean = false;
  public promoList: any = [];
  public numberList: any = [];
  public sms_type: any = [];
  public message_template: any = [];

  public selectedStatus: any = {};

  public promoId: String;
  public isClear: boolean = false;
  public singleBulk: any = [];

  public csvContent: string;
  csvRecords = [];
  csvRecordsArray = [];

  constructor(private generationSmsService: GenerationSmsService) {}

  ngOnInit() {
    this.sms_type = ["Promo", "Notification", "Offers"];
    this.generationSmsService.getMessages().subscribe(messages => {
      this.message_template = messages;
    });
  }

  //Button Generate
  GenerateSms(sms_generation) {
    console.log(sms_generation);
    if (this.isBulkUnChecked) {
      if (sms_generation.message_text) {
        let date = new Date();
        sms_generation.generation_time = date.toISOString();
        sms_generation.sms_type = this.selectedStatus;
        sms_generation.ref_id = this.promoId;
        sms_generation.number_count = 1;

        this.generationSmsService
          .addToSmsGeneration(sms_generation)
          .subscribe(result => {
            alert("Single Sms Generated");
          });
      } else {
        alert("Please Select Required Fields");
      }
    } else {
      if (sms_generation.message_text) {
        let date = new Date();
        sms_generation.generation_time = date.toISOString();
        sms_generation.sms_type = this.selectedStatus;
        sms_generation.ref_id = this.promoId;
        sms_generation.phone_numbers = this.numberList;
        sms_generation.number_count = this.numberList.length;
    
        
        this.generationSmsService
          .addToSmsGeneration(sms_generation)
          .subscribe(res => {
            alert("Bulk Sms Generated");
          });
      } else {
        alert("Please Select Required Fields");
      }
    }
  }

  //-------Bulk or Single
  toggle() {
    if (this.isBulkUnChecked) {
      this.isBulkUnChecked = false;
    } else {
      this.isBulkUnChecked = true;
    }
  }

  //----------Search For Promo Code
  getPromos(text) {
    this.generationSmsService.getSearchedPromos(text).subscribe(result => {
      this.promoList = result.data;
    });
  }

  //---------SMS Type Select
  getSelectedPromo(data) {
    this.isClear = true;
    setTimeout(() => {
      this.isClear = false;
    }, 100);
    if (data._id) {
      this.promoId = data.promo_code;
    }
  }

  //----------Message Template Select
  selectMsg(msg) {
    this.selectedMsg = msg;
    this.sms_generation = msg;
  }

  //Bulk File Select
  onFileSelect(input: HTMLInputElement) {
    const files = input.files;

    if (files && files.length) {
      const fileToRead = input.files[0];
      //console.log(fileToRead);
      let reader = new FileReader();
      reader.readAsText(input.files[0]);

      reader.onload = data => {
        let csvData = reader.result;
        this.numberList = csvData.split(/\r\n|\n/);
        this.numberList = this.numberList.splice(0, this.numberList.length - 1);
        

        if (!this.numberList) {
          alert("Data unavailable");
        }
      };
      reader.onerror = function() {
        alert("Unable to read " + input.files[0]);
      };
    }
  }
}
