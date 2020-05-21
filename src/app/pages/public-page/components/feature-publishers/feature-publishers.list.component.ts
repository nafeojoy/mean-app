import { Component, ViewEncapsulation } from '@angular/core';

import { FeaturePublisherService } from './feature-publishers.service'

import 'style-loader!./feature-publishers.scss';

@Component({
    selector: 'feature-publishers',
    templateUrl: './feature-publishers.list.html',
})
export class FeaturePublisherListComponent {

    public apiBaseUrl: string;
    public publishers: any = [];
    public alerts: any = [];
    public totalItems: number;
    public currentPage: number = 1;
    public maxSize: number = 5;

    public droppedPublishers: any = [];

    public dropingIndex: number;


    constructor(private featurePublisherService: FeaturePublisherService) {
    }

    ngOnInit() {
        this.featurePublisherService.getFeatured().subscribe(result => {
            this.droppedPublishers = result;
            this.featurePublisherService.getPublisher(this.currentPage).subscribe(res => {
                this.filterAuthor(res.items, this.droppedPublishers);
                this.totalItems = res.count;
            })
        })
    }

    save() {
        this.featurePublisherService.update(this.droppedPublishers).subscribe((response => {
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
        this.droppedPublishers.push({_id: e.dragData._id, name: e.dragData.name});
        this.removeItem(e.dragData, this.publishers)
    }



    removeItem(item: any, list: Array<any>) {
        let index = list.map((e) => {
            return e._id
        }).indexOf(item._id);
        list.splice(index, 1);
    }

    setPage(): void {
        this.featurePublisherService.getPublisher(this.currentPage).subscribe(result => {
            this.totalItems = result.count;
            this.filterAuthor(result.items, this.droppedPublishers);
        })
    }


    filterAuthor(publisher, fPublisher) {
        let exist_ids = fPublisher.map(obj => {
            return obj._id;
        })
        this.publishers = publisher.filter(obj => {
            return exist_ids.indexOf(obj._id) == -1;
        })
    }

    remove(data, index) {
        this.featurePublisherService.remove(data._id).subscribe(result => {
            if (result.status) {
                this.droppedPublishers.splice(index, 1)
            }
        })
    }

}