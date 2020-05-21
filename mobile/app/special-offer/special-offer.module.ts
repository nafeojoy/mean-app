import { NgModule, ApplicationRef } from '@angular/core';
import { routing } from './special-offer.routing'
import { SpinnerModule } from 'angular2-spinner/dist';

import { SharedModule } from '../shared/shared.module';
import { SpecialOfferComponent, SpecialOfferService, MessageService } from './';




@NgModule({
    declarations: [
        SpecialOfferComponent,
    ],
    imports: [
        routing,
        SharedModule,
        SpinnerModule
    ],
    providers: [
        SpecialOfferService,
        MessageService
    ]
})

export class SpecialOfferModule { }