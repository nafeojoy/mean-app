import { Component, ViewEncapsulation } from '@angular/core';

import { FeatureAttributeService } from './feature-attributes.service'

import 'style-loader!./feature-attributes.scss';

@Component({
    selector: 'feature-attributes',
    templateUrl: './feature-attributes.list.html',
})
export class FeatureAttributeListComponent {

    public apiBaseUrl: string;
    public attributes: any = [];
    public alerts: any = [];


    public droppedAttributes: any = [];

    public dropingIndex: number;


    constructor(private featureAttributeService: FeatureAttributeService) {
    }

    ngOnInit() {
        this.featureAttributeService.getFeatured().subscribe(result => {
            this.droppedAttributes = result;
            this.featureAttributeService.getAttribute().subscribe(res => {
                this.filterAuthor(res, this.droppedAttributes);
            })
        })
    }

    save() {
        this.featureAttributeService.update(this.droppedAttributes).subscribe((response => {
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
        this.droppedAttributes.push(e.dragData);
        this.removeItem(e.dragData, this.attributes)
    }



    removeItem(item: any, list: Array<any>) {
        let index = list.map((e) => {
            return e._id
        }).indexOf(item._id);
        list.splice(index, 1);
    }


    filterAuthor(attribute, fAttribute) {
        let exist_ids = fAttribute.map(obj => {
            return obj._id;
        })
        this.attributes = attribute.filter(obj => {
            return exist_ids.indexOf(obj._id) == -1;
        })
    }

    remove(data, index) {
        this.featureAttributeService.remove(data._id).subscribe(result => {
            if (result.status) {
                this.droppedAttributes.splice(index, 1)
            }
        })
    }

}