import { NgModule, ApplicationRef } from '@angular/core';

import { SharedModule } from '../shared/shared.module';

import { routing } from './search-result.routing'
import { SearchResultComponent } from './search-result.component';
import { SearchResultService } from './search-result.service';

@NgModule({
    declarations: [
        SearchResultComponent,
    ],
    imports: [
        routing,
        SharedModule
    ],
    providers: [SearchResultService]
})

export class SearchResultModule { }