import { Component, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ArticleService } from './article.service'
import { AppState } from '../../../../app.service';

import 'style-loader!./article.scss';

@Component({
    selector: 'article-list',
    templateUrl: './article.list.html',
})
export class ArticleListComponent {

    public content_id: any;
    public contents: any = [];
    public preview_content: any;

    constructor(private ArticleService: ArticleService) { }

    ngOnInit() {
        this.ArticleService.getAll().subscribe((result => {
            this.contents = result;
        }))

        for (var key in localStorage) {
            if (key.length == 24) {
                localStorage.removeItem(key);
            }
        } 
    }


    deleteContent(content) {
        this.content_id = content._id;
    }

    set(data) {
        window.localStorage.setItem(data._id, JSON.stringify(data));
    }

    viewContent(object) {
        this.preview_content = object.content;
    }
}