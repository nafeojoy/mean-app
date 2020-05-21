import { Component, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NewsService } from './news.service';

@Component({
    selector: 'news-detail',
    providers: [NewsService],
    templateUrl: './news.detail.html',
    encapsulation: ViewEncapsulation.None
})

export class NewsDetailComponent {

    public news: any = {};
    constructor(private newsService: NewsService, private route: ActivatedRoute) { }

    ngOnInit() {
        let id = this.route.snapshot.params['id'];
        this.newsService.getDetail(id).subscribe(result => {
            this.news = result;
        })
    }

}