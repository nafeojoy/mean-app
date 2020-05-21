import { Component, ViewEncapsulation, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalDirective } from 'ng2-bootstrap';

import { GenerationSmsService } from './../generation-sms/generation-sms.service'

@Component({
    selector: 'message-template',
    templateUrl: './message-template.html',
})

export class MessageTemplateComponent {

    msg: any = {};

    constructor(private generationSmsService: GenerationSmsService) { }

    templateAdd(msg) {
        if (confirm("Do you want to add?")) {
            this.generationSmsService.messageAdd(msg).subscribe(result => {
                alert("Message Template Added");
            })
        }
    }
}