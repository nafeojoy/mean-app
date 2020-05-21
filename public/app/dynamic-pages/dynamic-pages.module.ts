import { NgModule, ApplicationRef } from '@angular/core';
// import { Ng2MapModule } from 'ng2-map';

import { SharedModule } from '../shared/shared.module';
import { routing } from './dynamic-pages.routing';
import { DynamicPagesComponent } from "./dynamic-pages.component";
import{ DynamicPagesService} from "./dynamic-pages.service";


@NgModule({
    declarations: [
        DynamicPagesComponent,
      
    ],
    imports: [
        routing,
        SharedModule,
        // Ng2MapModule.forRoot({ apiUrl: 'https://maps.google.com/maps/api/js?key=AIzaSyAeUTQot6NxV6a8EYBZxuVfQ6_-LRNNblE ' })
    ],
    providers: [DynamicPagesService]
})

export class DynamicPagesModule { }
