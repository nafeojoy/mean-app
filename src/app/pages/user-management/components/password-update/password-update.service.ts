import { Injectable } from "@angular/core";
import { Http, Headers } from "@angular/http";
@Injectable()
export class PasswordUpdateService {
  headers;
  constructor(private http: Http) {
    this.headers = new Headers();
    this.headers.append('Content-Type', 'application/json');
  }


  changePassword(data) {
    return this.http.put('/admin/api/auth/change-password', JSON.stringify(data), { headers: this.headers })
      .map(res => res.json());
  }


}