import { Injector, Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';
import { Observable } from 'rxjs/Observable';

import { BaseService } from '../../../shared/services/base-service';


@Injectable()
export class TestimonialBlockService extends BaseService {
    private apiPath = this.apiBaseUrl + 'testimonial';

    private _getTestimonials: Observable<any> = null;
    //public _getTestimonials: any = {}

    constructor(injector: Injector) {
        super(injector);
    }

    getTestimonials() {
        if (!this._getTestimonials) {
            this._getTestimonials = this.http.get(this.apiPath)
                .map(res => res.json())
                .publishReplay(1)
                .refCount();
        }
        return this._getTestimonials;
    }
}