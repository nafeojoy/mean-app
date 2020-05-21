import { Injector, Injectable } from "@angular/core";

import { BaseService } from '../../../../shared/services/base-service';

@Injectable()
export class BlogService extends BaseService {
    constructor(injector: Injector) {
        super(injector)
    }

    init() {
        super.init();
        this.apiPath = 'blog';
    }

    get(id) {
        return this.http.get(this.apiUrl + id)
            .map(res => res.json())
    }

    getAll(status) {
        return this.http.get(this.apiBaseUrl + 'blog?status=' + status, { headers: this.headers }).map(res => res.json());
    }

    add(blog) {
        return this.http.post(this.apiUrl, JSON.stringify(blog), { headers: this.headers })
            .map(res => res.json());
    }

    update(blog) {
        return this.http.put(this.apiUrl + blog._id, JSON.stringify(blog), { headers: this.headers })
            .map(res => res.json());
    }

    delete(id) {
        return this.http.delete(this.apiUrl + id)
            .map(res => res.json());
    }
}
