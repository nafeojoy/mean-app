import { Component, ViewEncapsulation } from '@angular/core';
import { FeatureCategorysService } from './feature-categorys.service'

import 'style-loader!./feature-categorys.scss';

@Component({
    selector: 'feature-categorys',
    templateUrl: './feature-categorys.list.html',
})
export class FeatureCategorysListComponent {

    public apiBaseUrl: string;
    public categorys: any = [];
    public alerts: any = [];
    public totalItems: number;
    public currentPage: number = 1;
    public maxSize: number = 5;

    public droppedCategorys: any = [];

    public dropingIndex: number;

    constructor(private featureCategorysService: FeatureCategorysService) {
    }

    ngOnInit() {
        this.featureCategorysService.getFeatured().subscribe(result => {
            this.droppedCategorys = result;
            this.featureCategorysService.getCategorys(this.currentPage).subscribe(res => {
                this.filterCategorys(res.items, this.droppedCategorys);
                this.totalItems = res.count;
            })
        })
    }

    save() {
        this.featureCategorysService.update(this.droppedCategorys).subscribe((response => {
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
        this.droppedCategorys.push(e.dragData);
        this.removeItem(e.dragData, this.categorys)
    }


    removeItem(item: any, list: Array<any>) {
        let index = list.map((e) => {
            return e._id
        }).indexOf(item._id);
        list.splice(index, 1);
    }

    setPage(): void {
        this.featureCategorysService.getCategorys(this.currentPage).subscribe(result => {
            this.totalItems = result.count;
            this.filterCategorys(result.items, this.droppedCategorys);
        })
    }

    filterCategorys(categorys, fCategorys) {
        let exist_ids = fCategorys.map(obj => {
            return obj._id;
        })
        this.categorys = categorys.filter(obj => {
            return exist_ids.indexOf(obj._id) == -1;
        })
    }

    remove(data, index) {
        this.featureCategorysService.remove(data._id).subscribe(result => {
            if (result.status) {
                this.droppedCategorys.splice(index, 1)
            }
        })
    }
}
