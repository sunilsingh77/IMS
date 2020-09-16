import { Component, OnInit, OnDestroy, TemplateRef, ViewChild, ChangeDetectorRef } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Product } from '../../interfaces/product';
import { Observable, Subject } from 'rxjs';
import { ProductService } from '../../services/product.service';
import { Router } from '@angular/router';
import { AccountService } from '../../services/account.service';
import { DataTableDirective } from 'angular-datatables';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css']
})
export class ProductListComponent implements OnInit, OnDestroy {

  // For the FormControl - Adding products
  insertForm: FormGroup;
  name: FormControl;
  price: FormControl;
  quantity: FormControl;
  createdDate: FormControl;

  // Updating the Product
  updateForm: FormGroup;
  _name: FormControl;
  _price: FormControl;
  _quantity: FormControl;
  _id: FormControl;

  // Add Modal
  @ViewChild('template', { static: false }) modal: TemplateRef<any>;

  // Update Modal
  @ViewChild('editTemplate', { static: false }) editmodal: TemplateRef<any>;

  // Modal properties
  modalMessage: string;
  modalRef: BsModalRef;
  selectedProduct: Product;
  products$: Observable<Product[]>;
  products: Product[] = [];  

  // Datatables Properties
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject();

  @ViewChild(DataTableDirective, { static: false }) dtElement: DataTableDirective;

  constructor(private productservice: ProductService,
    private modalService: BsModalService,
    private fb: FormBuilder,
    private chRef: ChangeDetectorRef,
    private router: Router,
    private acct: AccountService) { }

  /// Load Add New product Modal
  onAddProduct() {
    this.modalRef = this.modalService.show(this.modal);
  }

  // Method to Add new Product
  onSubmit() {
    let newProduct = this.insertForm.value;

    this.productservice.insertProduct(newProduct).subscribe(
      result => {
        this.productservice.clearCache();
        this.products$ = this.productservice.getProducts();

        this.products$.subscribe(newlist => {
          this.products = newlist;
          this.modalRef.hide();
          this.insertForm.reset();
          this.rerender();

        });
        console.log('New Product added');
      },
      error => console.log('Could not add Product')
    )
  }

  // We will use this method to destroy old table and re-render new table
  rerender() {
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      // Destroy the table first in the current context
      dtInstance.destroy();

      // Call the dtTrigger to rerender again
      this.dtTrigger.next();

    });
  }

  onAddFormReset() {    
    this.insertForm.reset();
    return false;
  }

  // Update an Existing Product
  onUpdate() {
    let editProduct = this.updateForm.value;
    this.productservice.updateProduct(editProduct.id, editProduct).subscribe(
      result => {
        console.log('Product Updated');
        this.productservice.clearCache();
        this.products$ = this.productservice.getProducts();
        this.products$.subscribe(updatedlist => {
          this.products = updatedlist;
          this.modalRef.hide();
          this.rerender();
        });
      },
      error => console.log('Could Not Update Product')
    )   
  }

  // Load the update Modal
  onUpdateModal(productEdit: Product): void {
    this._id.setValue(productEdit.productId);
    this._name.setValue(productEdit.name);
    this._price.setValue(productEdit.price);
    this._quantity.setValue(productEdit.quantity);    

    this.updateForm.setValue({
      'id': this._id.value,
      'name': this._name.value,
      'price': this._price.value,
      'quantity': this._quantity.value
    });

    this.modalRef = this.modalService.show(this.editmodal);

  }  
  
  ngOnInit() {
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 9,
      autoWidth: true,
      order: [[0, 'desc']]
    };

    this.products$ = this.productservice.getProducts();

    this.products$.subscribe(result => {
      this.products = result;
      this.chRef.detectChanges();
      this.dtTrigger.next();
    });

    // Modal Message
    this.modalMessage = 'All Fields Are Mandatory';

    // Initializing Add product properties

    this.name = new FormControl('', [Validators.required, Validators.maxLength(50)]);
    this.price = new FormControl('', [Validators.required, Validators.pattern('^\\d*$')]);
    this.quantity = new FormControl('', [Validators.required, Validators.pattern('^\\d*$')]);

    this.insertForm = this.fb.group({
      'productId': 0,
      'name': this.name,
      'price': this.price,
      'quantity': this.quantity
    });

    // Initializing Update Product properties
    this._name = new FormControl('', [Validators.required, Validators.maxLength(50)]);
    this._price = new FormControl('', [Validators.required, Validators.pattern('^\\d*$')]);
    this._quantity = new FormControl('', [Validators.required, Validators.pattern('^\\d*$')]);
    this._id = new FormControl();

    this.updateForm = this.fb.group(
      {
        'id': this._id,
        'name': this._name,
        'price': this._price,
        'quantity': this._quantity
      });

    console.log('product.component loaded!')
  }

  ngOnDestroy() {
    // Do not forget to unsubscribe
    this.dtTrigger.unsubscribe();
  }

}
