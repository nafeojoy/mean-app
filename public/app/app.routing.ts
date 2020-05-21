import { Routes, RouterModule } from '@angular/router';

import { ModuleWithProviders } from '@angular/core';

import { App } from './app.component'
import { HomeComponent } from './home/home.component';


import { AboutUsComponent } from './info-pages/components/about-us';
import { ContactUsComponent } from './info-pages/components/contact-us';


import { FaqComponent } from './support/components/faq';
import { HelpAndSupportComponent } from './support/components/help-and-support';
import { HelpDeskComponent } from './support/components/help-desk';

import { BuyPolicyComponent } from "./policy/components/buy-policy";
import { PrivacyPolicyComponent } from "./policy/components/privacy-policy";
import { TermsOfUseComponent } from "./policy/components/terms-of-use";

import { PublisherPageComponent } from './publisher-page/publisher-page.component';
//import{ SslCommerzComponent  } from './sslcommerz/sslcommerz.component'

export const routes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'book', loadChildren: 'app/product-details/product.details.module#ProductDetailsModule' },
    { path: 'categories', loadChildren: 'app/categories/category.module#CategoryModule' },
    { path: 'authors', loadChildren: 'app/authors/author.module#AuthorModule' },
    { path: 'publishers', loadChildren: 'app/publishers/publisher.module#PublisherModule' },
    { path: 'search', loadChildren: 'app/search-result/search-result.module#SearchResultModule' },
    { path: 'info', loadChildren: 'app/info-pages/info-pages.module#InfoPagesModule' },
    { path: 'support', loadChildren: 'app/support/support.module#SupportModule' },
    { path: 'policy', loadChildren: 'app/policy/policy.module#PolicyModule' },
    { path: 'billing', loadChildren: 'app/billing/billing.module#BillingModule' },
    { path: 'contents', loadChildren: 'app/contents/contents.module#ContentsModule' },
    { path: 'page/:page_url', loadChildren: 'app/dynamic-pages/dynamic-pages.module#DynamicPagesModule' },
    { path: 'subscriber', loadChildren: 'app/subscriber/subscriber.module#SubscriberModule' },
    { path: 'special-offer', loadChildren: 'app/special-offer/special-offer.module#SpecialOfferModule' },
    { path: 'user-manual', loadChildren: 'app/user-manual/user.manual.module#UserManualModule' },
    { path: ':page-text', component: PublisherPageComponent },
    { path: ':type/:seo_url', loadChildren: 'app/products/products.module#ProductsModule' },

];

export const routing: ModuleWithProviders = RouterModule.forRoot(routes, { useHash: true });
