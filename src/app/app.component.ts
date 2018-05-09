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
  people;

  constructor(protected _peopleService: PeopleService) {}

  ngOnInit() {
    this._peopleService.getPeople().subscribe(response => {
      this.people = response.json()["data"];
    })
  }
}
