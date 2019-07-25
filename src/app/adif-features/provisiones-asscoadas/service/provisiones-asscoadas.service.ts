import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs/internal/Observable';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/internal/operators/map';
import { PageQuery } from '../../../shared/adif-data-table/data-table/data-table.component';

export interface Budget {
  codigo_sap_expediente: string;
  cod_sociedad: string;
}

export interface ProvisionesAsscodas {
  id?: number;
  periodo_certificacion: string;
  fecha_cierre: string;
  tstamp?: number;
}

export interface ProvisionesContent {
  content: ProvisionesAsscodas[];
  numberOfElements: number;
  totalElements: number;
}

export interface SearchProvisiones {
  date: string;
  page: number;
  size: number;
}

@Injectable({
  providedIn: 'root'
})
export class ProvisionesAsscoadasService {
  userSelection: ProvisionesAsscodas;
  private readonly allActionsUri = '/adif/contables';
  private readonly searchUri = '/adif/contables/search';
  private readonly searchCodigoUri = '/adif/codigo/search/';
  constructor(
    private http: HttpClient
  ) { }

  userSelectedRow(row) {
    this.userSelection = row;
  }

  getUserSelection() {
    return this.userSelection;
  }

  findAll(pageQuery: PageQuery): Observable<ProvisionesContent> {
    return this.http.get<ProvisionesContent>(this.allActionsUri + '/' + pageQuery.pageIndex + '/' + pageQuery.pageSize);
  }

  searchCodigo(search): Observable<Budget> {
    return this.http.get<Budget>(this.searchCodigoUri + search);
  }

  searchWithDate(data: SearchProvisiones): Observable<ProvisionesContent> {
    return this.http.post<ProvisionesContent>(this.searchUri, data);
  }

  delete(data: ProvisionesAsscodas): Observable<any> {
    return this.http.delete(this.allActionsUri + '/' + data.tstamp);
  }
}
