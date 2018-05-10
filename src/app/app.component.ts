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
  _maxPages = 1;
  _peoplePerPage = 25;

  constructor(protected _peopleService: PeopleService) {}

  ngOnInit() {
    this.getMaxPages();
    this.getPeopleSmall();
  }

  //Figures out the maximum number of people pages
  //based on the total number of people and the max
  //number of people per page
  getMaxPages() {
    this._peopleService.getTotalPeopleCount().then(count => {
      this._maxPages = Math.ceil(count / this._peoplePerPage);
    });
  }

  //Retrieves a small number of people. Populates the "People" list
  getPeopleSmall() {
    this._peopleService.getPeople(this._currentPage).then(successResult => {
      this._peopleSmall = successResult
    },
    failureResult => {
      this.onRequestFailure(failureResult);
    })
  }

  //Executes when some aspect of our API requests fails
  onRequestFailure(failureResult){
    console.log(failureResult);
  }

  //Increments the page counter and retrieves the next group of people
  nextPage() {
    if(this._currentPage < this._maxPages) {
      this._currentPage += 1;
      this.getPeopleSmall();
    }
  }

  //Decrements the page counter and retrieves the next group of people
  previousPage() {
    if(this._currentPage > 1){
      this._currentPage -= 1;
      this.getPeopleSmall();
    }
  }

  //Retrieves all available People and counts the occurrence of each unique character
  //in their email addresses
  //Also counts instances where a person has no email address
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
      this.onRequestFailure(failureResult);
    });
  }
}
