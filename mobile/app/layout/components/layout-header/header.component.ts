import { Component, ViewEncapsulation, OnInit, Input } from '@angular/core';
import animateScrollTo from 'animated-scroll-to';

import { trigger, state, style, transition, animate } from '@angular/animations';
import { BaseService } from '../../../shared/services/base-service';
import { Observable } from 'rxjs/Observable';
import { HomeService } from "../../../home/home.service";
import { ProductService } from '../../../shared/services/product.service';
import { SharedModule } from '../../../shared/shared.module';
import { CookieService } from 'angular2-cookie/core';
import { AuthService } from '../../../shared/services/auth.service';
import { Router } from "@angular/router";
import { PubSubService } from '../../../shared/services/pub-sub-service';

import 'style-loader!./header.scss';

@Component({
  selector: 'app-header',
  templateUrl: './header.html',
  encapsulation: ViewEncapsulation.None,
  animations: [
    trigger('slideInOut', [
      state('out', style({
        transform: 'translate3d(0, 0, 0)'
      })),
      state('in', style({
        transform: 'translate3d(100%, 0, 0)'
      })),
      transition('in => out', animate('400ms ease-in-out')),
      transition('out => in', animate('400ms ease-in-out'))
    ]),
  ]
})

export class HeaderComponent {

  staticImageBaseUrl: string = this.baseService.staticImageBaseUrl;
  @Input() public items: Observable<any[]>;
  @Input() public nextRoute: string;
  @Input() public loadUrl: string;
  menuState: string = 'out';

  authors;
  publishers;
  categories;
  logo_url
  item: string;
  isMenuLoggedIn: any;
  supportedLanguages: any[];
  currentLanguage: string;
  subLanguageStream: any;
  private _opened: boolean = false;
  showTop: boolean = false;


  constructor(private baseService: BaseService, private authService: AuthService, private _productService: ProductService, private homeService: HomeService, private pubSubService: PubSubService, private router: Router, private _cookieService: CookieService) { }

  ngOnInit() {
    this.changeLogo();
    this.subLanguageStream = this.pubSubService.LanguageStream.subscribe(result => {
      this.changeLogo();
    })

    this.homeService.getPageContent().subscribe((result) => {
      this.authors = result.authors;
      this.publishers = result.publishers;
      this.categories = result.featureCategories;
    });
  }


  private onItemSelect(item: any) {
    if (item.title == "Purchase") {
      this.checkLogin();
    }
    else
      this.router.navigateByUrl(item.link);
  }

  public _open: boolean = false;



  private _toggleSidebar() {
    this._opened = !this._opened;
  }


  toggleMenu() {
    this.menuState = this.menuState === 'out' ? 'in' : 'out';
  }
  outMenu() {
    this.menuState = 'out';
  }

  checkLogin() {
    if (this.authService.isLoggedIn() === true) {
      this.router.navigateByUrl('/contents/purchase-list');
    } else {
      this.pubSubService.AuthStatusStream.emit({ showSignInModal: true, goToPurchaseIfLogIn: true })
    }
  }

  changeLogo() {
    this.currentLanguage = this._cookieService.get('lang');
    this.logo_url = this.currentLanguage == 'en' ? this.baseService.staticImageBaseUrl + 'logo_en_m.png' : this.baseService.staticImageBaseUrl + 'logo_bn_m.png';
  }

  getMenuLoginStatus(): any {
    this.isMenuLoggedIn = this.authService.getUser();
    //console.log(this.isMenuLoggedIn);
    return this.isMenuLoggedIn;
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
    animateScrollTo(0);
  }
}


