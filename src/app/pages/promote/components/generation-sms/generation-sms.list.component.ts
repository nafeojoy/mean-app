import { Component, ViewEncapsulation, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalDirective } from 'ng2-bootstrap';
import { GenerationSmsService } from './generation-sms.service';
import { MessageService } from './message.service';

import 'style-loader!./generation-sms.scss';

@Component({
    selector: 'generation-sms-list',
    templateUrl: './generation-sms.list.html',
})

export class GenerationSmsListComponent {

    public smsList: any = [];
    public sms_type: any = [];
    public isClear: boolean = false;
    public selectedStatus: any = {};
    public type_search: any;
    public numbers: any;
    public messageText: string;

    @ViewChild('numberAll') numberAll: ModalDirective;
    @ViewChild('detailsAll') detailsAll: ModalDirective;

    constructor(private generationSmsService: GenerationSmsService, private messageService: MessageService) { }
    ngOnInit() {
        this.sms_type = ['All', 'Promo', 'Notification', 'Offers'];
        this.selectedStatus = 'Promo';

        this.generationSmsService.getSmsByType("Promo").subscribe((result) => {
            this.smsList = result;
        })
    }
    //SMS Type Select
    getSelectedPromo(type) {
        this.isClear = true;
        if (type == "All") {
            this.generationSmsService.getSmsByType("").subscribe((result) => {
                this.smsList = result;
                if (!this.smsList) {
                    alert("Data unavailable with this filter");
                }
            })

            setTimeout(() => {
                this.isClear = false;
            }, 100)

        } else {
            this.generationSmsService.getSmsByType(type).subscribe((result) => {
                this.smsList = result;
                // console.log(this.smsList);
                if (this.smsList.length == 0) {
                    alert("Data unavailable with this filter");
                }
            })
            setTimeout(() => {
                this.isClear = false;
            }, 100)
        }
    }
    viewNumbers(sms) {
        this.numbers = sms.phone_numbers;
        console.log(sms);
        this.numberAll.show();
    }
    viewDetails(sms) {
        this.messageText = sms.message_text;
        this.detailsAll.show();
    }

    hideNumbers() {
        this.numberAll.hide();
    }
    hideDetails() {
        this.detailsAll.hide();
    }

    sendSms(sms) {
        this.generationSmsService.sendSms(sms).subscribe((res) => {
            alert("SMS Sent");
            this.generationSmsService.getSmsByType(sms.sms_type).subscribe((result) => {
                this.smsList = result;
            })
        })
    }
    cancelSms(sms){
        this.generationSmsService.cancel(sms).subscribe((res) => {
            alert("SMS Cancelled");
            this.generationSmsService.getSmsByType(sms.sms_type).subscribe((result) => {
                this.smsList = result;
            })
        })
    }

}