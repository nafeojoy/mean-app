import { Component, ViewEncapsulation, Input } from '@angular/core';
import { Router } from "@angular/router";


@Component({
    selector: 'author-details',
    templateUrl: './author-details.html'
})
export class AuthorDetailsComponent {
    private _authors: any;
    private _busy: any;

    @Input()
    set authors(value) {
        this._authors = value;
    }

    get authors() {
        return this._authors;
    }

    @Input()
    set busy(value) {
        this._busy = value;
    }

    get busy() {
        return this._busy;
    }

    constructor(private router: Router) { }

    goToAuthorDetailsPage(seo_url) {
        this.router.navigateByUrl('/author-books/' + seo_url);
    }
}