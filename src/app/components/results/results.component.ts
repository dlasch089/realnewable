import { Component, OnInit } from '@angular/core';
import { EnergydataService } from '../../services/energydata.service';
import { TestComponentRenderer } from '@angular/core/testing';

@Component({
  selector: 'app-results',
  templateUrl: './results.component.html',
  styleUrls: ['./results.component.css']
})
export class ResultsComponent implements OnInit {
  results = {};
  resultsSmard:Object = {};

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
    this.calculateOptimum(this.areaCodes.ger);


    /*
    ONLY NEEDED FOR SMARD-FETCH

    this.getPrognosis(this.prognosisCat);
    */
  }

  // get the data for all generationtypes and save the results in one array
  async calculateOptimum(areaCode){
    for (let key in this.generationTypes){
      this.energyDataService.getData(this.generationTypes[key], areaCode )
      .subscribe(data => {
      console.log('logs:', data);
      return this.results[key] = data;
      });
    }
  }

  // To-Do: (idea: only get 24 element-arrays --> backend)
  // getRenewableShare(object:Object) {
  //   let renewableArray:Array<Number> = [];
  //   let totalArray:Array<Number> = [];
  //   if(object.documentType === 'A69'){
  //     for(let i = 0; i < object.result.length; i += 4) {
  //       renewableArray[i] += object.result[i];
  //     }
  //     } else {

  //     }
  //   }
  // }


  /*

  ONLY NEEDED FOR SMARD-FETCH
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
