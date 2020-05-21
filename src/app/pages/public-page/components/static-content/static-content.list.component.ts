import { Component, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { StaticContentService } from './static-content.service'
import { AppState } from '../../../../app.service';

import 'style-loader!./static-content.scss';

@Component({
    selector: 'static-content-list',
    templateUrl: './static-content.list.html',
})
export class StaticContentListComponent {

    public content_id: any;
    public contents: any = [];
    public preview_content: any;

    constructor(private staticContentService: StaticContentService) { }

    ngOnInit() {
        this.staticContentService.getAll().subscribe((result => {
            console.log(result);
            this.contents = result;
        }))
    }


    deleteContent(content) {
        this.content_id = content._id;
    }

    // delete(){
    //     this.staticContentService.delete(this.content_id).subscribe(result=>{
    //         console.log(result);
    //     })
    // }

    viewContent(object) {
        this.preview_content = object.content;
    }
}