import { Injector, Injectable } from "@angular/core";
import { Headers } from '@angular/http';
import { BaseService } from '../../../../shared/services/base-service';

@Injectable()
export class FeatureCategoryService extends BaseService {
    constructor(injector: Injector) {
        super(injector)
    }

    init() {
        super.init();
    }

    getUnfeatured(data) {
        this.apiPath = 'unfeatured-categories';
        let paginationHeaders = new Headers();
        paginationHeaders.append('Content-Type', 'application/json');
        paginationHeaders.append('bz-feature-pagination', data.pageNum);
        paginationHeaders.append('import_id', data.import_id);
        paginationHeaders.append('name', data.name);
        return this.http.get(this.apiUrl, { headers: paginationHeaders }).map(res => res.json())
    }

    getInitData() {
        this.apiPath = 'featured-categories';
        return this.http.get(this.apiUrl).map(res => res.json())
    }

    update(data) {
        this.apiPath = 'featured-categories';
        return this.http.put(this.apiUrl, JSON.stringify(data), { headers: this.headers })
            .map(res => res.json());
    }

    remove(_id) {
        this.apiPath = 'remove-feature';
        return this.http.put(this.apiUrl + _id, { headers: this.headers }).map(res => res.json());
    }

}