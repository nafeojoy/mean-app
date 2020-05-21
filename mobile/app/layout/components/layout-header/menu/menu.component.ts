import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { AuthService } from '../../../../shared/services/auth.service';
import { Router, NavigationEnd } from "@angular/router";
import { PubSubService } from '../../../../shared/services/pub-sub-service';


@Component({
    selector: 'header-menu',
    templateUrl: './menu.component.html',
    styleUrls: ['./menu.component.scss']
})
export class MenuComponent implements OnInit {

    public expand1: boolean = false;
    myroute: string;

    category: boolean = false;
    author: boolean = false;

    loginCheck: boolean = false;
    userName: string;
    userEmail: string;
    userPhone: string;

    @Input()
    checkMenuLogin: any;

    @Output()
    isMenuSelected = new EventEmitter();

    constructor(private authService: AuthService, private router: Router, private pubSubService: PubSubService) {
        this.menuVisited();
    }

    ngOnInit() {
        if (this.authService.isLoggedIn() === true) {
            this.loginCheck = true;
            this.userName = this.authService.getUserFirstname();
            this.userEmail = this.checkMenuLogin.email;
            this.userPhone = this.checkMenuLogin.phone_number;
            // console.log(this.userName+ " "+ this.userEmail);
        } else {
            this.loginCheck = false;
        }
    }

    menuSelected() {
        this.isMenuSelected.emit(true)
    }

    emitChange(type, seo_url) {
        this.pubSubService.SearchStream.emit({ search_type: type, search: seo_url });
        this.menuSelected();
      }


    // checkLogin() {
    //     if (this.authService.isLoggedIn() === true) {
    //         this.router.navigateByUrl('/contents/purchase-list');
    //     } else {
    //         this.pubSubService.AuthStatusStream.emit({ showSignInModal: true, goToPurchaseIfLogIn: true })
    //     }
    // }
    change() {
        if (this.expand1 == true) {
            this.expand1 = false;
        } else {
            this.expand1 = true;
        }
    }

    menuVisited() {
        this.category = false;
        this.author = false;
        this.router.events
            .filter((event) => event instanceof NavigationEnd)
            .map(() => this.router.routerState)
            .subscribe((event) => {

                this.myroute = event.snapshot.url;

                if (this.myroute == '/categories') {
                    this.category = true;
                }
                if (this.myroute == '/authors') {
                    this.author = true;
                }
                if (this.myroute == '/publishers') {

                }
                if (this.myroute == '/category-books/book') {

                }
                if (this.myroute == '/contents/purchase-list') {

                }
                if (this.myroute == '/contents/testimonial-list') {

                }
                if (this.myroute == '/support/help-and-support') {

                }
                if (this.myroute == '/info/about-us') {

                }
                if (this.myroute == '/info/contact-us') {

                }

                if (this.myroute == '/') {

                }
                else if (this.myroute == '/?login=true') {


                }
                else {

                }

            });
    }


    // onLoginStatusChange(checkLoginStatus: boolean) {
    //     this.loginCheck = checkLoginStatus;
    //     this.userName = this.checkMenuLogin.first_name;
    //     this.userEmail = this.checkMenuLogin.email;
    //     this.userPhone = this.checkMenuLogin.phone_number;
    // }

}