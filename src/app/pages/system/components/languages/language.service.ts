import { Injector, Injectable } from "@angular/core";

import { BaseService } from '../../../../shared/services/base-service';

@Injectable()
export class LanguageService extends BaseService {
    constructor(injector: Injector) {
        super(injector)
    }

     init() {
        super.init();
        this.apiPath = 'language';
    }

    get(id) {
        return this.http.get(this.apiUrl + id)
            .map(res => res.json())
    }

    getAll() {
        return this.http.get(this.apiUrl, { headers: this.headers }).map(res => res.json());
    }

    add(language) {
        return this.http.post(this.apiUrl, JSON.stringify(language), { headers: this.headers })
            .map(res => res.json());
    }

    update(language) {
        return this.http.put(this.apiUrl + language._id, JSON.stringify(language), { headers: this.headers })
            .map(res => res.json());
    }

    delete(id) {
        return this.http.delete(this.apiUrl + id)
            .map(res => res.json());
    }
}
