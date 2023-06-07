import { TestBed } from '@angular/core/testing';

import { SessionExpirationService } from './session-expiration.service';

describe('SessionExpirationService', () => {
  let service: SessionExpirationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SessionExpirationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
