'use strict';

import { Component, OnInit } from '@angular/core';
import { EnergydataService } from '../../services/energydata.service';
import { TestComponentRenderer } from '@angular/core/testing';

import { Observable } from 'rxjs';

import { Result } from '../../models/result';
import { from } from 'rxjs';

@Component({
  selector: 'app-results',
  templateUrl: './results.component.html',
  styleUrls: ['./results.component.css']
})
export class ResultsComponent implements OnInit {
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
    ger: 'germany',
    ten: 'tennet',
    tra: 'transnet',
    amp: 'amprion',
    her: 'hertz'
  }
  
  generationTypes = {
    tot: 'total-generation',
    sol: 'solar',
    wof: 'wind-offshore',
    won: 'wind-onshore'
  }

  // Hourly share of Biomass in percentage; Position 0 = 0 am!
  pumpedHydroShare:Array<number> = [0.0048, 0.0037, 0.0027, 0.0023, 0.0027, 0.0022, 0.0019, 0.0017, 0.0019, 0.0017, 0.0016, 0.0015, 0.0015, 0.0015, 0.0015, 0.0014, 0.0014, 0.0014, 0.0015, 0.0015, 0.0016, 0.0015, 0.0018, 0.0029, 0.0033, 0.0066, 0.0136, 0.0202, 0.0191, 0.0247, 0.0271, 0.0298, 0.0337, 0.0328, 0.0307, 0.0263, 0.0280, 0.0246, 0.0223, 0.0187, 0.0195, 0.0157, 0.0139, 0.0120, 0.0128, 0.0123, 0.0118, 0.0097, 0.0104, 0.0074, 0.0075, 0.0062, 0.0076, 0.0066, 0.0061, 0.0046, 0.0054, 0.0061, 0.0067, 0.0068, 0.0066, 0.0072, 0.0084, 0.0088, 0.0074, 0.0089, 0.0128, 0.0178, 0.0149, 0.0214, 0.0256, 0.0316, 0.0245, 0.0267, 0.0333, 0.0381, 0.0368, 0.0354, 0.0348, 0.0333, 0.0373, 0.0303, 0.0251, 0.0210, 0.0246, 0.0206, 0.0157, 0.0121, 0.0213, 0.0161, 0.0113, 0.0075, 0.0108, 0.0067, 0.0049, 0.0036];
  
  // Average of hourly generation of water, biomass and other renewable sources
  otherRenewables:number = 1778 + 4568 + 141;

  constructor(private energyDataService: EnergydataService) { }
  
  ngOnInit() {
    this.calculateOptimum(this.areaCodes.ger)
    .then(results => this.getRenewableShare(results))
    .then(() => this.calculateShare(this.renewableArray, this.totalArray))
    .then(shares => this.findOptimum(shares))
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
        return ((renArray[idx*4] + this.otherRenewables)  / el) + this.pumpedHydroShare[idx*4];
      })
      // To-Do: Add the other renewable sources as fixed values (water: 1780, Bio: 4568, Other: 140, Pumped-Hydro: pumpedHydroShare --> hourly)
      return this.shareArray;
    }

    findOptimum(shaArray) {
      // not used:
      // let largest = Math.max.apply(Math, shaArray);
      // let largestPosition = shaArray.indexOf(largest);
      // this.optimalTime = new Date().setHours(largestPosition);

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
