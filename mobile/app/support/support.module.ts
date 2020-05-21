import { NgModule, ApplicationRef } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedModule } from '../shared/shared.module';

import { SupportComponent } from './support.component';
import { routing } from './support.routing';
import { HelpAndSupportComponent } from "./components/help-and-support";
import { FaqComponent } from "./components/faq";
import { HelpDeskComponent } from "./components/help-desk";


@NgModule({
    declarations: [
        SupportComponent,
        HelpAndSupportComponent,
        FaqComponent,
        HelpDeskComponent,
    ],
    imports: [
        CommonModule,
        routing,
        SharedModule,
    ],
    providers: [],

    exports: []
})

export class SupportModule { }