import { Injectable } from "@angular/core";
import { from, Observable } from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class SessionExpirationService {

    private tenantSessionExpirationInSeconds = 30;
    private static KEY_TOKEN_RECEIVED = 'token-received';
    public sessionExpired$: Observable<boolean>;
  
    constructor() {
        this.sessionExpired$ = from(Promise.resolve(this.checkIfSessionExpired()));        
    }

    get sessionCanExpire() {
        return this.tenantSessionExpirationInSeconds > 0;
    }

    get sessionTimeRemaining() {
        if (!this.sessionCanExpire) return 0;
        const tokenReceivedString = localStorage.getItem(SessionExpirationService.KEY_TOKEN_RECEIVED);
        if (tokenReceivedString === null) return 0; // not yet logged in
        const tokenReceived = new Date(tokenReceivedString);
        tokenReceived.setSeconds(tokenReceived.getSeconds() + this.tenantSessionExpirationInSeconds);
        const remaining = Math.round((tokenReceived.getTime() - new Date().getTime()) / 1000);  
        return remaining > 0 ? remaining : 0; 
    }

    public newTokenReceived() {
        localStorage.setItem(SessionExpirationService.KEY_TOKEN_RECEIVED, new Date().toUTCString());  
    }

    public checkIfSessionExpired() {
        return this.sessionTimeRemaining <= 0;
    }
}