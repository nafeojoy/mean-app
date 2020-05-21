import { Injector, Injectable } from "@angular/core";
import { Http, Headers } from "@angular/http";
import { BaseService } from '../../../../shared/services/base-service';

@Injectable()
export class FeatureCategorysService extends BaseService {
    constructor(injector: Injector) {
        super(injector);
    }

    init() {
        super.init();
        this.apiPath = 'categorys';
    }


    getCategorys(pageNum) {
        this.apiPath = 'categorys';
        let paginationHeaders = new Headers();
        paginationHeaders.append('Content-Type', 'application/json');
        paginationHeaders.append('bz-feature-pagination', pageNum);
        return this.http.get(this.apiUrl, { headers: paginationHeaders }).map(res => res.json())
    }

    getFeatured() {
        this.apiPath = 'featured_categorys';
        return this.http.get(this.apiUrl).map(res => res.json())
    }

    update(data) {
        this.apiPath = 'featured_categorys';
        return this.http.post(this.apiUrl, JSON.stringify(data), { headers: this.headers })
            .map(res => res.json());
    }

    remove(_id) {
        this.apiPath = 'featured_categorys';
        return this.http.put(this.apiUrl + _id, { headers: this.headers }).map(res => res.json());
    }

}