import { Injector, Injectable } from "@angular/core";
import { Location } from "@angular/common";
import { Http, Headers, Response, URLSearchParams } from "@angular/http";
// import { PubSubService } from './pub-sub-service';
// import { NotificationsService } from 'angular2-notifications';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/pluck';

import { BaseService } from './base-service';
import { PaginatedResult } from '../interfaces/paginated-result.interface';

@Injectable()
export class PaginationStoreService extends BaseService {
    protected entityName = 'Item';

    private _results: BehaviorSubject<PaginatedResult<any>>;
    protected _items: Observable<any[]>;
    protected _count: Observable<number>;
    public is_success: boolean;
    protected _resultStore: {
        results: {
            items: Observable<any[]>,
            count: number
        }
    };

    private notificationOptions = { timeOut: 2000, showProgressBar: false, pauseOnHover: false, clickToClose: true, maxLength: 50 }

    constructor(injector: Injector) {
        super(injector);
    }

    init() {
        super.init();
        this._resultStore = { results: { items: null, count: 0 } };
        this._results = <BehaviorSubject<PaginatedResult<any>>>new BehaviorSubject({});
        this._items = this._results.pluck('items');
        this._count = this._results.pluck('count');
    }

     get items() {
        return this._items;
    }

    get count() {
        return this._count;
    }

     add(item: any) {
        return this.http.post(this.apiUrl, JSON.stringify(item), { headers: this.headers })
            .map(res => res.json())
    }

     update(item: any) {
        return this.http.put(this.apiUrl + item._id, JSON.stringify(item), { headers: this.headers })
            .map(res => res.json());
    }

     delete(id: string) {
        return this.http.delete(this.apiUrl + id)
            .map(res => res.json()).subscribe(item => {
                // this._resultStore.results.forEach((t, i) => {
                //     if (t._id === id) {
                //         this._resultStore.results.splice(i, 1);
                //     }
                // });
                this._results.next(Object.assign({}, this._resultStore).results);
                // this.notificationsService.success('Delete ' + this.entityName, this.entityName + ' deleted successfully');
            }, error => {
                console.log('error', error);
                // this.notificationsService.error(error.name, error.message);
            });
    }

     getAll() {
        return this.http.get(this.apiUrl).map((res: Response) => res.json()).subscribe(results => {
            this._resultStore.results = results;
            this._results.next(Object.assign({}, this._resultStore).results);
        }, error => {
            console.log('error', error)
        });
    }

     getById(id: string) {
        return this.http.get(this.apiUrl + id).map((res: Response) => {
            return res.json();
        })
    }

     getPaged(page: number = 1, itemsPerPage: number = 10) {
        let paginationHeaders = new Headers();
        paginationHeaders.append('Content-Type', 'application/json');
        paginationHeaders.append('bz-pagination', page + ',' + itemsPerPage);

        return this.http.get(this.apiUrl, { headers: paginationHeaders })
            .map((res: Response) => {
                return res.json()
            }).subscribe(results => {
                this._resultStore.results = results;
                this._results.next(Object.assign({}, this._resultStore).results);
            });
    }




     getDatePaged(page: number = 1, itemsPerPage: number = 10, from_date: Date) {
        let paginationHeaders = new Headers();
        paginationHeaders.append('Content-Type', 'application/json');
        paginationHeaders.append('bz-pagination', page + ',' + itemsPerPage + ',' + from_date);

        return this.http.get(this.apiUrl, { headers: paginationHeaders })
            .map((res: Response) => {
                return res.json()
            }).subscribe(results => {
                this._resultStore.results = results;
                this._results.next(Object.assign({}, this._resultStore).results);
            });
    }

     search(searchTerms: any = null, page: number = 1, itemsPerPage: number = 10) {
        var params = new URLSearchParams();
        if (searchTerms) {
            params.set('search', searchTerms);
        }
        params.set('page', String(page));
        params.set('itemsPerPage', String(itemsPerPage));

        return this.http.get(this.apiUrl + 'search/v1', { search: params })
            .map((res: Response) => res.json())
            .subscribe(results => {
                this._resultStore.results = results;
                this._results.next(Object.assign({}, this._resultStore).results);
            });
    }

     getSearchPaged(page: number = 1, itemsPerPage: number = 10, terms: any = '') {
        let paginationHeaders = new Headers();
        paginationHeaders.append('Content-Type', 'application/json');
        paginationHeaders.append('bz-pagination', page + ',' + itemsPerPage + ',' + terms);

        return this.http.get(this.apiUrl, { headers: paginationHeaders })
            .map((res: Response) => {
                return res.json()
            }).subscribe(results => {
                console.log(results);
                this._resultStore.results = results;
                this._results.next(Object.assign({}, this._resultStore).results);
            });
    }
     getProductSearchPaged(page: number = 1, itemsPerPage: number = 10, terms: any = '') {
        let paginationHeaders = new Headers();
        paginationHeaders.append('Content-Type', 'application/json');
        paginationHeaders.append('bz-pagination', page + ',' + itemsPerPage + ',' + terms);

        return this.http.get('/admin/api/product-search/', { headers: paginationHeaders })
            .map((res: Response) => {
                return res.json()
            }).subscribe(results => {
                // console.log(results);
                this._resultStore.results = results;
                this._results.next(Object.assign({}, this._resultStore).results);
            });
    }
}