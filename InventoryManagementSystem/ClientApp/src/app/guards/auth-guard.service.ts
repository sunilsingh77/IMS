import { Injectable } from '@angular/core';
import { AccountService } from '../services/account.service';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { take, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthGuardService implements CanActivate {

  constructor(private acct: AccountService, private router: Router) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    return this.acct.isLoggesIn.pipe(take(1), map((loginStatus: boolean) => {
      const destination: string = state.url;
      const productId = route.params.id;

      // To check if user is not logged in
      if (!loginStatus) {
        this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });

        return false;
      }
      
      // if the user is already logged in
      switch (destination) {
        case '/products':
        case '/products/' + productId: {            
              return true;            
          }
        case '/products/update': {            
              return true;            
        }        
        // tslint:disable-next-line:no-switch-case-fall-through
        default:
          return false;
      }

    }));
  }
}
