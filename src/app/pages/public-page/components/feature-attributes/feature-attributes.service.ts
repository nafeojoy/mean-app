import { Injector, Injectable } from "@angular/core";
import { Http, Headers } from "@angular/http";
import { BaseService } from '../../../../shared/services/base-service';

@Injectable()
export class FeatureAttributeService extends BaseService {
    constructor(injector: Injector) {
        super(injector);
    }

    init() {
        super.init();
        this.apiPath = 'attributes';
    }


    getAttribute() {
        this.apiPath = 'attributes';
        return this.http.get(this.apiUrl).map(res => res.json())
    }

    getFeatured() {
        this.apiPath = 'featured_attributes';
        return this.http.get(this.apiUrl).map(res => res.json())
    }

    update(data) {
        this.apiPath = 'featured_attributes';
        return this.http.post(this.apiUrl, JSON.stringify(data), { headers: this.headers })
            .map(res => res.json());
    }

    remove(_id) {
        this.apiPath = 'featured_attributes';
        return this.http.put(this.apiUrl + _id, { headers: this.headers }).map(res => res.json());
    }

}