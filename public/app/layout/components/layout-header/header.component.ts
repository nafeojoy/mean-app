import { Component, ViewEncapsulation, OnInit, Input } from '@angular/core';
import animateScrollTo from 'animated-scroll-to';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Router } from "@angular/router";
import { BaseService } from '../../../shared/services/base-service';
import { CookieService } from 'angular2-cookie/core';
import { PubSubService } from '../../../shared/services/pub-sub-service';
import { AuthService } from '../../../shared/services/auth.service';
import { HeaderService } from './header.service';
import 'style-loader!./header.scss';
import { lang } from 'moment';

@Component({
  selector: 'app-header',
  templateUrl: './header.html',
  encapsulation: ViewEncapsulation.None
})

export class HeaderComponent {

  content: Observable<any> = new Observable<any>();
  profile_check: boolean;
  showTop: boolean = false;
  categories: Observable<any> = new Observable<any>();
  authors: Observable<any> = new Observable<any>();
  publishers: Observable<any> = new Observable<any>();

  currentLanguage: string;
  item: string;
  show: boolean = false;
  subLanguageStream: any;
  connect: string;
  staticImageBaseUrl: string = this.baseService.staticImageBaseUrl;

  public logo_url: any;
  mobHeight: any;
  mobWidth: any;

  constructor(private baseService: BaseService, private _cookieService: CookieService, private pubsubService: PubSubService, private headerService: HeaderService, private authService: AuthService, private router: Router) {
    this.mobHeight = (window.screen.height);
    this.mobWidth = (window.screen.width);


  }

  ngOnInit() {
    this.getHeaderContent();
    this.subLanguageStream = this.pubsubService.LanguageStream.subscribe((result) => {
      this.getHeaderContent();
    });
    this.pubsubService.AuthStatusStream.subscribe((res) => {
      this.getHeaderContent();
    })
  }

  ngOnDestroy() {
    this.subLanguageStream.unsubscribe();
  }

  over(type) {

    this.show = true;
    this.item = type;
  }

  leave(type) {
    this.show = false;
  }

  itemSelected() {
    this.show = false;
  }

  checkLogin() {
    if (this.authService.isLoggedIn() === true) {
      this.router.navigateByUrl('/contents/purchase-list');
    } else {
      this.pubsubService.AuthStatusStream.emit({ showSignInModal: true, goToPurchaseIfLogIn: true })
    }
  }


  getHeaderContent() {

    this.currentLanguage = this._cookieService.get('lang');
    this.connect = this._cookieService.get('token');
    this.logo_url = this.currentLanguage == 'en' ? this.baseService.staticImageBaseUrl + 'logo_en.png' : this.baseService.staticImageBaseUrl + 'logo_bn.png';
    this.content = this.headerService.getMenuContent();
    this.categories = this.content.pluck<any[], any>('featureCategories');
    this.authors = this.content.pluck<any[], any>('authors');
    this.publishers = this.content.pluck<any[], any>('publishers');

    this.profile_check = this.authService.isLoggedIn();


  }

  emitChange(type, seo_url) {
    this.pubsubService.SearchStream.emit({ search_type: type, search: seo_url });
  }

  onWindowScroll(event) {
    if (window.scrollY > 999) {
      this.showTop = true;
    }
    else {
      this.showTop = false;
    }
  }

  go_top() {
    // window.scrollTo(0, 0);
    animateScrollTo(0);

  }

}


