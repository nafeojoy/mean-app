import { Component, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NewsService } from './news.service';

import { SeoContentLoaderService } from '../../../shared/services';


@Component({
    selector: 'news-detail',
    providers: [NewsService],
    templateUrl: './news.detail.html',
    encapsulation: ViewEncapsulation.None
})

export class NewsDetailComponent {

    public news: any = {};
    constructor(private newsService: NewsService, private route: ActivatedRoute, private seoContentLoaderService: SeoContentLoaderService) { }

    ngOnInit() {
        let id = this.route.snapshot.params['id'];
        this.newsService.getDetail(id).subscribe(result => {
            this.news = result;
            this.seoContentLoaderService.setContent(this.news.meta_tag_title, this.news.meta_tag_description, this.news.meta_tag_keywords);
        })
    }

}