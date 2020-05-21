import { NgModule, ApplicationRef } from '@angular/core';

import { routing } from './category.routing'

import { SharedModule } from '../shared/shared.module';

import { CategoryListComponent } from './categories.component';
import { CategoryListService } from './categories.service';


@NgModule({
    declarations: [
        CategoryListComponent,
    ],
    imports: [
        routing,
        SharedModule
    ],
    providers: [
        CategoryListService
    ]
})

export class CategoryModule { }