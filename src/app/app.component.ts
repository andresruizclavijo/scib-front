import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { RouterOutlet } from '@angular/router';
import {
  DataTableComponent,
  TableConfig,
} from './shared/components/data-table/data-table.component';
import { SharedModule } from './shared/shared.module';
import { PeopleService, Person } from './people.service';
import { MatSnackBar } from '@angular/material/snack-bar';

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
    const form: any = {};
    this.userFields.forEach(
      (field) => (form[field.name] = ['', field.validators])
    );
    this.userForm = this.fb.group(form);
  }

  private showSnackBar(message: string): void {
    this.snack.open(message, 'Accept');
  }

  private showError(err: any): void {
    console.error(err);
  }

  private listData(): void {
    this.peopleService.list().subscribe({
      next: (response) => (this.tableData = response),
      error: (err) => this.showError(err),
    });
  }

  private isExcelFile(file: File): boolean {
    return (
      file.type ===
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      file.type === 'application/vnd.ms-excel'
    );
  }

  ngOnInit(): void {
    this.listData();
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
  }

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

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      const file = input.files[0];
      if (this.isExcelFile(file)) {
        this.selectedFile = file;
      }
    }
  }

  onSubmit() {
    if (this.userForm.valid && this.selectedFile) {
      const values = this.userForm.value;
      const person: Person = { name: values.name, surname: values.surname };

      this.peopleService
        .createPersonWithFile(person, this.selectedFile)
        .subscribe({
          next: () => {
            this.listData();
            this.userForm.reset();
            this.selectedFile = null;
            // TODO: clean form inputs
          },
          error: (err) => this.showError(err),
          complete: () => this.showSnackBar('The person has been saved'),
        });
    }
  }

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
