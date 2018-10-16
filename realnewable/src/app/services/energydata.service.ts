import { Injectable } from '@angular/core';

import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class EnergydataService {

  constructor(private http: HttpClient) {


   }
// Get Data from entsoe-api
// To-Do: either https localhost or deploy for testing on heroku with https (needed: dot.env for security token)
   getData(){
     return this.http.get('https://transparency.entsoe.eu/api?securityToken=INSERT-SECURITY-TOKEN&documentType=A69&processType=A01&psrType=B16&in_Domain=10YDE-EON------1&periodStart=201810150000&periodEnd=201910150000')
      .subscribe(data => {
        console.log(data)
      },
      error => console.log("Error: " + error.message));
   }
}
