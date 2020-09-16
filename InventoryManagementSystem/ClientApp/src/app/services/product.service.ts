import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Product } from '../interfaces/product';
import { Observable } from 'rxjs';
import { shareReplay, flatMap, first } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  constructor(private http: HttpClient) { }

  private baseUrl = '/api/products/getproducts';

  private productUrl = '/api/products/addproduct';

  private deleteUrl = '/api/products/deleteproduct/';

  private updateUrl = '/api/products/updateproduct/';

  private product$: Observable<Product[]>;

  getProducts(): Observable<Product[]> {
    if (!this.product$) {      
      this.product$ = this.http.get<Product[]>(this.baseUrl).pipe(shareReplay());
    }

    // if products cache exists return it
    return this.product$;
  }

  // Get Product by its ID
  getProductById(id: number): Observable<Product> {
    return this.getProducts().pipe(flatMap(result => result), first(product => product.productId === id));
  }

  // Insert the Product
  insertProduct(newProduct: Product): Observable<Product> {
    
    let newOne = {
      'productId': 0,
      'name': newProduct.name,
      'price': Number(newProduct.price),
      'description': newProduct.description,
      'imageUrl': newProduct.imageUrl,
      'outOfStock': true,
    };

    //let pro = <Product>(newOne);
    return this.http.post<Product>(this.productUrl, newOne);
  }

  // Update the Product
  updateProduct(id: number, editProduct: Product): Observable<Product> {    
    return this.http.put<Product>(this.updateUrl + id, editProduct);
  }

  // Delete Product
  deleteProduct(id: number): Observable<any> {
    return this.http.delete(this.deleteUrl + id);
  }

  // Clear Cache
  clearCache() {
    this.product$ = null;
  }
}
