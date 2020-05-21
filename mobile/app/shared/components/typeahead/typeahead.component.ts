import { Component, Input, Output, EventEmitter, ElementRef } from '@angular/core';
import { Router } from "@angular/router";

import { PubSubService } from '../../services/pub-sub-service';
import { SearchDataService } from '../../data-services/searched-data.service';
import 'style-loader!./typeahead.scss';

@Component({
    selector: 'typeahead',
    templateUrl: './typeahead.html',
    host: {
        '(document:click)': 'handleClick($event)',
    },
})

export class TypeaheadComponent {

    @Input() public items: Array<any> = [];
    @Input() public image: boolean;

    @Output()
    dataLoader: EventEmitter<any> = new EventEmitter();

    @Output()
    selectedLoader: EventEmitter<any> = new EventEmitter();
    public searchText: string;
    public elementRef;
    private subSearchStream: any;
    public searchLn: string ='Search(Book, Publisher, Author)';
    hide: boolean = false;

    // public searchLn: string ='Search By Any (ie: Book, Publisher, Author, Category, Date...)';
    


    constructor(private router: Router, private pubSubService: PubSubService, private searchDataService: SearchDataService, myElement: ElementRef) {
        this.elementRef = myElement;

        let a=1;
        setInterval(() => {
            if(a%2)
            {
                this.searchLn = 'খুঁজুন (বই, প্রকাশক, লেখক)';
                // this.searchLn = 'যে কোনো কিছু লিখুন (অর্থাৎ: বই, প্রকাশক, লেখক, ক্যাটাগরি, তারিখ,...)';
                
                //console.log(this.searchLn);
                a++;
            }
            else
            {
                this.searchLn = 'Search(Book,Publisher,Author)';
                // this.searchLn = 'Search By Any (ie: Book, Publisher, Author, Category, Date...)';
                
               // console.log(this.searchLn);
                a++;
            }
         }, 10000);
        
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
        // text = text.replace(/[&\/\\#,+()$~%.'":*?<>{}]/g, '');
        this.hide = false;
        if (text.length == 0) {
            this.items = [];
        } else {
            // text=text.toLowerCase();
            this.dataLoader.emit(text);
        }
    }

    getDetail(item) {
        this.searchText = item.name;
        this.selectedLoader.emit(item);
        this.items = [];
    }


    searchedProducts() {
        this.hide = true;
        this.searchDataService.setData(this.items);
        this.router.navigateByUrl('/search');
        this.pubSubService.SearchStream.emit({ dataList: this.items });
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
            // console.log('inside');
        } else {
            //console.log('outside');
            //this.searchText = null;
            this.items = [];
        }
    }
}
