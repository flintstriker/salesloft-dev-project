import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions, Response } from '@angular/http';
import { Observable } from 'rxjs';
import { ServerResponse } from '../interfaces/server-response.interface';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PeopleService {

  constructor(protected http: Http) { }

  getPeople(): Observable<any> {
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('Authorization', 'Bearer ' + environment.user_key);

    let options = new RequestOptions({headers: headers});

    return this.http.get("http://api.salesloft.com/v2/people.json", {headers: headers});      
  }
}
