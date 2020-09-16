import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AccountService {
  // Need HttpClient to communicate over HTTP with Web API
  constructor(private http: HttpClient, private router: Router) { }

  // Url to access our Web API’s
  private baseUrlRegister: string = '/api/account/register';
  // Token Controller
  private baseUrlToken: string = '/api/token/auth';

  // User related properties
  private loginStatus = new BehaviorSubject<boolean>(this.checkLoginStatus());
  private UserName = new BehaviorSubject<string>(localStorage.getItem('username'));
  
  // Register Method
  register(username: string, password: string, email: string) {
    return this.http.post<any>(this.baseUrlRegister, { username, password, email }).pipe(map(result => {
      //registration was successful
      return result;

    }, error => {
      return error;
    }));
  }

  // Method to get new refresh token
  getNewRefreshToken(): Observable<any> {
    let username = localStorage.getItem('username');
    let refreshToken = localStorage.getItem('refreshToken');
    let grantType = 'refresh_token';

    return this.http.post<any>(this.baseUrlToken, { username, refreshToken, grantType }).pipe(

      map(result => {        
        if (result && result.authToken.token) {
          this.loginStatus.next(true);          
          localStorage.setItem('loginStatus', '1');
          localStorage.setItem('jwt', result.authToken.token);
          localStorage.setItem('userame', result.authToken.userName);
          localStorage.setItem('expiration', result.authToken.expiration);          
          localStorage.setItem('refreshToken', result.authToken.refresh_Token);
        }

        return <any>result;

      })
    );

  }

  // Login Method
  login(userName: string, password: string) {
    const grantType = 'password';
    // pipe() let you combine multiple functions into a single function. 
    // pipe() runs the composed functions in sequence.
    return this.http.post<any>(this.baseUrlToken, { userName, password, grantType }).pipe(
      map(result => {

        // login successful if there's a jwt token in the response
        if (result && result.authToken.token) {
          // store user details and jwt token in local storage to keep user logged in between page refreshes

          this.loginStatus.next(true);
          localStorage.setItem('loginStatus', '1');
          localStorage.setItem('jwt', result.authToken.token);
          localStorage.setItem('username', result.authToken.userName);
          localStorage.setItem('expiration', result.authToken.expiration);          
          localStorage.setItem('refreshToken', result.authToken.refresh_Token);
          this.UserName.next(localStorage.getItem('username'));          
        }
        return result;
      })

    );
  }

  logout() {
    // Set Loginstatus to false and delete saved jwt cookie
    this.loginStatus.next(false);
    localStorage.removeItem('jwt');    
    localStorage.removeItem('username');
    localStorage.removeItem('expiration');
    localStorage.setItem('loginStatus', '0');
    this.router.navigate(['/login']);
    console.log("Logged Out Successfully");

  }

  checkLoginStatus(): boolean {

    let loginCookie = localStorage.getItem('loginStatus');

    if (loginCookie === '1') {
      if (localStorage.getItem('jwt') != null || localStorage.getItem('jwt') != undefined) {
        return true;
      }
    }
    return false;
  }

  get isLoggesIn() {
    return this.loginStatus.asObservable();
  }

  get currentUserName() {
    return this.UserName.asObservable();
  }

}
