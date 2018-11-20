import { Component, OnInit } from '@angular/core';

import { EnergydataService } from '../../services/energydata.service';

import { MatSelect } from '@angular/material';

@Component({
  selector: 'app-user-input',
  templateUrl: './user-input.component.html',
  styleUrls: ['./user-input.component.css']
})
export class UserInputComponent implements OnInit {

  states:Array<String> = ['Bavaria','Berlin','Brandenburg','Bremen','Hamburg','Hesse','Mecklenburg-Vorpommern','Lower Saxony','North Rhine-Westphalia','Rheinland-Pfalz','Saarland','Saxony','Saxony-Anhalt','Schleswig-Holstein','Thuringia'];
  devices:Array<String> = ['Washing Machine', 'Dish Washer', 'Hair Dryer', 'Oven'];

  constructor(private energyDataService: EnergydataService) { }

  ngOnInit() {
  }

  handleSubmit(){
    console.log('Hi');
  }
}
