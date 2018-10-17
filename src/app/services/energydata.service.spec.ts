import { TestBed } from '@angular/core/testing';

import { EnergydataService } from './energydata.service';

describe('EnergydataService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: EnergydataService = TestBed.get(EnergydataService);
    expect(service).toBeTruthy();
  });
});
