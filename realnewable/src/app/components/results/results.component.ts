import { Component, OnInit } from '@angular/core';
import { EnergydataService } from '../../services/energydata.service';

@Component({
  selector: 'app-results',
  templateUrl: './results.component.html',
  styleUrls: ['./results.component.css']
})
export class ResultsComponent implements OnInit {
  results = {};
  resultsSmard = {};

  constructor(private energyDataService: EnergydataService) { }

  ngOnInit() {
    this.results = this.energyDataService.getData();  
    this.resultsSmard = this.energyDataService.getDataSmard();
  }
}
