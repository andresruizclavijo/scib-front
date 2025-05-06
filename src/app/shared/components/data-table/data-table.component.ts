import {
  AfterViewInit,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { SharedModule } from '../../shared.module';

export interface TableConfig {
  paginator?: boolean;
  pageSizeOptions?: number[];
  actionColumn?: { icon: string; tooltip: string; name: string }[];
}

@Component({
  selector: 'app-data-table',
  imports: [SharedModule],
  templateUrl: './data-table.component.html',
  styleUrl: './data-table.component.scss',
})
export class DataTableComponent implements OnInit, AfterViewInit, OnChanges {
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  @Input() columns: { name: string; label: string }[] = [];
  @Input() data: any[] = [];
  @Input() config: TableConfig = {};

  @Output() actionClicked = new EventEmitter<{ action: string; row: any }>();

  displayedColumns: string[] = [];
  dataSource = new MatTableDataSource<any>(this.data);

  ngOnInit(): void {
    this.dataSource.data = this.data;
    this.displayedColumns = this.columns.map((column) => column.name);
    if (this.config.actionColumn) {
      this.displayedColumns.push('actions');
    }
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'].currentValue) {
      this.dataSource.data = changes['data'].currentValue;
    }
  }
}
