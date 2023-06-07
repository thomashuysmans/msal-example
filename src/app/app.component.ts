import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MsalBroadcastService, MsalGuardConfiguration, MsalService, MSAL_GUARD_CONFIG } from '@azure/msal-angular';
import { InteractionStatus, RedirectRequest } from '@azure/msal-browser';
import { Subject, timer } from 'rxjs';
import { filter, takeUntil, tap } from 'rxjs/operators';
import { SessionExpirationService } from './services/session-expiration.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'Angular 14 - MSAL v2 Quickstart Sample';
  isIframe = false;
  loginDisplay = false;
  sessionTimeRemaining = 0;
  private readonly _destroying$ = new Subject<void>();

  constructor(
    @Inject(MSAL_GUARD_CONFIG) private msalGuardConfig: MsalGuardConfiguration,
    private authService: MsalService,
    private msalBroadcastService: MsalBroadcastService,
    private expirationService: SessionExpirationService
  ) { }

  ngOnInit(): void {
    this.isIframe = window !== window.parent && !window.opener;

    this.msalBroadcastService.inProgress$
      .pipe(
        tap((status: InteractionStatus) => console.log('status', status)),
        filter((status: InteractionStatus) => status === InteractionStatus.None),
        takeUntil(this._destroying$)
      )
      .subscribe((status: InteractionStatus) => {
        this.setLoginDisplay();
        if (this.loginDisplay)
          this.expirationService.newTokenReceived();
      });

      const expirationCheck = timer(1000,1000);    
      expirationCheck.subscribe(t => { 
          if (!this.loginDisplay) return;
          if (!this.expirationService.sessionCanExpire) return;
          this.sessionTimeRemaining = this.expirationService.sessionTimeRemaining;
          if (this.sessionTimeRemaining <= 0) {
            this.clearAccountsFromCache();
            const forcePrompt: RedirectRequest = { prompt: 'login', scopes: [''] }
            this.authService.loginRedirect(forcePrompt);
          }
      }); 
  }

  setLoginDisplay() {
    this.loginDisplay = this.authService.instance.getAllAccounts().length > 0;
  }

  login() {
    
      if (this.msalGuardConfig.authRequest) {
        this.authService.loginRedirect({ ...this.msalGuardConfig.authRequest } as RedirectRequest);
      } else {
        this.authService.loginRedirect();
      }
    
  }

  doSomething() {
    window.location.href = '/';
  }

  logout() {
      this.authService.logoutRedirect({
        postLogoutRedirectUri: "/",
      });
  }

  private clearAccountsFromCache() {
    const accounts = this.authService.instance.getAllAccounts();
    for (const account of accounts) {
        this.clearAccountFromCache(account.homeAccountId, localStorage);
        this.clearAccountFromCache(account.homeAccountId, sessionStorage);
    }        
  }

  private clearAccountFromCache(accountID: string, storage: Storage) {
      for (const x in storage) {
          if (x.indexOf(accountID) !== -1) {
              storage.removeItem(x);
          }
      }
  }  

  ngOnDestroy(): void {
    this._destroying$.next(undefined);
    this._destroying$.complete();
  }
}
