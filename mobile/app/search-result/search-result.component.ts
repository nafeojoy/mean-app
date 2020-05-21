import { Component, ViewEncapsulation, HostListener } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';

import { PubSubService } from '../shared/services/pub-sub-service';
import { SearchDataService } from '../shared/data-services/searched-data.service';
import { SearchResultService } from './search-result.service';

import 'style-loader!./search-result.scss';

@Component({
    selector: 'search-result',
    templateUrl: './search-result.html',
    encapsulation: ViewEncapsulation.None
})
export class SearchResultComponent {
    public products: any = [];
    public ratingData: number = 3.5;
    public displayItems = { products: [], categories: [], authors: [], publishers: [] }
    public busy: Subscription;
    private subSearchStream: any;
    private subAuthStatusStream: any;
    private subLanguageStream: any;
    public itemsPageObject: any = {}
    moreScrol: boolean = true;

    //Query
    public query: any = {};
    public validation: any = {};
    public query_message: string;
    public showForm:boolean;
    


    constructor(private pubSubService: PubSubService, private searchDataService: SearchDataService, public searchResultService: SearchResultService,
        private router: Router, private route: ActivatedRoute) { }

    ngOnInit() {
        this.itemsPageObject = {
            products: { currentPage: 1, hasNext: true },
            categories: { currentPage: 1, hasNext: true },
            authors: { currentPage: 1, hasNext: true },
            publishers: { currentPage: 1, hasNext: true }
        }
        this.products = this.searchDataService.dataSource;
        if (!this.products) {
            this.router.navigateByUrl('/');
        } else {
            this.displayItems = this.splitData(this.products);
        }

        this.subLanguageStream = this.pubSubService.LanguageStream.subscribe((isChange) => {
            this.searchResultService.getNewData(this.searchDataService.termsSource).subscribe(newData => {
                this.moreScrol = true;
                this.itemsPageObject = {
                    products: { currentPage: 1, hasNext: true },
                    categories: { currentPage: 1, hasNext: true },
                    authors: { currentPage: 1, hasNext: true },
                    publishers: { currentPage: 1, hasNext: true }
                }
                if (newData && Array.isArray(newData) && newData.length > 0) {
                    this.displayItems = this.splitData(newData);
                }
            })
        });

        this.subSearchStream = this.pubSubService.SearchStream.subscribe((result) => {
            this.moreScrol = true;
            this.itemsPageObject = {
                products: { currentPage: 1, hasNext: true },
                categories: { currentPage: 1, hasNext: true },
                authors: { currentPage: 1, hasNext: true },
                publishers: { currentPage: 1, hasNext: true }
            }
            if (result.dataList && result.dataList.length > 0) {
                this.displayItems = this.splitData(result.dataList);
            } else {
                this.displayItems = { products: [], categories: [], authors: [], publishers: [] }
            }
        });
    }

    getSelectedProduct(seo_url) {
        this.router.navigate(['book', seo_url]);
    }

    splitData(values) {
        let result = { products: [], categories: [], authors: [], publishers: [] }
        if (values.length < 12) {
            this.moreScrol = false;
        }
        values.forEach(value => {
            if (value.click_url == 'book') {
                result.products.push(value);
            } else if (value.click_url == 'author-books') {
                result.authors.push(value);
            } else if (value.click_url == 'publisher-books') {
                result.publishers.push(value);
            } else {
                result.categories.push(value);
            }
        });
        return result;
    }



    viewMoreResult() {
        let searchItem = this.searchDataService.getSearchOn();
        let term = this.searchDataService.termsSource;
        this.itemsPageObject[searchItem].currentPage++;
        this.busy = this.searchResultService.getData(term, searchItem, this.itemsPageObject[searchItem].currentPage).subscribe(result => {
            if (Array.isArray(result) && result.length > 0) {
                this.itemsPageObject[searchItem].hasNext = true;
                this.displayItems[searchItem] = this.displayItems[searchItem].concat(result);
            }
            if (Array.isArray(result) && result.length < 12) {
                this.moreScrol = false;
            }
        })
    }

    //Query
    validate(field) {
        if (field != 'phone_number') {
            this.validation[field] = { required_error: false, length_error: false }
            if (!this.query[field] && this.query[field] != "") {
                this.validation[field].required_error = true;
            } else {
                if (this.query[field].length < 4) {
                    this.validation[field].required_error = false;
                    this.validation[field].length_error = true;
                } else {
                    this.validation[field].required_error = false;
                    this.validation[field].length_error = false;
                }
            }
        } else {
            this.validation[field] = { required_error: false, invalid: false }
            if (!this.query[field] && this.query[field] != "") {
                this.validation[field].required_error = true;
            } else {
                var result = '' + this.query[field];

                if (result.length != 10) {
                    this.validation[field].required_error = false;
                    this.validation[field].invalid = true;
                    this.query.phone_number = parseInt(this.query[field]);

                } else {
                    this.validation[field].required_error = false;
                    this.validation[field].invalid = false;
                }
            }
        }
    }

    showQueryForm() {
        this.showForm = this.showForm ? false : true;
    }

    submitQuery(qData) {
        qData.from = "site";
        this.searchResultService.saveQuery(qData).subscribe(result => {
            if (result.success) {
                this.query_message = "Sumbitted successfully. Thanks for you query.";
                setTimeout(() => {
                    this.query_message = "";
                    this.router.navigateByUrl('/');
                }, 2000);
            } else {
                this.query_message = "Submitting Failed, Please Try again latter";
                setTimeout(() => {
                    this.query_message = "";
                }, 2000);
            }
        })
    }


}