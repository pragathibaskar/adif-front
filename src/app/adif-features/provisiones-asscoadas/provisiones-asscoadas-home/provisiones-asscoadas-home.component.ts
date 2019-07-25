import { Component, OnInit, ViewChild, HostListener } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable, Subject } from 'rxjs';
import { FormBuilder, FormGroup } from '@angular/forms';
import { takeUntil, distinctUntilChanged, debounceTime, tap, switchMap } from 'rxjs/internal/operators';
import { ProvisionesDatasource } from '../service/provisiones.datasource';
import { ProvisionesAsscoadasService,
        SearchProvisiones,
        ProvisionesContent,
        ProvisionesAsscodas } from '../service/provisiones-asscoadas.service';
import { DataTableComponent, PageQuery } from '../../../shared/adif-data-table/data-table/data-table.component';
import { HttpErrorResponse } from '@angular/common/http';
import { NotificationService } from '../../../shared/notification/notification.service';
import { TranslationES } from '../../../shared/translation/translate_es';

@Component({
  selector: 'adif-provisiones-asscoadas-home',
  templateUrl: './provisiones-asscoadas-home.component.html',
  styleUrls: ['./provisiones-asscoadas-home.component.scss']
})
export class ProvisionesAsscoadasHomeComponent implements OnInit {
  private readonly debounceTimeInMillis = 300;
  dataSourceSelected = false;
  private initialPage: PageQuery = {
    pageIndex: 0, pageSize: 5
  };
  private unsubscribe = new Subject();
  datalength: number;
  provisionesSearch;
  provisionesSearchForm: FormGroup;
  @ViewChild(DataTableComponent) dataTab: DataTableComponent;
  dataTableSource: Observable<ProvisionesAsscodas[]>;
  dataSource: ProvisionesDatasource;
  loading = false;
  columnsToDisplay = ['radio', 'periodo_certificacion', 'fecha_cierre'];
  columnsParams = {periodo_certificacion: 'Periodo Certificacion', fecha_cierre: 'Fecha Cierre'};
  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private provisionesAsscoadasService: ProvisionesAsscoadasService,
    private notificationService: NotificationService
  ) {
    this.provisionesSearchForm = formBuilder.group({
      provisionesSearch: ''
    });
    this.provisionesSearch = this.provisionesSearchForm.get('provisionesSearch');
    this.provisionesSearch.valueChanges
    .pipe(
        takeUntil(this.unsubscribe),
        debounceTime(this.debounceTimeInMillis),
        distinctUntilChanged(),
        switchMap(searchValue => {
          this.loading = true;
          return this.search({
            date: searchValue.toString(),
            page: this.initialPage.pageIndex,
            size: this.initialPage.pageSize
          });
        })
      )
      .subscribe((data: ProvisionesContent) => {
        this.dataTab.paginator.firstPage();
        this.dataSource.loadProvisionesData(data.content);
        this.datalength = data.totalElements;
        this.loading = false;
      }, (error: HttpErrorResponse) => {
        this.loading = false;
        this.notificationService.setNotification(TranslationES.provisiones_contable.sorryForIncovinience);
      });
  }

  ngOnInit() {
    this.dataSource = new ProvisionesDatasource();
    this.loading = true;
    this.addAllDataToSource(this.initialPage, false);
  }

  addAllDataToSource(page: PageQuery, startsWithFirst: boolean) {
    this.provisionesAsscoadasService.findAll(page)
    .subscribe((data: ProvisionesContent) => {
      if (startsWithFirst) {
        this.dataTab.paginator.firstPage();
      }
      this.dataSource.loadProvisionesData(data.content);
      this.datalength = data.totalElements;
      this.loading = false;
    }, (error: HttpErrorResponse) => {
      this.loading = false;
      this.notificationService.setNotification(TranslationES.provisiones_contable.error);
    });
    this.dataTableSource = this.dataSource.getProvisionesData();
  }

  requestPage(pageQuery: PageQuery) {
    this.loading = true;
    if (!this.provisionesSearch.value) {
      this.provisionesAsscoadasService.findAll(pageQuery)
      .subscribe((data: ProvisionesContent) => {
        this.dataSource.loadProvisionesData(data.content);
        this.loading = false;
      }, (error: HttpErrorResponse) => {
        this.loading = false;
        this.notificationService.setNotification(TranslationES.provisiones_contable.sorryForIncovinience);
      });
    } else {
      this.provisionesAsscoadasService.searchWithDate({
        date: this.provisionesSearch.value,
        page: pageQuery.pageIndex,
        size: pageQuery.pageSize
      })
      .subscribe((data: ProvisionesContent) => {
        this.dataSource.loadProvisionesData(data.content);
        this.loading = false;
      }, (error: HttpErrorResponse) => {
        this.loading = false;
        this.notificationService.setNotification(TranslationES.provisiones_contable.sorryForIncovinience);
      });
    }
  }

  private search(search: SearchProvisiones): Observable<ProvisionesContent> {
    return this.provisionesAsscoadasService.searchWithDate(search);
  }

  eventCaptured(event: boolean) {
    if (event) {
      this.dataSourceSelected = true;
    }
  }

  private pagable() {
    return {
      pageIndex: this.dataTab.paginator.pageIndex,
      pageSize: this.dataTab.paginator.pageSize
    };
  }

  delete() {
    if (this.dataTab) {
      this.loading = true;
      const rowData: ProvisionesAsscodas = this.dataTab.selectedRow;
      this.provisionesAsscoadasService.delete(rowData)
      .subscribe(done => {
        this.addAllDataToSource(this.pagable(), false);
        this.notificationService.setNotification(TranslationES.provisiones_contable.delete);
      }, (error: HttpErrorResponse) => {
        this.loading = false;
        this.notificationService.setNotification(TranslationES.provisiones_contable.sorryForIncovinience);
      });
    }
  }

  @HostListener('body:click', ['$event'])
  onclick(event) {
    const ele: HTMLElement = <HTMLElement> event.target;
    const eleClass = ele.parentElement.parentElement;
    if (eleClass && !eleClass.classList.contains('notificationMsg')) {
      this.notificationService.notificationComplete();
    }
  }
}
