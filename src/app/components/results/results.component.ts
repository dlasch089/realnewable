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
  pumpedHydroShare:Array<number> = [1.0048, 1.0037, 1.0027, 1.0023, 1.0027, 1.0022, 1.0019, 1.0017, 1.0019, 1.0017, 1.0016, 1.0015, 1.0015, 1.0015, 1.0015, 1.0014, 1.0014, 1.0014, 1.0015, 1.0015, 1.0016, 1.0015, 1.0018, 1.0029, 1.0033, 1.0066, 1.0136, 1.0202, 1.0191, 1.0247, 1.0271, 1.0298, 1.0337, 1.0328, 1.0307, 1.0263, 1.0280, 1.0246, 1.0223, 1.0187, 1.0195, 1.0157, 1.0139, 1.0120, 1.0128, 1.0123, 1.0118, 1.0097, 1.0104, 1.0074, 1.0075, 1.0062, 1.0076, 1.0066, 1.0061, 1.0046, 1.0054, 1.0061, 1.0067, 1.0068, 1.0066, 1.0072, 1.0084, 1.0088, 1.0074, 1.0089, 1.0128, 1.0178, 1.0149, 1.0214, 1.0256, 1.0316, 1.0245, 1.0267, 1.0333, 1.0381, 1.0368, 1.0354, 1.0348, 1.0333, 1.0373, 1.0303, 1.0251, 1.0210, 1.0246, 1.0206, 1.0157, 1.0121, 1.0213, 1.0161, 1.0113, 1.0075, 1.0108, 1.0067, 1.0049, 1.0036];
  
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
        return (renArray[idx*4]*this.pumpedHydroShare[idx*4] + this.otherRenewables)  / el;
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
