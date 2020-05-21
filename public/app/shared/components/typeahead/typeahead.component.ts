import { Component, Input, Output, EventEmitter, ElementRef } from '@angular/core';
import { Router, NavigationEnd } from "@angular/router";
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { PubSubService } from '../../services/pub-sub-service';
import { SearchDataService } from '../../data-services/searched-data.service';
import 'style-loader!./typeahead.scss';
import { setInterval } from 'timers';
import { Subscription } from 'rxjs';

@Component({
    selector: 'typeahead',
    templateUrl: './typeahead.html',
    host: {
        '(document:click)': 'handleClick($event)',
    }
})

export class TypeaheadComponent {

    @Input()
    items: any = [];

    @Input() public image: boolean;

    private _items = new BehaviorSubject<any[]>([]);


    @Output()
    dataLoader: EventEmitter<any> = new EventEmitter();

    @Output()
    selectedLoader: EventEmitter<any> = new EventEmitter();

    @Output()
    loadOnEnter: EventEmitter<any> = new EventEmitter();

    public searchText: string;
    public elementRef;
    private subSearchStream: any;
    public searchLn: string = 'Search By Any (ie: Book, Publisher, Author, Category, Date...)';
    ulClass: string = 'typeahead-ul-h';
    myroute: string;
    hide: boolean = false;

    busy: Subscription;
    checkLoad: boolean = false;

    constructor(private router: Router, private pubSubService: PubSubService, private searchDataService: SearchDataService, myElement: ElementRef) {
        this.elementRef = myElement;


        let a = 1;
        setInterval(() => {
            if (a % 2) {
                this.searchLn = 'যে কোনো কিছু লিখুন (অর্থাৎ: বই, প্রকাশক, লেখক, ক্যাটাগরি, তারিখ,...)';
                a++;
            }
            else {
                this.searchLn = 'Search By Any (ie: Book, Publisher, Author, Category, Date...)';
                a++;
            }
        }, 10000);

        router.events
            .filter((event) => event instanceof NavigationEnd)
            .map(() => this.router.routerState)
            .subscribe((event) => {
                this.myroute = event.snapshot.url;

                if (this.myroute == '/') {
                    this.ulClass = 'typeahead-ul-h';
                }
                else if (this.myroute == '/?login=true') {
                    this.ulClass = 'typeahead-ul-h';
                }
                else {
                    this.ulClass = 'typeahead-ul';
                }
            });
    }

    ngOnInit() {
        this.subSearchStream = this.pubSubService.SearchStream.subscribe((result) => {
            if (result.searchTextEmpty === true) {
                this.searchText = null;
            }
        });
    }

    ngOnDestroy() {
        this.subSearchStream.unsubscribe();
    }

    typed(text) {
        // console.log(text)
        $("#searchBox").css({
            "box-shadow": "#1361b1 0px -2px 25px -1px",
            'background-image': 'url(assets/images/loading1.gif)',
            'background-repeat': 'no-repeat',
            'background-position': 'right',
            'background-size': '70px'
        });
        this.hide = false;
        // text = text.replace(/[&\/\\#,+()$~%.'":*?<>{}]/g, '').trim();
        if (text.length == 0) {
            this.dataLoader.emit('');
            this.items = [];

        } else {
            this.dataLoader.emit(text);

        }
    }

    getDetail(item) {
        this.searchText = item.name;
        this.selectedLoader.emit(item);
        this.items = [];
    }


    searchedProducts(text) {
        // console.log("typehead - searchedProducts")

        $("#searchBox").css({
            "box-shadow": "unset",
            'background-image': 'unset',
            'background-repeat': 'unset',
            'background-position': 'unset',
            'background-size': 'unset'
        });
        this.hide = true;
        // this.searchDataService.setData(this.items);
        this.router.navigateByUrl('/search');
        // this.pubSubService.SearchStream.emit({ dataList: this.items });
    }

    handleClick(event) {
        var clickedComponent = event.target;
        var inside = false;
        do {
            if (clickedComponent === this.elementRef.nativeElement) {
                inside = true;
            }
            clickedComponent = clickedComponent.parentNode;
        } while (clickedComponent);

        if (inside) {
        } else {
            this.items = [];
        }
    }
}
