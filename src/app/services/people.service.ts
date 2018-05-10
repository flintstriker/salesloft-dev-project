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

  //Fires an http request with the given url and header object
  launchRequest(query: string, headers: Headers): Observable<any> {
    return this.http.get(query, { headers: this.getHeaders() });
  }

  //returns up to 100 people from the Salesloft API.
  getPeople(page?: number, per_page?: number): Promise<Array<Person>> {

    return new Promise((resolve, reject) => {

      this.launchRequest(this.getQueryString(page, per_page), this.getHeaders())
        .subscribe(result => {

          let jsonObj = result.json();
          let people: Array<Person> = jsonObj["data"];
          resolve(people);
        },
          error => {
            this.handleError(error);
            reject(error);
          });
    })
  }

  //Returns all available people from the Salesloft API
  getAllPeople(): Promise<Array<Person>> {

    let totalPageCount = 0;
    let perPage = 100;

    let people = new Array<Person>();

    return new Promise((resolve, reject) => {
      this.getTotalPeopleCount().then(count => {
        totalPageCount = Math.ceil(count / perPage);

        let observe: Observable<any> = this.launchRequest(this.getQueryString(1, perPage), this.getHeaders());

        let requestCount = 1;
        for (var i = 2; i <= totalPageCount; i++) {
          requestCount += 1;
          observe = concat(observe, (this.launchRequest(this.getQueryString(i, perPage), this.getHeaders())));
        }

        let responseCount = 0;
        //This inner method gets fired for each concatenated observable
        //We wait until we've retrieved all responses
        observe.subscribe(result => {
          let jsonObj = result.json();
          let peopleResult: Array<Person> = jsonObj["data"];
          people = people.concat(peopleResult);
          responseCount += 1;
          //This is true when we've received an equal number of responses as the
          //# of requests we've made
          if (responseCount == requestCount) {
            resolve(people);
          }
        })
      })
    });
  }

  //Sends a query to the API to determine how
  //Many people records exist. This is used to
  //figure out how many requests to make
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

  //Builds the url query string
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


  //Called when a request returns an error
  //TODO: figure out what to actually do with these errors
  protected handleError(error) {
    if (error.status === 401) {
      // here you can re-route to login page, or handle the error usefully
    }
    console.log('Could not load people', error);
  }
}
