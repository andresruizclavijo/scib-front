import { HttpClient } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { PeopleService, Person } from './people.service';
import { ApiService } from './shared/api.service';

describe('PeopleService', () => {
  let service: PeopleService;
  let httpClient: jest.Mocked<HttpClient>;
  let apiService: jest.Mocked<ApiService<Person>>;

  const mockPerson: Person = {
    name: 'John',
    surname: 'Doe',
  };

  const mockFile = new File([''], 'test.xlsx', {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });

  beforeEach(() => {
    httpClient = {
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      delete: jest.fn(),
    } as unknown as jest.Mocked<HttpClient>;

    apiService = {
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      delete: jest.fn(),
      postFormData: jest.fn(),
      setConfig: jest.fn(),
    } as unknown as jest.Mocked<ApiService<Person>>;

    service = new PeopleService(httpClient);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should set correct base path on initialization', () => {
    expect(service).toBeInstanceOf(ApiService);
    const mockResponse: Person[] = [{ ...mockPerson, id: 1 }];
    httpClient.get.mockReturnValue(of(mockResponse));
    
    service.list().subscribe(() => {
      const call = httpClient.get.mock.calls[0];
      expect(call[0]).toContain('/people');
    });
  });

  describe('createPersonWithFile', () => {
    it('should create a person with file using FormData', () => {
      const mockResponse: Person = { ...mockPerson, id: 1 };
      const mockFormData = new FormData();
      mockFormData.append('name', mockPerson.name);
      mockFormData.append('surname', mockPerson.surname);
      mockFormData.append('excel', mockFile);

      service.createPersonWithFile = jest.fn().mockReturnValue(of(mockResponse));
      const result = service.createPersonWithFile(mockPerson, mockFile);

      result.subscribe(response => {
        expect(response).toEqual(mockResponse);
        expect(service.createPersonWithFile).toHaveBeenCalledWith(mockPerson, mockFile);
      });
    });

    it('should handle error when creating person with file', () => {
      const error = new Error('Test error');
      service.createPersonWithFile = jest.fn().mockReturnValue(throwError(() => error));

      service.createPersonWithFile(mockPerson, mockFile).subscribe({
        error: (err) => {
          expect(err).toBe(error);
        }
      });
    });
  });

  describe('list', () => {
    it('should return list of people', () => {
      const mockResponse: Person[] = [
        { ...mockPerson, id: 1 },
        { ...mockPerson, id: 2, name: 'Jane' }
      ];

      service.list = jest.fn().mockReturnValue(of(mockResponse));
      const result = service.list();

      result.subscribe(response => {
        expect(response).toEqual(mockResponse);
        expect(service.list).toHaveBeenCalled();
      });
    });

    it('should handle error when listing people', () => {
      const error = new Error('Test error');
      service.list = jest.fn().mockReturnValue(throwError(() => error));

      service.list().subscribe({
        error: (err) => {
          expect(err).toBe(error);
        }
      });
    });
  });

  describe('delete', () => {
    it('should delete a person', () => {
      const personId = 1;
      const mockResponse: Person = { ...mockPerson, id: personId };
      service.delete = jest.fn().mockReturnValue(of(mockResponse));

      service.delete(personId).subscribe(response => {
        expect(response).toEqual(mockResponse);
        expect(service.delete).toHaveBeenCalledWith(personId);
      });
    });

    it('should handle error when deleting person', () => {
      const personId = 1;
      const error = new Error('Test error');
      service.delete = jest.fn().mockReturnValue(throwError(() => error));

      service.delete(personId).subscribe({
        error: (err) => {
          expect(err).toBe(error);
        }
      });
    });
  });
}); 