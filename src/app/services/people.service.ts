import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions, Response } from '@angular/http';
import { Observable, concat } from 'rxjs';
import { ServerResponse } from '../interfaces/server-response.interface';
import { environment } from '../../environments/environment';
import { Person } from '../interfaces/person.interface';

@Injectable({
  providedIn: 'root'
})
export class PeopleService {

  _apiRoute = '/people.json';
  constructor(protected http: Http) { }

  getHeaders(): Headers {
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('Authorization', 'Bearer ' + environment.user_key);

    return headers;
  }

  launchRequest(query: string, headers: Headers): Observable<any> {
    return this.http.get(query, { headers: this.getHeaders() });
  }
  //returns 25 people from the Salesloft API.
  getPeople(page?: number, per_page?: number): Promise<Array<Person>> {

    return new Promise((resolve, reject) => {

      this.launchRequest(this.getQueryString(page, per_page), this.getHeaders())
        .subscribe(result => {

          let jsonObj = result.json();
          console.log(jsonObj);
          let people: Array<Person> = jsonObj["data"];
          resolve(people);
        },
          error => {
            this.handleError(error);
            reject(error);
          });
    })
  }

  getAllPeople(): Promise<Array<Person>> {

    let totalPageCount = 0;
    let perPage = 100;

    let people = new Array<Person>();

    return new Promise((resolve, reject) => {
      this.getTotalPeopleCount().then(count => {
        totalPageCount = Math.ceil(count / perPage);

        let observe: Observable<any> = this.launchRequest(this.getQueryString(1, perPage), this.getHeaders());

        for (var i = 2; i <= totalPageCount; i++) {
          observe = concat(observe, (this.launchRequest(this.getQueryString(i, perPage), this.getHeaders())));
        }

        observe.subscribe(result => {
          let jsonObj = result.json();
          let peopleResult: Array<Person> = jsonObj["data"];
          people = people.concat(peopleResult);

          if (people.length == count) {
            resolve(people);
          }
        })
      })
    });
  }

  getTotalPeopleCount(): Promise<number> {
    let query = environment.apiURL + this._apiRoute;
    query += '?include_paging_counts=true&per_page=1';

    return new Promise((resolve, reject) => {
      this.launchRequest(query, this.getHeaders()).subscribe(result => {
        let jsonObj = result.json();
        let metadata = jsonObj["metadata"];
        console.log(metadata);
        let totalPeople = metadata['paging']['total_count'];
        resolve(totalPeople);
      },
        error => {
          this.handleError(error);
          reject(error);
        });
    });
  }

  getQueryString(page_number?: number, per_page?: number): string {
    let query = environment.apiURL + this._apiRoute;
    query += '?include_paging_counts=true'

    if (page_number) {
      query += '&page=' + page_number;
    }

    if (per_page) {
      query += "&per_page=" + per_page;
    }

    return query;
  }

  protected handleError(error) {
    if (error.status === 401) {
      // here you can re-route to login page, or handle the error usefully
    }
    console.log('Could not load people', error);
  }
}
