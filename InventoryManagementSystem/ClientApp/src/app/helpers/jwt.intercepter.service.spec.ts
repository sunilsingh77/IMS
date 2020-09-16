import { TestBed } from '@angular/core/testing';

import { Jwt.IntercepterService } from './jwt.intercepter.service';

describe('Jwt.IntercepterService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: Jwt.IntercepterService = TestBed.get(Jwt.IntercepterService);
    expect(service).toBeTruthy();
  });
});
