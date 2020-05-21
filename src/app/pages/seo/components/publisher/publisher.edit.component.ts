import { Component, ViewEncapsulation, ViewChild } from "@angular/core";
import { ActivatedRoute } from '@angular/router';
import { FormGroup } from '@angular/forms';
import { Location } from '@angular/common';

import { PublisherService } from "./publisher.service";
import { PublisherModelService } from "./publisher.model.service";
import { Subject } from 'rxjs/Subject';


import 'style-loader!./publishers.scss';

@Component({
    selector: 'publishers-edit',
    templateUrl: './publisher.edit.html',
})

export class PublisherEditComponent {

    public form: FormGroup;
    private publisher_id: string;
    public res_pending: boolean;

    publisher_name: any = {};
    publisher_description: any = {};
    publisher_meta_tag_title: any = {};
    publisher_meta_tag_description: any = {};
    publisher_meta_tag_keywords: any = {};
    publisher_seo_url: any = {};
    publisher: any = {};


    constructor(
        private publisherService: PublisherService,
        private modelService: PublisherModelService,
        private route: ActivatedRoute,
        private location: Location
    ) { }

    ngOnInit() {

        this.form = this.modelService.getFormModel();
        let defaultLanguageCode = this.modelService.defaultLanguageCode;
        this.publisher_id = this.route.snapshot.params['id'];
        let result: any = JSON.parse(window.localStorage.getItem(this.publisher_id));
        this.publisher = result;

        console.log(this.publisher);

        this.publisher_name[defaultLanguageCode] = result.name;
        this.publisher_description[defaultLanguageCode] = result.description;
        this.publisher_meta_tag_title[defaultLanguageCode] = result.meta_tag_title;
        this.publisher_meta_tag_description[defaultLanguageCode] = result.meta_tag_description;
        this.publisher_meta_tag_keywords[defaultLanguageCode] = result.meta_tag_keywords;
        this.publisher_seo_url[defaultLanguageCode] = result.seo_url;

        let languages = result.lang;

        for (var i in languages) {
            this.publisher_name[languages[i].code] = languages[i].content.name;
            this.publisher_description[languages[i].code] = languages[i].content.description;
            this.publisher_meta_tag_title[languages[i].code] = languages[i].content.meta_tag_title;
            this.publisher_meta_tag_description[languages[i].code] = languages[i].content.meta_tag_description;
            this.publisher_meta_tag_keywords[languages[i].code] = languages[i].content.meta_tag_keywords;
            this.publisher_seo_url[languages[i].code] = languages[i].content.seo_url;
        }


    }


    update() {
        this.res_pending = true;

        let publisher = this.modelService.getFormValue(this.form);
        publisher._id = this.publisher_id;

        this.publisherService.update(publisher).subscribe(result => {
            this.res_pending = false;
            if (result._id) {
                alert("Publisher Update Success!");
                this.location.back();
            } else if (result.duplicate) {
                alert(result.message);
            } else {
                alert("Publisher Update Failed!");
            }
        })

    }

}