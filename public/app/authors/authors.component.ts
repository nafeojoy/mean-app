import { Component, ViewEncapsulation, HostListener } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';

import { AuthorListService } from './authors.service';
import { PubSubService } from '../shared/services/pub-sub-service';

import 'style-loader!./authors.scss';

@Component({
    selector: 'authors',
    templateUrl: './authors.html',
    encapsulation: ViewEncapsulation.None
})

export class AuthorListComponent {
    public authors: any = [];

    public maxSize: number = 5;
    public currentPage: number = 1;
    public ratingData: number = 3.5;

    public busy: Subscription;

    constructor(private authorListService: AuthorListService, private pubSubService: PubSubService,
        private router: Router, private route: ActivatedRoute) { }

    ngOnInit() {
        this.loadAuthors();
        this.pubSubService.LanguageStream.subscribe((result) => {
            this.loadAuthors();
        });
    }

    loadAuthors() {
        this.busy = this.authorListService.get(this.currentPage).subscribe((result) => {
            this.authors = this.authors.concat(result.data);
        })
    }

    getSelectedProduct(seo_url) {
        this.router.navigate(['../author-books', seo_url]);
    }

    @HostListener("window:scroll", [])
    onScroll(): void {
        if ((window.innerHeight + window.scrollY + 100) >= document.body.offsetHeight) {
            window.scrollTo(0, (window.scrollY - 100));
            this.currentPage++;
            this.loadAuthors();
        }
    }

}