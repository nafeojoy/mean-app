import { Component, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { NewsService } from './news.service';
import { PubSubService } from '../../../shared/services/pub-sub-service';
import { SeoContentLoaderService } from '../../../shared/services';
import { Subscription } from 'rxjs';



@Component({
  selector: 'news-list',
  providers: [NewsService],
  templateUrl: './news.list.html',
  encapsulation: ViewEncapsulation.None
})

export class NewsListComponent {
  public busy: Subscription;

  public content_object: any = {};

  public news: any = [];
  public totalItems: number;
  public currentPage: number = 1;
  public maxSize: number = 5;
  private subLanguageStream: any;


  constructor(private newsService: NewsService, private router: Router, private pubSubService: PubSubService, private seoContentLoaderService: SeoContentLoaderService) { }

  ngOnInit() {
    window.scrollTo(0, 0);

    //let pageNum = 1
    this.getNews();
    this.subLanguageStream = this.pubSubService.LanguageStream.subscribe((result) => {
      this.getNews();
    });
  }

  ngOnDestroy() {
    this.subLanguageStream.unsubscribe();
  }

  getNews() {
    this.newsService.get(this.currentPage).subscribe(result => {
      this.news = result.data;
      this.totalItems = result.count;
      this.seoContentLoaderService.setContent("News", "News BoiBazar", "News BoiBazar");
    })
  }

  setPage(): void {
    this.newsService.get(this.currentPage).subscribe(result => {
      this.news = result.data;
      this.totalItems = result.count;
    })
  }
}