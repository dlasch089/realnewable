import { Injectable } from '@angular/core';

import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class EnergydataService {

  constructor(private http: HttpClient) {}

// Get Data from entsoe-api
// To-Do: either https localhost or deploy for testing on heroku with https (needed: dot.env for security token)
   getData(){
     return this.http.get('http://localhost:3000/forecast/total-generation/germany')
      // .subscribe(data => {
      //   console.log(data);
      //   return data;
      // },
      // error => console.log("Error: " + error.message));
   }




  //  Data from "Bundesnetzagentur | SMARD.de" under § 111d EnWG licence
  // energyCat describes the energy categories, see codes in the results component
  // _DE_hour describes the area and the resolution (also possible: quarterhour)
  // sundayTime is used, as the timeseries always starts and ends at sunday midnight (give attention to timezone)
  //  getDataSmard(sundayTime, energyCat){
  //    return this.http.get('https://www.smard.de/app/chart_data/' + energyCat + '/DE/' + energyCat + '_DE_hour_' + sundayTime + '.json')
  //     // .subscribe(data => console.log(data));
  //  }
}
