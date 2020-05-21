import { Component, ViewEncapsulation } from '@angular/core';
import { FeatureAuthorService } from './feature-authors.service'

import 'style-loader!./feature-authors.scss';

@Component({
    selector: 'feature-authors',
    templateUrl: './feature-authors.list.html',
})
export class FeatureAuthorListComponent {

    public apiBaseUrl: string;
    public authors: any = [];
    public alerts: any = [];
    public totalItems: number;
    public currentPage: number = 1;
    public maxSize: number = 5;

    public droppedAuthors: any = [];

    public dropingIndex: number;

    constructor(private featureAuthorService: FeatureAuthorService) {
    }

    ngOnInit() {
        this.featureAuthorService.getFeatured().subscribe(result => {
            this.droppedAuthors = result;
            this.featureAuthorService.getAuthors(this.currentPage).subscribe(res => {
                this.filterAuthor(res.items, this.droppedAuthors);
                this.totalItems = res.count;
            })
        })
    }

    save() {
        this.featureAuthorService.update(this.droppedAuthors).subscribe((response => {
            if (response.success) {
                this.alerts.push({
                    type: 'info',
                    msg: "Your Changes has been saved",
                    timeout: 3000
                });
            } else {
                this.alerts.push({
                    type: 'danger',
                    msg: response.message,
                    timeout: 3000
                });
            }

        }))
    }


    addToFeatured(e: any) {
        this.droppedAuthors.push(e.dragData);
        this.removeItem(e.dragData, this.authors)
    }


    removeItem(item: any, list: Array<any>) {
        let index = list.map((e) => {
            return e._id
        }).indexOf(item._id);
        list.splice(index, 1);
    }

    setPage(): void {
        this.featureAuthorService.getAuthors(this.currentPage).subscribe(result => {
            this.totalItems = result.count;
            this.filterAuthor(result.items, this.droppedAuthors);
        })
    }

    filterAuthor(author, fAuthor) {
        let exist_ids = fAuthor.map(obj => {
            return obj._id;
        })
        this.authors = author.filter(obj => {
            return exist_ids.indexOf(obj._id) == -1;
        })
    }

    remove(data, index) {
        this.featureAuthorService.remove(data._id).subscribe(result => {
            if (result.status) {
                this.droppedAuthors.splice(index, 1)
            }
        })
    }
}
