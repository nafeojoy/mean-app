import { Component, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ArticlesService } from './articles.service';

@Component({
    selector: 'articles-detail',
    providers: [ArticlesService],
    templateUrl: './articles.detail.html',
    encapsulation: ViewEncapsulation.None
})

export class ArticlesDetailComponent {

    public articles: any = {};
    constructor(private articlesService: ArticlesService, private route: ActivatedRoute) { }

    ngOnInit() {
        let id = this.route.snapshot.params['id'];
        this.articlesService.getDetail(id).subscribe(result => {
            this.articles = result;
        })
    }

}