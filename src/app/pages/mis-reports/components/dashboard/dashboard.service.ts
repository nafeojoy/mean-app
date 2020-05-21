import { Injector, Injectable } from "@angular/core";
import { BaseService } from '../../../../shared/services/base-service';
import { Observable } from 'rxjs';

@Injectable()
export class DashboardService extends BaseService {

    constructor(injector: Injector) {
        super(injector);
        this.apiPath = 'dashboard';
    }


    public getDashboardInitData(): Observable<any[]> {
        let visit_info = this.http.get(this.apiUrl + 'visiting-info').map(res => res.json());
        let quick_overview = this.http.get(this.apiUrl + 'quick-overview').map(res => res.json());
        let daily_sales_purchase = this.http.get(this.apiUrl + 'daily-sales-purchase').map(res => res.json());
        let order_processing_and_customer = this.http.get(this.apiUrl + 'order-processing-and-new-customer').map(res => res.json())
        return Observable.forkJoin([visit_info, quick_overview, daily_sales_purchase, order_processing_and_customer]);
    }

    getWithDateRange(date){
        let visit_info = this.http.get(`${this.apiUrl}visiting-info?from_date=${date.from_date}&to_date=${date.to_date}`).map(res => res.json());
        let quick_overview = this.http.get(`${this.apiUrl}quick-overview?from_date=${date.from_date}&to_date=${date.to_date}`).map(res => res.json());
        let daily_sales_purchase = this.http.get(`${this.apiUrl}daily-sales-purchase?from_date=${date.from_date}&to_date=${date.to_date}`).map(res => res.json());
        let order_processing_and_customer = this.http.get(`${this.apiUrl}order-processing-and-new-customer?from_date=${date.from_date}&to_date=${date.to_date}`).map(res => res.json())
        return Observable.forkJoin([visit_info, quick_overview, daily_sales_purchase, order_processing_and_customer]);
    }

    getVisitInfo(date){
        return this.http.get(`${this.apiUrl}visiting-info?from_date=${date.from_date}&to_date=${date.to_date}`).map(res => res.json());
    }

    getQuickViewInfo(date){
        return this.http.get(`${this.apiUrl}quick-overview?from_date=${date.from_date}&to_date=${date.to_date}`).map(res => res.json());
    }

    getDailySalesPurchaseInfo(date){
        return this.http.get(`${this.apiUrl}daily-sales-purchase?from_date=${date.from_date}&to_date=${date.to_date}`).map(res => res.json());
    }

    getOrderProcessInfo(date){
        return this.http.get(`${this.apiUrl}order-processing-and-new-customer?from_date=${date.from_date}&to_date=${date.to_date}`).map(res => res.json());
    }

}