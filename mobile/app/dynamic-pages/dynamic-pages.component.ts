import { Component, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { DynamicPagesService } from './dynamic-pages.service';

@Component({
    selector: 'dynamic-pages',
    encapsulation: ViewEncapsulation.None,
    templateUrl: "./dynamic-pages.html",
})

export class DynamicPagesComponent {
    public busy: Subscription;

    public page_url: string;
    public content_object: any = {};

    constructor(private dynamicPagesService: DynamicPagesService, private route: ActivatedRoute, private router: Router) {

    }

    ngOnInit() {
        this.page_url = this.route.snapshot.params['page_url'];
        this.busy = this.dynamicPagesService.getPageContent(this.page_url).subscribe(result => {
            if (result.status) {
                this.content_object = result.content;
            } else {
                this.router.navigateByUrl('/')
            }
        })
    }
}
