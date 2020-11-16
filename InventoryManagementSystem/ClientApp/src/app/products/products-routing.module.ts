import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ProductListComponent } from './product-list/product-list.component';
import { AuthGuardService } from '../guards/auth-guard.service';
import { AddProductComponent } from './add-product/add-product.component';
import { EditProductComponent } from './edit-product/edit-product.component';


const routes: Routes = [
  { path: '', component: ProductListComponent,  canActivate : [AuthGuardService]},
  { path: 'product-list', component: ProductListComponent, canActivate: [AuthGuardService] },
  { path: 'add-product', component: AddProductComponent, canActivate: [AuthGuardService] },
  { path: 'edit-product/:pid', component: EditProductComponent, canActivate: [AuthGuardService] },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProductsRoutingModule { }
