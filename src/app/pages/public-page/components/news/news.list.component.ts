import { Component, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { NewsService } from './news.service';

import 'style-loader!./news.scss';

@Component({
    selector: 'news-list',
    templateUrl: './news.list.html',
})
export class NewsListComponent {
    public apiBaseUrl: any;
    public news: any;
    public selectedNews: any = {};
    public deletingId: string;
    public deletingIndex: any;
    public imazeSize: any;
    public image: string;

    constructor(private newsService: NewsService) { }
    ngOnInit() {
        this.apiBaseUrl = this.newsService.apiBaseUrl;
        this.newsService.getAll().subscribe(result => {
            this.news = result;
        })

        for (var key in localStorage) {
            if (key.length == 24) {
                localStorage.removeItem(key);
            }
        }
    }

    set(data) {
        window.localStorage.setItem(data._id, JSON.stringify(data));
    }

    view(selected) {
        this.image = selected.image['150X150'];
        this.selectedNews = selected;
    }

    deleteNews(deleteId, index) {
        this.deletingId = deleteId;
        this.deletingIndex = index;
    }

    delete() {
        this.newsService.delete(this.deletingId).subscribe(response => {
            alert("News deleted");
            this.newsService.getAll().subscribe(result => {
                this.news = result;
            })
        })
    }
}