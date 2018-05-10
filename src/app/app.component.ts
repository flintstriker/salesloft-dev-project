import { Component, OnInit } from '@angular/core';
import { Person } from './interfaces/person.interface';
import { PeopleService } from './services/people.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent implements OnInit{
  title = 'app';
  _peopleSmall = new Array<Person>();
  _peopleFull = new Array<Person>();
  _characterDict;
  _currentPage = 1;

  constructor(protected _peopleService: PeopleService) {}

  ngOnInit() {
    this.getPeopleSmall();
  }

  getPeopleSmall() {
    this._peopleService.getPeople(this._currentPage).then(successResult => {
      this._peopleSmall = successResult
    },
    failureResult => {
      this.onFailure(failureResult);
    })
  }

  onFailure(failureResult){
    console.log(failureResult);
  }

  nextPage() {
    this._currentPage += 1;
    this.getPeopleSmall();
  }

  previousPage() {
    if(this._currentPage > 1){
      this._currentPage -= 1;
      this.getPeopleSmall();
    }
  }

  countEmailChars() {
    let characters = {};

   this._peopleService.getAllPeople().then(successResult => {
    this._peopleFull = successResult;
    this._peopleFull.forEach(person => {
      if(person.email_address){
        let email = person.email_address;
        let charArray : Array<string> = email.split('');
  
        charArray.forEach(char => {
          if(characters[char]){
            characters[char] += 1;
          }
          else{
            characters[char] = 1;
          }
        });
      }
      else {
        if(characters['no_Address']){
          characters['no_Address'] += 1;
        }
        else{
          characters['no_Address'] = 1;
        }
      }      
    });

    this._characterDict = Object.keys(characters).map(key => {
      return [key, characters[key]];
    });

    this._characterDict.sort(function(a, b) {
      return b[1] - a[1];
    });

    },
    failureResult => {
      this.onFailure(failureResult);
    });

    
  }
}
