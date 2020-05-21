import { Component, ViewEncapsulation } from '@angular/core';
import { FeatureCategoryService } from './feature-category.service'

import 'style-loader!./feature-category.scss';

@Component({
    selector: 'feature-category-list',
    encapsulation: ViewEncapsulation.None,
    templateUrl: './feature-category.list.html',
})
export class FeatureCategoryListComponent {

    public apiBaseUrl: string;
    public categories: any = [];
    public alerts: any = [];
    
    public totalItems: number;
    public currentPage: number = 1;
    public maxSize: number = 5;

    public droppedCategories: any = [];
    public featured = [];
    public dropingIndex: number;
    public searchCriterion: any = {};
    constructor(private featureCategoryService: FeatureCategoryService) {
    }

    ngOnInit() {
        this.featureCategoryService.getInitData().subscribe(result => {
            this.categories = result.categories.items;
            this.totalItems = result.categories.count;
            this.featured = result.featured;
        })
    }

    searchCategory() {
        this.currentPage = 1;
        this.searchCriterion.currentPage = this.currentPage
        this.featureCategoryService.getUnfeatured(this.searchCriterion).subscribe(result => {
            this.totalItems = result.count;
            this.filterCategory(result.items, this.droppedCategories);
        })
    }

    addToFeatured(e: any) {
        if (this.featured.length < 15) {
            this.featured.push(e.dragData);
            this.removeItem(e.dragData, this.categories)
        } else {
            this.alerts.push({
                type: 'danger',
                msg: 'Max 15 item can be added',
                timeout: 3000
            });
        }
    }


    removeItem(item: any, list: Array<any>) {
        let index = list.map((e) => {
            return e._id
        }).indexOf(item._id);
        list.splice(index, 1);
    }

    setPage(): void {
        this.featureCategoryService.getUnfeatured({pageNum: this.currentPage}).subscribe(result => {
            this.totalItems = result.count;
            this.filterCategory(result.items, this.droppedCategories);
        })
    }

    filterCategory(category, updateItems) {
        let exist_ids = updateItems.map(obj => {
            return obj._id;
        })
        this.categories = category.filter(obj => {
            return exist_ids.indexOf(obj._id) == -1;
        })
    }


    remove(data, index) {
        if (this.featured.length > 4) {
            this.featureCategoryService.remove(data._id).subscribe(result => {
                if (result.success) {
                    this.categories.unshift(data);
                    this.featured.splice(index, 1)
                }
            })
        } else {
            this.alerts.push({
                type: 'danger',
                msg: "Can't be removed. Should be kept at least 4 items",
                timeout: 3000
            });
        }
    }

    save() {
        let new_features = [];
        new_features = this.featured.map((feature, i) => {
            return { _id: feature._id, featured: { status: true, tab_priority: (i + 1) } }
        })
        if (new_features.length > 3) {
            this.featureCategoryService.update(new_features).subscribe((response => {
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
        } else {
            this.alerts.push({
                type: 'danger',
                msg: "Feature category must be greater then 3",
                timeout: 3000
            });
        }
    }

}
