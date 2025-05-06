import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ApiService } from './api.service';
import { environment } from '../../environments/environment';
import { HttpClientModule, HttpParams } from '@angular/common/http';

interface TestModel {
  id: number;
  name: string;
}

describe('ApiService', () => {
  let service: ApiService<TestModel>;
  let httpMock: HttpTestingController;
  const testBasePath = '/test';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientModule,
        HttpClientTestingModule
      ],
      providers: [
        ApiService,
        { provide: 'BASE_URL', useValue: environment.apiUrl }
      ]
    });

    service = TestBed.inject(ApiService);
    httpMock = TestBed.inject(HttpTestingController);
    service.setConfig({ basePath: testBasePath });
  });

  afterEach(() => {
    httpMock.verify();
  });

  test('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('list', () => {
    test('should make a GET request to list items', () => {
      const testData: TestModel[] = [
        { id: 1, name: 'Test 1' },
        { id: 2, name: 'Test 2' }
      ];

      service.list().subscribe(data => {
        expect(data).toEqual(testData);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}${testBasePath}`);
      expect(req.request.method).toBe('GET');
      req.flush(testData);
    });

    test('should include query params when provided', () => {
      const params = new HttpParams()
        .set('page', '1')
        .set('limit', '10');
      const testData: TestModel[] = [{ id: 1, name: 'Test' }];

      service.list('', params).subscribe(data => {
        expect(data).toEqual(testData);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}${testBasePath}?page=1&limit=10`);
      expect(req.request.method).toBe('GET');
      req.flush(testData);
    });
  });

  describe('get', () => {
    test('should make a GET request to fetch a single item', () => {
      const testData: TestModel = { id: 1, name: 'Test' };
      const endpoint = '/1';

      service.get(endpoint).subscribe(data => {
        expect(data).toEqual(testData);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}${testBasePath}${endpoint}`);
      expect(req.request.method).toBe('GET');
      req.flush(testData);
    });
  });

  describe('post', () => {
    test('should make a POST request with the provided body', () => {
      const testData: TestModel = { id: 1, name: 'Test' };
      const endpoint = '/create';

      service.post(endpoint, testData).subscribe(data => {
        expect(data).toEqual(testData);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}${testBasePath}${endpoint}`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(testData);
      req.flush(testData);
    });
  });

  describe('postFormData', () => {
    test('should make a POST request with FormData', () => {
      const formData = new FormData();
      formData.append('file', new Blob(['test']));
      const testData: TestModel = { id: 1, name: 'Test' };

      service.postFormData(formData).subscribe(data => {
        expect(data).toEqual(testData);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}${testBasePath}`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toBe(formData);
      req.flush(testData);
    });
  });

  describe('put', () => {
    test('should make a PUT request with the provided body', () => {
      const testData: TestModel = { id: 1, name: 'Updated Test' };
      const endpoint = '/1';

      service.put(endpoint, testData).subscribe(data => {
        expect(data).toEqual(testData);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}${testBasePath}${endpoint}`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(testData);
      req.flush(testData);
    });
  });

  describe('delete', () => {
    test('should make a DELETE request for the specified id', () => {
      const id = 1;
      const testData: TestModel = { id, name: 'Test' };

      service.delete(id).subscribe(data => {
        expect(data).toEqual(testData);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}${testBasePath}/${id}`);
      expect(req.request.method).toBe('DELETE');
      req.flush(testData);
    });
  });

  describe('patch', () => {
    test('should make a PATCH request with the provided body', () => {
      const testData: TestModel = { id: 1, name: 'Patched Test' };
      const endpoint = '/1';

      service.patch(endpoint, testData).subscribe(data => {
        expect(data).toEqual(testData);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}${testBasePath}${endpoint}`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual(testData);
      req.flush(testData);
    });
  });
}); 