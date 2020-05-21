import { Injectable } from "@angular/core";
import { Http, Headers } from "@angular/http";
@Injectable()
export class LoginService {
  headers;
  constructor(private http: Http) {
    this.headers = new Headers();
    this.headers.append('Content-Type', 'application/json');
  }

  login(loginData) {
    return this.http.post('/admin/api/auth/login', JSON.stringify(loginData), { headers: this.headers })
      .map(res => res.json());
  }
}
