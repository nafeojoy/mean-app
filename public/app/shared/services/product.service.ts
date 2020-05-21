import { Injector, Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';

import { BaseService } from './base-service';


@Injectable()
export class ProductService extends BaseService {

    private apiPath = this.apiBaseUrl + '';

    constructor(injector: Injector) {
        super(injector);
    }

    get(id) {
        id = id.replace(/\//g, '%2F');
        return this.http.get(this.apiPath + 'product/' + id).map(res => res.json());
    }

    getQueryResult(search_type, seo_url) {
        // let pageNumHeader = new Headers();
        // pageNumHeader.append('pageNum', pageNum);
        seo_url = seo_url.replace(/\//g, '%2F');
        return this.http.get(this.apiPath + search_type + '/' + seo_url)
            .map(res => res.json());
    }

    getOnScrolData(search_type, seo_url, pageNum) {
        this.headers.delete('pagenum');
        this.headers.append('pagenum', pageNum);
        seo_url = seo_url.replace(/\//g, '%2F');
        return this.http.get(this.apiPath + 'onscroll-pagination/' + search_type + '/' + seo_url, { headers: this.headers })
            .map(res => res.json());
    }

    searchProducts(data) {
        return this.http.post(this.apiPath + 'product', JSON.stringify(data), { headers: this.headers })
            .map(res => res.json());
    }

    getPreviewImages(id, page_num) {
        return this.http.get(this.apiPath + 'product-preview?id=' + id + '&page_num=' + page_num).map(res => res.json())
    }
}