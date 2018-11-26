import { Component, OnInit } from '@angular/core';

import { EnergydataService } from '../../services/energydata.service';

import { MatSelect } from '@angular/material';
import { NONE_TYPE } from '@angular/compiler/src/output/output_ast';

@Component({
  selector: 'app-user-input',
  templateUrl: './user-input.component.html',
  styleUrls: ['./user-input.component.css']
})
export class UserInputComponent implements OnInit {

  states:Array<String> = ['Baden-Wuerttemberg', 'Bavaria','Berlin','Brandenburg','Bremen','Hamburg','Hesse','Mecklenburg-Vorpommern','Lower Saxony','North Rhine-Westphalia','Rheinland-Pfalz','Saarland','Saxony','Saxony-Anhalt','Schleswig-Holstein','Thuringia'];
  devices:Array<String> = ['Washing Machine', 'Dish Washer', 'Hair Dryer', 'Oven'];
  selectedState:String = 'Germany';
  selectedDevice:String = 'Any';

  now:Number = 0;

  constructor(private energyDataService: EnergydataService) { }

  ngOnInit() {
    // Sets the variables, if they were already chosen
    this.selectedState = this.energyDataService.selectedState;
    this.selectedDevice = this.energyDataService.selectedDevice;
    // validation, if the forecast for tomorrow is already available (after 6pm)
    this.now = new Date().getHours();
  }

  handleSubmit(){
    let selectedDay = 'today';
    this.energyDataService.setGlobalVar(this.selectedState, this.selectedDevice, selectedDay);
  }

  handleSubmitTomorrow(){
    let selectedDay = 'tomorrow';
    this.energyDataService.setGlobalVar(this.selectedState, this.selectedDevice, selectedDay);
  }
}
