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
  
  constructor(private energyDataService: EnergydataService) { }
  
  ngOnInit() {
    this.calculateOptimum(this.areaCodes.ger)
    .then(results => {
      this.getRenewableShare(results)
    });
    
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
      console.log(this.renewableArray, this.totalArray);
      return this.renewableArray, this.totalArray;
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
