import { TestBed } from '@angular/core/testing';

import { RecommendedproductService } from './recommendedproduct.service';

describe('RecommendedproductService', () => {
  let service: RecommendedproductService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RecommendedproductService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
