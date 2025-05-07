import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RouterOutlet } from '@angular/router';
import { PeopleService, Person } from './people.service';
import {
  DataTableComponent,
  TableConfig,
} from './shared/components/data-table/data-table.component';
import { SharedModule } from './shared/shared.module';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    ReactiveFormsModule,
    CommonModule,
    SharedModule,
    DataTableComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  providers: [],
})
export class AppComponent implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  title = 'scib-front';
  userForm: FormGroup;
  isDragging = false;
  selectedFile: File | null = null;
  tableColumns = [
    { name: 'name', label: 'Name' },
    { name: 'surname', label: 'Surname' },
    { name: 'seniority', label: 'Seniority' },
    { name: 'yearsOfExperience', label: 'Years of experience' },
    { name: 'availability', label: 'Availability' },
  ];
  tableData: any[] = [];
  tableconfig: TableConfig = {
    paginator: true,
    actionColumn: [{ icon: 'delete', tooltip: 'Delete', name: 'delete' }],
  };

  userFields: {
    name: string;
    placeholder: string;
    errorMsg: string;
    label: string;
    validators: ValidationErrors[];
  }[] = [
    {
      name: 'name',
      placeholder: 'Enter your name',
      errorMsg: 'Name is required',
      label: 'Name',
      validators: [Validators.required],
    },
    {
      name: 'surname',
      placeholder: 'Enter your surname',
      errorMsg: 'Surname is required',
      label: 'Surname',
      validators: [Validators.required],
    },
  ];

  constructor(
    private fb: FormBuilder,
    private peopleService: PeopleService,
    private snack: MatSnackBar
  ) {
    // Dynamically create form controls based on userFields configuration
    const form: any = {};
    this.userFields.forEach(
      (field) => (form[field.name] = ['', field.validators])
    );
    this.userForm = this.fb.group(form);
  }

  /**
   * Displays a snackbar notification to the user
   * @param message The message to display
   */
  private showSnackBar(message: string): void {
    this.snack.open(message, 'Accept');
  }

  /**
   * Handles error logging and potential error display
   * @param err The error object
   */
  private showError(err: any): void {
    console.error(err);
  }

  /**
   * Fetches and updates the people data in the table
   */
  private listData(): void {
    this.peopleService.list().subscribe({
      next: (response) => (this.tableData = response),
      error: (err) => this.showError(err),
    });
  }

  /**
   * Validates if the file is an Excel document
   * @param file The file to validate
   * @returns True if file is an Excel format, false otherwise
   */
  private isExcelFile(file: File): boolean {
    return (
      file.type ===
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      file.type === 'application/vnd.ms-excel'
    );
  }

  /**
   * Initialize component by loading people data
   */
  ngOnInit(): void {
    this.listData();
  }

  /**
   * Handles drag over events for file drop zone
   * @param event The drag event
   */
  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }

  /**
   * Handles drag leave events for file drop zone
   * @param event The drag event
   */
  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
  }

  /**
   * Processes file drop events and validates the file
   * @param event The drop event containing file data
   */
  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;

    if (event.dataTransfer?.files) {
      const file = event.dataTransfer.files[0];
      if (file && this.isExcelFile(file)) {
        this.selectedFile = file;
      }
    }
  }

  /**
   * Handles file selection from the file input element
   * @param event The change event from file input
   */
  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      const file = input.files[0];
      if (this.isExcelFile(file)) {
        this.selectedFile = file;
      }
    }
  }

  /**
   * Submits the form data and uploaded file to create a new person
   * Resets the form and file input after successful submission
   */
  onSubmit() {
    if (this.userForm.valid && this.selectedFile) {
      const values = this.userForm.value;
      const person: Person = { name: values.name, surname: values.surname };

      this.peopleService
        .createPersonWithFile(person, this.selectedFile)
        .subscribe({
          next: () => {
            this.listData();
            this.selectedFile = null;
            this.userForm.reset();
            this.userForm.markAsUntouched();
            this.userForm.markAsPristine();
            if (this.fileInput) {
              this.fileInput.nativeElement.files = null;
              this.fileInput.nativeElement.value = '';
            }
          },
          error: (err) => this.showError(err),
          complete: () => {
            this.showSnackBar('The person has been saved');
          },
        });
    }
  }

  /**
   * Processes actions from the data table (e.g., delete button clicks)
   * @param event Object containing the action type and row data
   */
  handleTableAction(event: { action: string; row: any }): void {
    if (event.action === 'delete') {
      this.peopleService.delete(event.row.id).subscribe({
        next: () => this.listData(),
        error: (err) => this.showError(err),
        complete: () => this.showSnackBar('The person has been deleted'),
      });
    }
  }
}
