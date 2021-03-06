import { NgModule, ApplicationRef } from '@angular/core';
import { ReCaptchaModule } from 'angular2-recaptcha';

import { SharedModule } from '../shared/shared.module';
import { FooterComponent } from "./components/layout-footer";
import { HeaderComponent, HeaderService } from "./components/layout-header";
import { SearchComponent, SearchService } from './components/search';
import { LoginComponent } from './components/login';
import { FacebookLoginComponent } from './components/facebook-login';
import { GoogleLoginComponent } from './components/google-login';
import { SignupComponent, MessageService } from './components/signup';
import { CartCountComponent } from "./components/cart-count";
import { UserComponent } from './components/user';
import { LanguageComponent } from './components/language-selection';
import { CartService } from '../billing/components/cart/cart.service';
import { MenuSelectorComponent } from "./components/layout-header/menu-selector.component";
import { SpinnerModule } from 'angular2-spinner/dist';

@NgModule({
    declarations: [
        FooterComponent,
        HeaderComponent,
        SearchComponent,
        LoginComponent,
        FacebookLoginComponent,
        GoogleLoginComponent,
        SignupComponent,
        CartCountComponent,
        UserComponent,
        LanguageComponent,
        MenuSelectorComponent
    ],
    imports: [
        SharedModule,
        ReCaptchaModule,
        SpinnerModule
    ],
    providers: [
        SearchService, CartService, MessageService, HeaderService
    ],

    exports: [
        FooterComponent,
        HeaderComponent,
        SearchComponent
    ]
})

export class LayoutModule { }