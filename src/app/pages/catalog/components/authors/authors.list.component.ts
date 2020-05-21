import { Component, ViewEncapsulation } from "@angular/core";
import { Observable } from 'rxjs/Observable';

import 'rxjs/add/operator/mergeMap';
import { AuthorService } from "./authors.service";
import { NationalityService } from "./nationality.service";
import { AuthManager } from "../../../../authManager";

import { PaginationSearchBase } from '../../../../shared/classes/pagination-search-base';

import 'style-loader!./authors.scss';

@Component({
    selector: 'authors-list',
    templateUrl: './authors.list.html'
})

export class AuthorsListComponent extends PaginationSearchBase {
    public apiBaseUrl: string;
    public authors: Observable<any[]>;

    public nationalities: any;
    public nationality: String;

    public profile: any = { picture: '' };
    public uploaded_image: String = '';

    awardObjects = [];
    awardObject = {};

    selectedAuthor: any = {};

    public showAwardBox = false;

    constructor(private authorService: AuthorService,
        private nationalityService: NationalityService, public authManager: AuthManager) {
        super();
        this.apiBaseUrl = this.authorService.apiBaseUrl;
        this.authors = this.authorService.authors;
        this.totalItems = this.authorService.count;

        this.dataSource
            .mergeMap((params: { search: string, page: number, limit: number }) => {
                if (params.search && params.search.length) {
                    this.authorService.search(params.search, params.page, params.limit);
                } else {
                    this.authorService.getPaged(params.page, params.limit);
                }
                return this.authorService.authors;
            })
            .subscribe();
    }

    ngOnInit() {
        this.authorService.getPaged();
        this.nationalities = this.nationalityService.getNationality();

        for (var key in localStorage) {
            if (key.length == 24) {
                localStorage.removeItem(key);
            }
        }
    }

    public uploaderOptions: any = {
        url: '/upload'
    };

    getUploadedData(data) {
        var str = data.response.split(',')[1].split(':')[1]
        this.uploaded_image = str.substring(1, str.length - 3);
    }

    view(author) {
        this.selectedAuthor = author;
    }

    showEditModal(author) {
        this.selectedAuthor = author;
        this.profile.picture = 'api/upload/' + author.image;
        this.awardObjects = author.notable_awards;
    }

    update(author) {
        author.notable_awards = this.awardObjects;
        if (this.uploaded_image != '') {
            author.image = this.uploaded_image;
        } else {
            author.image = author.image;
        }
        this.authorService.update(author)
    }

    showDeleteModal(author) {
        this.selectedAuthor = author;
    }

    delete() {
        this.authorService.delete(this.selectedAuthor._id)
    }

    isHide1 = true;
    editDate1() {
        this.isHide1 = false;
    }

    isHide2 = true;
    editDate2() {
        this.isHide2 = false;
    }

    toggleAwardBox() {
        this.showAwardBox = !this.showAwardBox;
    }

    awardIndex = -1;

    editAward(award, index) {
        this.awardObject = award;
        this.awardIndex = index;
    }

    addAward(newAward) {
        if (this.awardIndex != -1) {
            this.awardObjects[this.awardIndex] = newAward;
        } else {
            this.awardObjects.push(newAward);
        }
        this.awardIndex = -1;
        this.awardObject = {};
    }

    set(data) {
        window.localStorage.setItem(data._id, JSON.stringify(data));
    }
}
