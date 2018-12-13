'use strict';

import { Component, OnInit } from '@angular/core';
import { EnergydataService } from '../../services/energydata.service';

import { Result } from '../../models/result';

import {MatExpansionModule} from '@angular/material/expansion';

@Component({
  selector: 'app-results',
  templateUrl: './results.component.html',
  styleUrls: ['./results.component.css']
})
export class ResultsComponent implements OnInit {
  selectedDevice:string = 'Nothing Selected';
  selectedState:string = 'Nothing Selected';
  selectedOperator:string = 'Nothing Selected';
  selectedDay:string = 'today';

  results:Result = {
    won:Object,
    tot:Object,
    sol:Object,
    wof:Object
  };

  renewableArray:Array<number> = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
  totalArray:Array<number> = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];

  shareArray:Array<Number> = [];
  sortedShareArray:Array<Number>;
  rankedShares:Array<Number> = [];

  optimalTime:Number;
  optimum:any = null;
  
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

  tennetShares:Object = {
    // keys need to be strings to match the this.slectedState (space and dash is a problem)
    // Bremen and Lower Saxony have the same values, as Bremen is inside of Lower Saxony, but does not produce renewable energy itself
    'Bavaria': {
      won: 0.11,
      sol: 0.62,
      tot: 0.41
    },
    'Hesse': {
      won: 0.09,
      sol: 0.1,
      tot: 0.1
    },
    'Lower Saxony': {
      won: 0.49,
      sol: 0.19,
      tot: 0.27
    },
    'Bremen': {
      won: 0.49,
      sol: 0.19,
      tot: 0.27
    },
    'Schleswig-Holstein': {
      won: 0.31,
      sol: 0.08,
      tot: 0.1
    }
  }

  // Hourly share of pumped hydro storage in percentage; Position 0 = 0 am!
  // Average of hourly generation of water, biomass and other renewable sources
  otherRenewables:Object = {
    germany: {
      pumpedHydro: [181, 112, 87, 76, 75, 105, 628, 1523, 1964, 1549, 1047, 822, 557, 437, 431, 522, 769, 1514, 1948, 2187, 1725, 1078, 812, 363],
      // Water, biomass, others: 1778 + 4568 + 141
      others:  6487
    },
    tennet: {
      pumpedHydro: [41, 22, 10, 8, 9, 16, 140, 316, 402, 352, 239, 185, 122, 92, 85, 114, 180, 359, 471, 503, 420, 289, 220, 103],
      others: 3072
    },
    transnet: {
      pumpedHydro: [27, 9, 4, 2, 2, 17, 329, 631, 636, 471, 319, 300, 189, 142, 177, 181, 296, 560, 707, 693, 449, 309, 190, 108],
      others: 1004
    },
    amprion: {
      pumpedHydro: [14, 7, 3, 2, 3, 12, 112, 215, 233, 163, 117, 108, 70, 55, 60, 75, 120, 216, 272, 266, 183, 119, 84, 57],
      others: 1142
    },
    hertz: {
      pumpedHydro: [91, 79, 71, 68, 71, 91, 256, 561, 632, 478, 303, 214, 157, 133, 139, 174, 280, 513, 662, 719, 522, 338, 220, 169],
      others: 1268
    }
  }
 
  constructor(private energyDataService: EnergydataService) { }
  
  ngOnInit() {
    this.selectedDevice = this.energyDataService.selectedDevice;
    this.selectedState = this.energyDataService.selectedState;
    this.selectedDay = this.energyDataService.selectedDay;
    
    this.calculateOptimum(this.findOperator())
    .then(results => this.getRenewableShare(results))
    .then(() => this.calculateShare(this.renewableArray, this.totalArray))
    .then(shares => this.sortShares(shares))
    .then(rankedShares => this.findOptimumToday(rankedShares))
  }

  // Find the corresponding operator to the area
  findOperator(){
    let index = 0;
    for(let key in this.areaCodes) {
      if(this.areaCodes[key].indexOf(this.selectedState) >= 0){
        this.selectedOperator = key;
        return key;
      } 
      else if (index < 4) {
        index++;
      } else if (index === 4){
        console.log('Error: State not found.')
      }
    }
  }
  
  // Get the data for all generationtypes and save the results in one object
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
    // check, whether the selected state is part of the tennet area, as it needs a special seperation of the renewable energy sources
    if(this.areaCodes.tennet.indexOf(this.selectedState) > -1){
      this.tennetDistribution(object);
    } else {
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
}

