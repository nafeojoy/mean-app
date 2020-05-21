
import {Injectable} from "@angular/core";
import {Http, Headers} from "@angular/http";
@Injectable()
export class PageTopService{
  headers;
  constructor(private http: Http){
    this.headers=new Headers();
    this.headers.append('Content-Type', 'application/json');
  }

  loguot(){
    return this.http.post('/admin/api/auth/logout', JSON.stringify({}), {headers: this.headers}).map(res=>res.json());
  }
}
