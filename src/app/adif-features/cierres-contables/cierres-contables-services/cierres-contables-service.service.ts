import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { map } from 'rxjs/internal/operators/map';
import { environment } from '../../../../environments/environment';
import { BehaviorSubject } from 'rxjs';
import { Notify } from '../../../shared/notification/notification/notification.component';
import { PageQuery } from '../../../shared/adif-data-table/data-table/data-table.component';

export interface CierresContables {
  id?: number;
  periodo_certificacion: string;
  fecha_cierre: string;
  tstamp?: number;
}

export interface ContablesContent {
  content: CierresContables[];
  numberOfElements: number;
  totalElements: number;
}

export interface SearchContable {
  date: string;
  page: number;
  size: number;
}

@Injectable({
  providedIn: 'root'
})
export class CierresContablesServiceService {
  private readonly allActionsUri = '/adif/contables';
  private readonly searchUri = '/adif/contables/search';
  userSelection: CierresContables;
  constructor(
    private http: HttpClient
  ) { }

  userSelectedRow(row) {
    this.userSelection = row;
  }

  getUserSelection() {
    return this.userSelection;
  }

  findAll(pageQuery: PageQuery): Observable<ContablesContent> {
    return this.http.get<ContablesContent>(this.allActionsUri + '/' + pageQuery.pageIndex + '/' + pageQuery.pageSize);
  }

  update(data: CierresContables): Observable<CierresContables> {
    return this.http.put<CierresContables>(this.allActionsUri, {
      periodo_certificacion: data.periodo_certificacion,
      fecha_cierre: data.fecha_cierre
    });
  }

  add(data: CierresContables): Observable<CierresContables> {
    return this.http.post<CierresContables>(this.allActionsUri, {
      periodo_certificacion: data.periodo_certificacion,
      fecha_cierre: data.fecha_cierre
    });
  }

  delete(data: CierresContables): Observable<any> {
    return this.http.delete(this.allActionsUri + '/' + data.tstamp);
  }

  searchWithDate(data: SearchContable): Observable<ContablesContent> {
    return this.http.post<ContablesContent>(this.searchUri, data);
  }

}