// split of solar and wind as tennet is covering north and south of germany
tennetDistribution(object:Result){
  for(let key in object){
        switch(key){
          case 'sol':
          this.renewableArray = this.renewableArray.map((num:number, idx) => {
            let solarShare = object[key].result[idx] * this.tennetShares[this.selectedState].sol;
            return num + solarShare;
          });
          break;
          case 'won':
          this.renewableArray = this.renewableArray.map((num:number, idx) => {
            let wonShare = object[key].result[idx] * this.tennetShares[this.selectedState].won;
            return num + wonShare;
          });
          break;
          case 'wof':
          // only Lower Saxony is connected to the wind offshore parks in the north sea, which are maintained by TenneT; Bremen is in the middle of Lower Saxony
          if(this.selectedState === 'Lower Saxony' || this.selectedState === 'Bremen'){
            this.renewableArray = this.renewableArray.map((num, idx) => {
              return num + object[key].result[idx];
            });
          }
          break;
          case 'tot':
          this.totalArray = object[key]['result'];
          break;
          default:
            console.log('Sorry we did not find anything for: ', key);
        } 
      } 
}


  calculateShare(renArray, totArray) {
    let otherRenewables = this.otherRenewables[this.selectedOperator].others;
    let pumpedHydroArray = this.otherRenewables[this.selectedOperator].pumpedHydro;
    if(this.selectedOperator != 'tennet'){
      this.shareArray = totArray.map((el, idx) => {
        // every 4th element, as the resolution of the renewable data is quarterhours --> renArray.length === 96
        // PumpedHydroShare is added, as average percentile over the last two years; OtherRenewables are added as fixed values (minimal deviation from average); source: "2018-10-25 Generated Power Analysis" --> (c) Bundesnetzagentur | SMARD.de
        return ((renArray[idx*4] + otherRenewables + pumpedHydroArray[idx]) / el);
      })
    } else if(this.selectedOperator === 'tennet'){
      console.log(this.tennetShares[this.selectedState].tot);
      this.shareArray = totArray.map((el, idx) => {
        // Adding only the share of other renewables of the total generation: 1 - (this.spareArray[idx*4]/el)
        return ((renArray[idx*4] + ((otherRenewables + pumpedHydroArray[idx]) * this.tennetShares[this.selectedState].tot) ) / (el * this.tennetShares[this.selectedState].tot));
      })
    }
    console.log('Renewable Array: ', renArray, 'Total Array: ', totArray, 'Share Array: ', this.shareArray);
      return this.shareArray;
  }


  // Sorting the array of shares (first element: highest share)
  sortShares(shaArray) {
    // populate array from sharesArray to sort it descending
    this.sortedShareArray = shaArray.slice();
    this.sortedShareArray.sort((a:number, b:number) => {return b-a});
    // find the indexes of the sorted values in the original array
    for(let i = 0; i< this.sortedShareArray.length; i++){
      this.rankedShares.push(shaArray.indexOf(this.sortedShareArray[i]));
    }
    // saves hours with the highest shares during the day in a descending order
    return this.rankedShares;
  }
       
  // Find the optimum for today, after now
  findOptimumToday(rankedSharesArray){
    let now = new Date().getHours();
    if(this.selectedDay === 'today'){
      // Finds the first element bigger than the current hour
      this.optimum = rankedSharesArray.find(el => {
        return el >= now; 
      })
    }
    else{
      return this.optimum = rankedSharesArray[0];
    }

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
