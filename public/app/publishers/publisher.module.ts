import { NgModule, ApplicationRef } from '@angular/core';

import { routing } from './publisher.routing';

import { SharedModule } from '../shared/shared.module';

import { PublisherListComponent } from './publishers.component';
import { PublisherListService } from './publishers.service';


@NgModule({
    declarations: [
        PublisherListComponent,
    ],
    imports: [
        routing,
        SharedModule
    ],
    providers: [
        PublisherListService
    ]
})

export class PublisherModule { }