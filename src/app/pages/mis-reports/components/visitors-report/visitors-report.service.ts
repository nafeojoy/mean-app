import { Injector, Injectable } from "@angular/core";
import { URLSearchParams } from '@angular/http';

import { BaseService } from '../../../../shared/services/base-service';

@Injectable()
export class VisitorsReportService extends BaseService {

    constructor(injector: Injector) {
        super(injector);
        this.apiPath = 'visitor-report';
    }


    getData(data) {
        return this.http.post(this.apiUrl, JSON.stringify(data), { headers: this.headers })
            .map(res => res.json());
    }
    
}