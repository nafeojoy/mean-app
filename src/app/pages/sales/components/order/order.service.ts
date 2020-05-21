import { Injector, Injectable } from "@angular/core";
import { BaseService } from '../../../../shared/services/base-service';

@Injectable()
export class OrderService extends BaseService {
    constructor(injector: Injector) {
        super(injector);
    }

    init() {
        super.init();
    }

    getAllStatuses() {
        this.apiPath = "order-status";
        return this.http.get(this.apiUrl).map(res => res.json());
    }

    getConfirmedwithPurchaseStatus(query){
        return this.http.get(`${this.apiBaseUrl}/order/confirmed/with-purchase?is_purchase_order_created=${query['is_purchase_order_created']}`)
        .map(res => res.json());
    }

    getUnprocessedOrders(pageNo) {
        this.apiPath = 'unprocessed-order';
        return this.http.get(this.apiUrl + '?page_no=' + pageNo).map(res => res.json());
    }

    getOrderWithAge(name){
        return this.http.get(this.apiBaseUrl + 'order/get-order-age/by-status/'+name).map(res => res.json());
    }

    getCarriers() {
        return this.http.get(this.apiBaseUrl + 'order-carrier').map(res => res.json());
    }

    getCarriersList() {
        return this.http.get(this.apiBaseUrl + 'order-carrier-list').map(res => res.json());
    }

    updateFlags(data){
        this.apiPath = 'order';
        return this.http.put(this.apiUrl + 'update-flags/' , JSON.stringify(data), { headers: this.headers })
            .map(res => res.json());
    }

    updateReturnPrint(data){

        let order_ids = data.map(function(order){
            return order.order_no;
        })
        this.apiPath = 'order';
        return this.http.put(this.apiUrl+ 'update-return-print/', JSON.stringify(order_ids), {headers: this.headers})
            .map(res =>res.json());

    }

    searchOrders(status, order_no, cus_name, cus_mobile, from_date, to_date, pageNo) {
        this.apiPath = 'order-search';
        let search_obj = {
            status: status,
            order_no: order_no,
            cus_name: cus_name,
            cus_mobile: cus_mobile,
            from_date: from_date,
            to_date: to_date,
            pageNo: pageNo
        }
        return this.http.get(this.apiUrl + JSON.stringify(search_obj) + '?page_no=' + pageNo).map(res => res.json())
    }

    getOrderByStatus(status, pageNo) {
        this.apiPath = 'order';
        return this.http.get(this.apiUrl + status + '?page_no=' + pageNo).map(res => res.json());
    }

    updateOrderViewStatus(id) {
        this.apiPath = 'unprocessed-order';
        return this.http.put(this.apiUrl + id, JSON.stringify({ order_id: id }), { headers: this.headers })
            .map(res => res.json())
    }

    commentOnly(data) {
        this.apiPath = 'unprocessed-order';
        return this.http.put(this.apiUrl + 'comment/' + data.id, JSON.stringify(data), { headers: this.headers })
            .map(res => res.json())
    }

    updateStatus(data) {
        this.apiPath = 'order';
        return this.http.put(this.apiUrl + 'selected/' + data.order_id, JSON.stringify(data), { headers: this.headers })
            .map(res => res.json());
    }

    confirmOrder(data){
        this.apiPath = 'order';
        return this.http.put(this.apiUrl + 'confirm-order/' + data.order_id, JSON.stringify(data), { headers: this.headers })
            .map(res => res.json());
    }

    cancelledOrder(data){
        this.apiPath = 'order';
        return this.http.put(this.apiUrl + 'change-order-status/' + data.order_id, JSON.stringify(data), { headers: this.headers })
            .map(res => res.json());
    }

    closeOrder(data){
        this.apiPath = 'order';
        return this.http.put(this.apiUrl + 'change-order-status/' + data.order_id, JSON.stringify(data), { headers: this.headers })
            .map(res => res.json());
    }

    requestToReturn(data){
        this.apiPath = 'order';
        return this.http.put(this.apiUrl + 'change-order-status/' + data.order_id, JSON.stringify(data), { headers: this.headers })
            .map(res => res.json());
    }

    orderReturned(data){
        this.apiPath = 'order';
        return this.http.put(this.apiUrl + 'return-order/' + data.order_id, JSON.stringify(data), { headers: this.headers })
            .map(res => res.json());
    }

    getOrderDetailWithStockInfo(id) {
        this.apiPath = 'order';
        return this.http.get(this.apiUrl + 'selected/' + id, { headers: this.headers })
            .map(res => res.json());
    }

    getGifts(){
        return this.http.get(this.apiBaseUrl + 'gift/list/active', { headers: this.headers }).map(res => res.json());
    }

    getFilteredInshipment(data) {
        return this.http.post(this.apiBaseUrl + 'order/filter-order/', JSON.stringify(data), { headers: this.headers })
            .map(res => res.json());
    }

    reconfirm(data) {
        this.apiPath = 'order';
        return this.http.put(this.apiUrl + 'selected/reconfirm-return-order/' + data._id, JSON.stringify(data), { headers: this.headers })
            .map(res => res.json());
    }

    dismiss(data) {
        return this.http.put(this.apiUrl + 'selected/dismiss-return-order/' + data._id, JSON.stringify(data), { headers: this.headers })
            .map(res => res.json());
    }

}