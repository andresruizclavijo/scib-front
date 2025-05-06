import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ApiService, ApiConfig } from './shared/api.service';

export interface Person {
  id?: number;
  name: string;
  surname: string;
  excel?: File;
}

@Injectable({
  providedIn: 'root',
})
export class PeopleService extends ApiService<Person> {
  constructor(http: HttpClient) {
    super(http);
    this.setConfig({ basePath: '/people' });
  }

  createPersonWithFile(person: Person, file: File) {
    const formData = new FormData();
    formData.append('name', person.name);
    formData.append('surname', person.surname);
    formData.append('excel', file);

    return this.postFormData(formData);
  }
}
