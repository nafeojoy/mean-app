import { Component, ViewEncapsulation } from '@angular/core';

@Component({
    selector: 'info-pages',
    encapsulation: ViewEncapsulation.None,
    template: `
                <router-outlet></router-outlet>
            `,
})
export class InfoPagesComponent { }