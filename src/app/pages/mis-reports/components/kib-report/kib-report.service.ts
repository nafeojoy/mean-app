import { Injector, Injectable } from "@angular/core";
import { URLSearchParams } from '@angular/http';

import { BaseService } from '../../../../shared/services/base-service';

@Injectable()
export class KIBService extends BaseService {

    constructor(injector: Injector) {
        super(injector);
        this.apiPath = 'product';
    }

    get(date) {
        return this.http.get(this.apiUrl+'kib-report/'+date, { headers: this.headers })
            .map(res => res.json());
    }

}