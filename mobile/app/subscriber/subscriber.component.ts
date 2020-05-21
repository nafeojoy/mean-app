import { Component, ViewEncapsulation } from '@angular/core';

@Component({
    selector: 'subscriber',
    encapsulation: ViewEncapsulation.None,
    template: ` 
                <router-outlet></router-outlet>
            `,
})
export class SubscriberComponent { }