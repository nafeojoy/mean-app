import { Component, ViewEncapsulation } from '@angular/core';

@Component({
    selector: 'contents',
    encapsulation: ViewEncapsulation.None,
    template: ` 
                <router-outlet></router-outlet>
            `,
})
export class ContentsComponent { }