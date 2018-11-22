'use strict';

import { Component, OnInit } from '@angular/core';
import { EnergydataService } from '../../services/energydata.service';

import { Result } from '../../models/result';

@Component({
  selector: 'app-results',
  templateUrl: './results.component.html',
  styleUrls: ['./results.component.css']
})
export class ResultsComponent implements OnInit {
  selectedDevice:string = 'Nothing Selected';
  selectedState:string = 'Nothing Selected';

  results:Result = {
    won:Object,
    tot:Object,
    sol:Object,
    wof:Object
  };

  renewableArray:Array<Number> = [];
  totalArray:Array<Number> = [];

  shareArray:Array<Number> = [];
  sortedShareArray:Array<Number>;
  sharePositions:Array<Number> = [];

  optimalTime:Number;
  
  areaCodes = {
    germany: ['Germany'],
    tennet: ['Bavaria', 'Bremen', 'Hesse', 'Lower Saxony', 'Schleswig-Holstein'],
    transnet:['Baden-Wuerttemberg'],
    amprion: ['North Rhine-Westphalia', 'Rheinland-Pfalz','Saarland'],
    hertz: ['Berlin','Brandenburg', 'Hamburg', 'Mecklenburg-Vorpommern', 'Saxony','Saxony-Anhalt','Thuringia']
  }
  
  generationTypes = {
    tot: 'total-generation',
    sol: 'solar',
    wof: 'wind-offshore',
    won: 'wind-onshore'
  }

  states:Array<String> = ['Baden-Wuerttemberg', 'Bavaria','Berlin','Brandenburg','Bremen','Hamburg','Hesse','Mecklenburg-Vorpommern','Lower Saxony','North Rhine-Westphalia','Rheinland-Pfalz','Saarland','Saxony','Saxony-Anhalt','Schleswig-Holstein','Thuringia'];

  // Hourly share of Biomass in percentage; Position 0 = 0 am!
  pumpedHydroShare:Array<number> = [0.0034, 0.0021, 0.0017, 0.0015, 0.0014, 0.0019, 0.0109, 0.0252, 0.0309, 0.0234, 0.0153, 0.0117, 0.0079, 0.0062, 0.0063, 0.0078, 0.0117, 0.0234, 0.0306, 0.0351, 0.0284, 0.0183, 0.0140, 0.0065]
 
  // Average of hourly generation of water, biomass and other renewable sources
  otherRenewables:number = 1778 + 4568 + 141;

  constructor(private energyDataService: EnergydataService) { }
  
  ngOnInit() {
    this.selectedDevice = this.energyDataService.selectedDevice;
    this.selectedState = this.energyDataService.selectedState;

    
    this.calculateOptimum(this.findOperator())
    .then(results => this.getRenewableShare(results))
    .then(() => this.calculateShare(this.renewableArray, this.totalArray))
    .then(shares => this.findOptimum(shares))
  }

  findOperator(){
    for(let key in this.areaCodes) {
      if(this.areaCodes[key].indexOf(this.selectedState) >= 0){
        console.log(key.toString());
        return key;
      } 
      else {
        console.log('State not found yet (Error if shown 5 times!)');
      }
    }
  }
  
  // get the data for all generationtypes and save the results in one object
  async calculateOptimum(areaCode){
    for (let key in this.generationTypes){
      await this.energyDataService.getData(this.generationTypes[key], areaCode )
      // transform to promise, as observables are not waiting for return
        .toPromise()
        .then(data => {
          return this.results[key] = data;
        });
      }
    return this.results;
  }
  
  // create array of summed values for renewables and the array for total generation
  getRenewableShare(object:Result) {
  for(let key in object) {
        // validation of the data from the api
        if(object[key].documentType === 'A69' && this.renewableArray.length === 0){
          this.renewableArray = object[key].result;
        } else if(object[key].documentType === 'A69' && this.renewableArray.length > 0) {
          // adding values to the existing array for renewables
          this.renewableArray = this.renewableArray.map((num, idx) => {
            return num + object[key].result[idx];
          });
        } else if (object[key].documentType === 'A71') {
          this.totalArray = object[key].result
        };
      }
    }

    calculateShare(renArray, totArray) {
      this.shareArray = totArray.map((el, idx) => {
        // every 4th element, as the resolution of the renewable data is quarterhours --> renArray.length === 96
        // PumpedHydroShare is added, as average percentile over the last two years; OtherRenewables are added as fixed values (minimal deviation from average); source: "2018-10-25 Generated Power Analysis" --> (c) Bundesnetzagentur | SMARD.de
        return ((renArray[idx*4])  / el) + this.pumpedHydroShare[idx];
      })
      // To-Do: Add the other renewable sources as fixed values (water: 1780, Bio: 4568, Other: 140, Pumped-Hydro: pumpedHydroShare --> hourly)
      return this.shareArray;
    }

    findOptimum(shaArray) {

      // populate array from sharesArray to sort it descending
      this.sortedShareArray = shaArray.slice();
      this.sortedShareArray.sort((a:number, b:number) => {return b-a});

      // find the indexes of the sorted values in the original array
      for(let i = 0; i< this.sortedShareArray.length; i++){
        this.sharePositions.push(shaArray.indexOf(this.sortedShareArray[i]));
      }
      // saves hours with the highest shares during the day in a descending order
      return this.sharePositions;
    }
          
          
          /*
          ONLY NEEDED FOR SMARD-FETCH
          resultsSmard:Object = {};
          
          this.getPrognosis(this.prognosisCat);
          
          
          generationCat = {
            bio: 103, 
            water: 1226, 
            windOffshore: 1225, 
            windOnshore: 100, 
            pv: 102, 
            otherRenewables: 1228, 
            nuclear: 1224, 
            brownCoal: 1223, 
            hardCoal: 111, 
            naturalGas: 112, 
            pumpedStorage: 113, 
            others: 1227,
          };
          
          prognosisCat = {
            all: 122,
            others: 715,
            windOffshore: 3791,
            windOnshore: 123,
            pv: 125,
  };



  // Finding the date of last sunday for the SMARD-Platform
  getLastSunday(date) {
    if(date.getDay() != 0){
      date.setDate(date.getDate() - date.getDay());
      return date.setHours(24,0,0,0);
    } else{
      date.setDate(date.getDate() - 7)
      return date.setHours(24,0,0,0);
    }
  }

  getPrognosis(object: Object) {
    for(let key in object) {
      this.energyDataService.getDataSmard(this.getLastSunday(new Date()), object[key])
      .subscribe(data => {
        console.log(data, key);
        return this.resultsSmard[key] = data['series'];
        })
      };
      console.log('Here are the winners:', this.resultsSmard);
    }
  */
}
