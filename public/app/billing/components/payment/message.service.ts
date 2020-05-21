import { Injectable } from "@angular/core";
import { Http, Headers, RequestOptions, URLSearchParams } from "@angular/http";
@Injectable()
export class MessageService {
    headers;
    constructor(private http: Http) {
    }

    sendMessage(data) {
        let headers = new Headers({ 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' });
        headers.append('Accept', 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8')
        return this.http.post('https://sms.sslwireless.com/pushapi/dynamic/server.php', data, { headers: headers }).map(res => res.json());
    }

    // sendInfo(data){
    //     let headers = new Headers({ 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' });
    //     headers.append('Accept', 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8')
    //     return this.http.post('https://sandbox.sslcommerz.com/gwprocess/v3/api.php', data, { headers: headers }).map(res => res.json());
    // }

    sendInfo(data){
        let headers = new Headers({ 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' });
        headers.append('Accept', 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8')
        return this.http.post('https://securepay.sslcommerz.com/gwprocess/v3/api.php', data, { headers: headers }).map(res => res.json());
    }

}

