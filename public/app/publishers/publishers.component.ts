import { Component, ViewEncapsulation, HostListener } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';

import { PublisherListService } from './publishers.service';
import { PubSubService } from '../shared/services/pub-sub-service';

import 'style-loader!./publishers.scss';

@Component({
    selector: 'publishers',
    templateUrl: './publishers.html',
    encapsulation: ViewEncapsulation.None
})
export class PublisherListComponent {
    public publishers: any = [];

    public maxSize: number = 5;
    public currentPage: number = 1;
    public ratingData: number = 3.5;

    public busy: Subscription;

    constructor(private publisherListService: PublisherListService, private pubSubService: PubSubService,
        private router: Router, private route: ActivatedRoute) { }

    ngOnInit() {
        this.loadPublishers();
        this.pubSubService.LanguageStream.subscribe((result) => {
            this.loadPublishers();
        });
    }

    loadPublishers() {
        this.busy = this.publisherListService.get(this.currentPage).subscribe((result) => {
            this.publishers = this.publishers.concat(result.data);
        })
    }

    getSelectedProduct(seo_url) {
        this.router.navigate(['../publisher-books', seo_url]);
    }

    @HostListener("window:scroll", [])
    onScroll(): void {
        if ((window.innerHeight + window.scrollY + 100) >= document.body.offsetHeight) {
            this.currentPage++;
            window.scrollTo(0, (window.scrollY - 100));
            this.loadPublishers();
        }
    }
}