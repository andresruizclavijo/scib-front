// Angular imports
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';

// Third-party libraries imports
import { Observable } from 'rxjs';

// Environment import
import { environment } from '../../environments/environment';

export interface ApiConfig {
  basePath: string;
}

@Injectable({
  providedIn: 'root',
})
export class ApiService<T> {
  private apiUrl: string = environment.apiUrl;
  private basePath: string = '';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({ 'Content-Type': 'application/json' });
  }

  private getFullPath(endpoint?: string): string {
    return `${this.basePath}${endpoint ?? ''}`;
  }

  setConfig(config: ApiConfig) {
    this.basePath = config.basePath;
  }

  list(endpoint?: string, params?: HttpParams): Observable<T[]> {
    return this.http.get<T[]>(`${this.apiUrl}${this.getFullPath(endpoint)}`, {
      headers: this.getHeaders(),
      params,
    });
  }

  get(endpoint: string, params?: HttpParams): Observable<T> {
    return this.http.get<T>(`${this.apiUrl}${this.getFullPath(endpoint)}`, {
      headers: this.getHeaders(),
      params,
    });
  }

  post(endpoint: string, body: any): Observable<T> {
    return this.http.post<T>(
      `${this.apiUrl}${this.getFullPath(endpoint)}`,
      body,
      {
        headers: this.getHeaders(),
      }
    );
  }

  postFormData(formData: FormData, endpoint?: string): Observable<T> {
    return this.http.post<T>(
      `${this.apiUrl}${this.getFullPath(endpoint)}`,
      formData
    );
  }

  put(endpoint: string, body: any): Observable<T> {
    return this.http.put<T>(
      `${this.apiUrl}${this.getFullPath(endpoint)}`,
      body,
      {
        headers: this.getHeaders(),
      }
    );
  }

  delete(id: string | number, endpoint?: string): Observable<T> {
    return this.http.delete<T>(
      `${this.apiUrl}${this.getFullPath(endpoint)}/${id}`,
      { headers: this.getHeaders() }
    );
  }

  patch(endpoint: string, body: any): Observable<T> {
    return this.http.patch<T>(
      `${this.apiUrl}${this.getFullPath(endpoint)}`,
      body,
      { headers: this.getHeaders() }
    );
  }
}
