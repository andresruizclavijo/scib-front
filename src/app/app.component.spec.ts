import { CommonModule } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RouterOutlet } from '@angular/router';
import { of, throwError } from 'rxjs';
import { AppComponent } from './app.component';
import { PeopleService, Person } from './people.service';
import { SharedModule } from './shared/shared.module';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let peopleService: jest.Mocked<PeopleService>;
  let snackBar: jest.Mocked<MatSnackBar>;

  const mockPerson: Person = {
    name: 'John',
    surname: 'Doe',
  };

  const mockTableData = [
    {
      id: 1,
      name: 'John',
      surname: 'Doe',
      seniority: 'Senior',
      yearsOfExperience: 5,
      availability: true,
    },
  ];

  beforeEach(async () => {
    const peopleServiceMock = {
      list: jest.fn().mockReturnValue(of(mockTableData)),
      createPersonWithFile: jest.fn(),
      delete: jest.fn(),
    } as unknown as jest.Mocked<PeopleService>;

    const snackBarMock = {
      open: jest.fn(),
    } as unknown as jest.Mocked<MatSnackBar>;

    await TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        CommonModule,
        SharedModule,
        RouterOutlet,
        AppComponent,
      ],
      providers: [
        FormBuilder,
        { provide: PeopleService, useValue: peopleServiceMock },
        { provide: MatSnackBar, useValue: snackBarMock },
      ],
    }).compileComponents();

    peopleService = TestBed.inject(PeopleService) as jest.Mocked<PeopleService>;
    snackBar = TestBed.inject(MatSnackBar) as jest.Mocked<MatSnackBar>;
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Form Initialization', () => {
    it('should initialize form with correct fields', () => {
      expect(component.userForm).toBeTruthy();
      expect(component.userForm.get('name')).toBeTruthy();
      expect(component.userForm.get('surname')).toBeTruthy();
    });

    it('should have required validators on form fields', () => {
      const nameControl = component.userForm.get('name');
      const surnameControl = component.userForm.get('surname');

      nameControl?.setValue('');
      surnameControl?.setValue('');

      expect(nameControl?.valid).toBeFalsy();
      expect(surnameControl?.valid).toBeFalsy();
      expect(nameControl?.errors?.['required']).toBeTruthy();
      expect(surnameControl?.errors?.['required']).toBeTruthy();
    });
  });

  describe('File Handling', () => {
    it('should handle drag over event', () => {
      const event = {
        preventDefault: jest.fn(),
        stopPropagation: jest.fn(),
      } as unknown as DragEvent;
      component.onDragOver(event);
      expect(component.isDragging).toBe(true);
      expect(event.preventDefault).toHaveBeenCalled();
      expect(event.stopPropagation).toHaveBeenCalled();
    });

    it('should handle drag leave event', () => {
      const event = {
        preventDefault: jest.fn(),
        stopPropagation: jest.fn(),
      } as unknown as DragEvent;
      component.onDragLeave(event);
      expect(component.isDragging).toBe(false);
      expect(event.preventDefault).toHaveBeenCalled();
      expect(event.stopPropagation).toHaveBeenCalled();
    });

    it('should accept Excel files on drop', () => {
      const file = new File([''], 'test.xlsx', {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const event = {
        preventDefault: jest.fn(),
        stopPropagation: jest.fn(),
        dataTransfer: { files: [file] },
      } as unknown as DragEvent;

      component.onDrop(event);
      expect(component.selectedFile).toBe(file);
      expect(event.preventDefault).toHaveBeenCalled();
      expect(event.stopPropagation).toHaveBeenCalled();
    });

    it('should not accept non-Excel files on drop', () => {
      const file = new File([''], 'test.txt', { type: 'text/plain' });
      const event = {
        preventDefault: jest.fn(),
        stopPropagation: jest.fn(),
        dataTransfer: { files: [file] },
      } as unknown as DragEvent;

      component.onDrop(event);
      expect(component.selectedFile).toBeNull();
      expect(event.preventDefault).toHaveBeenCalled();
      expect(event.stopPropagation).toHaveBeenCalled();
    });
  });

  describe('Form Submission', () => {
    it('should not submit form with invalid data', () => {
      component.userForm.patchValue({ name: '', surname: '' });
      component.onSubmit();
      expect(peopleService.createPersonWithFile).not.toHaveBeenCalled();
    });
  });

  describe('Data Listing', () => {
    it('should load data on initialization', () => {
      component.ngOnInit();
      expect(component.tableData).toEqual(mockTableData);
      expect(peopleService.list).toHaveBeenCalled();
    });

    it('should handle error when loading data', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      peopleService.list.mockReturnValue(
        throwError(() => new Error('Test error'))
      );
      component.ngOnInit();
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });
});
