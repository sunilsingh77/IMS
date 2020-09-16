import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { AccountService } from '../services/account.service';
import { ProductService } from '../services/product.service';

@Component({
  selector: 'app-nav-menu',
  templateUrl: './nav-menu.component.html',
  styleUrls: ['./nav-menu.component.css']
})
export class NavMenuComponent implements OnInit {
  isExpanded = false;
  constructor(private acct: AccountService, private productservice:  ProductService) { }

  LoginStatus$: Observable<boolean>;

  UserName$: Observable<string>;


  ngOnInit() {
    this.LoginStatus$ = this.acct.isLoggesIn;
    this.UserName$ = this.acct.currentUserName;
  }

  onLogout() {
    this.productservice.clearCache();
    this.acct.logout();
  }
}
