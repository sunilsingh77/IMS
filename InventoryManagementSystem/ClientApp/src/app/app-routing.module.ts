import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { AccessDeniedComponent } from './errors/access-denied/access-denied.component';
import { AuthGuardService } from './guards/auth-guard.service';
import { NotFoundPageComponent } from './not-found-page/not-found-page.component';


const routes: Routes = [
  { path: '', redirectTo: 'products', pathMatch: 'full'},
  { path: 'home', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'access-denied', component: AccessDeniedComponent },
  { path: 'products', loadChildren: './products/products.module#ProductsModule' },
  { path: '**', component: NotFoundPageComponent }
];

@NgModule({
  declarations: [],
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
