import { Component, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { ArticlesService } from './articles.service';
import { PubSubService } from '../../../shared/services/pub-sub-service';
import { SeoContentLoaderService } from '../../../shared/services';


@Component({
  selector: 'articles-list',
  providers: [ArticlesService],
  templateUrl: './articles.list.html',
  encapsulation: ViewEncapsulation.None
})

export class ArticlesListComponent {

  public articles: any = [];
  public totalItems: number;
  public currentPage: number = 1;
  public maxSize: number = 5;
  private subLanguageStream: any;


  constructor(private articlesService: ArticlesService, private router: Router, private pubSubService: PubSubService,
    private seoContentLoaderService: SeoContentLoaderService) { }

  ngOnInit() {
    window.scrollTo(0, 0);

    //let pageNum = 1
    this.getArticles();

    this.subLanguageStream = this.pubSubService.LanguageStream.subscribe((result) => {
      this.getArticles();
    });
  }
  
  ngOnDestroy() {
    this.subLanguageStream.unsubscribe();
  }

  getArticles() {
    this.articlesService.get(this.currentPage).subscribe(result => {
      this.articles = result.data;
      this.totalItems = result.count;
      this.seoContentLoaderService.setContent("Articles", "Articles BoiBazar", "Articles BoiBazar");
    })
  }

  setPage(): void {
    this.articlesService.get(this.currentPage).subscribe(result => {
      this.articles = result.data;
      this.totalItems = result.count;
    })
  }
}