import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, tap } from 'rxjs';

export interface Product {
  id: number;
  category: string;
  code: string;
  name: string;
  imageUrl: string;
  price: number;
  minQuantity: number;
  discountRate: number;
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = "https://localhost:7265/api/Products";
  private productsSubject = new BehaviorSubject<Product[]>([]);
  products$ = this.productsSubject.asObservable();

  constructor(private http: HttpClient) {}

  loadProducts() {
    return this.http.get<Product[]>(this.apiUrl).pipe(
      tap(products => this.productsSubject.next(products))
    );
  }

  getById(id: number) {
    return this.http.get<Product>(`${this.apiUrl}/${id}`);
  }
}
