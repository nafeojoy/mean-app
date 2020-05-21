import { Component, ViewEncapsulation, HostListener } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';

import { CategoryListService } from './categories.service';
import { PubSubService } from '../shared/services/pub-sub-service';

import 'style-loader!./categories.scss';
import { log } from 'util';

@Component({
    selector: 'categories',
    templateUrl: './categories.html',
    encapsulation: ViewEncapsulation.None
})
export class CategoryListComponent {
    public categories: any = [];

    public maxSize: number = 5;
    public currentPage: number = 1;
    public ratingData: number = 3.5;
    public busy: Subscription;

    constructor(private categoryListService: CategoryListService, private pubSubService: PubSubService,
                private router: Router, private route: ActivatedRoute) { }

    ngOnInit() {
        this.loadCategories();

        this.pubSubService.LanguageStream.subscribe((result) => {
            this.loadCategories();
        });
    }

    loadCategories() {
        this.busy = this.categoryListService.get(this.currentPage).subscribe((result) => {
            this.categories = this.categories.concat(result.data);
        })
    }

    getSelectedProduct(seo_url) {
        this.router.navigate(['../category-books', seo_url]);
    }

    @HostListener("window:scroll", [])
    onScroll(): void {
        if ((window.innerHeight + window.scrollY + 100) >= document.body.offsetHeight) {
            window.scrollTo(0, (window.scrollY - 100));
            this.currentPage++;
            this.loadCategories();
        }
    }
}