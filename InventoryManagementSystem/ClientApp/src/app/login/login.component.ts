import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { AccountService } from '../services/account.service';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
    
  insertForm: FormGroup;
  Username: FormControl;
  Password: FormControl;
  returnUrl: string;
  ErrorMessage: string;
  invalidLogin: boolean;
  

  constructor(private acct: AccountService,
    private router: Router,
    private route: ActivatedRoute,
    private fb: FormBuilder) { }

  ngOnInit() {
    this.Username = new FormControl('', [Validators.required]);
    this.Password = new FormControl('', [Validators.required]);

    // get return URL or /
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';

    // Intialize formGroup by using FormBuilder
    this.insertForm = this.fb.group({
      'Username': this.Username,
      'Password': this.Password
    });
  }
  onSubmit() {
    const userlogin = this.insertForm.value;

    this.acct.login(userlogin.Username, userlogin.Password).subscribe(result => {

      const token = (<any>result).authToken.token;
      console.log(token);
      console.log('User Logged In Successfully');
      this.invalidLogin = false;
      console.log(this.returnUrl);
      this.router.navigateByUrl(this.returnUrl);

    },
      error => {
        this.invalidLogin = true;        
        this.ErrorMessage = "Please provide valid Username/Password!";
        console.log(this.ErrorMessage);
      });
  }
    
}
