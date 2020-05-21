import { Injector, Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';
import { BaseService } from '../../../shared/services/base-service';


@Injectable()
export class NewsService extends BaseService {
    private apiPath = this.apiBaseUrl + 'news/';

    constructor(injector: Injector) {
        super(injector);
    }

    get(pageNum) {
        let paginationHeaders = new Headers();
        paginationHeaders.append('Content-Type', 'application/json');
        paginationHeaders.append('bz-pagination', pageNum);
        return this.http.get(this.apiPath, { headers: paginationHeaders })
            .map(res => res.json());
    }

    getDetail(id) {
        return this.http.get(this.apiPath + id).map(res => res.json());
    }

}

