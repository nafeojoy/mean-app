import { Injector, Injectable } from "@angular/core";
import { BaseService } from '../../../../shared/services/base-service';

@Injectable()
export class QueryService extends BaseService {
    constructor(injector: Injector) {
        super(injector);
    }

    init() {
        super.init();
        this.apiPath = 'customer-query';
    }

    getAll(data) {
        return this.http.get(this.apiUrl + data.status + '?page_no=' + data.page_no, { headers: this.headers }).map(res => res.json());
    }

    getComments(id) {
        return this.http.get(this.apiUrl + 'comment/' + id, { headers: this.headers }).map(res => res.json());
    }

    addComment(data) {
        return this.http.put(this.apiUrl + 'comment/' + data.id, JSON.stringify(data), { headers: this.headers }).map(res => res.json());
    }

    update(id) {
        return this.http.put(this.apiUrl + 'update-status/' + id, { headers: this.headers }).map(res => res.json());
    }

    add(data) {
        return this.http.post(this.apiUrl, JSON.stringify(data), { headers: this.headers }).map(res => res.json());
    }

    getSearch(text){
        return this.http.get(this.apiUrl + 'search-query/' + text, { headers: this.headers }).map(res => res.json());
    }
}
