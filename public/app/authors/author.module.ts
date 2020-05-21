import { NgModule, ApplicationRef } from '@angular/core';
import { routing } from './author.routing'

import { SharedModule } from '../shared/shared.module';

import { AuthorListComponent } from './authors.component';
import { AuthorListService } from './authors.service';


@NgModule({
    declarations: [
        AuthorListComponent,
    ],
    imports: [
        routing,
        SharedModule
    ],
    providers: [
        AuthorListService
    ]
})

export class AuthorModule { }