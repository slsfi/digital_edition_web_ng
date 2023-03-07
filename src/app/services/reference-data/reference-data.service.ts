import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { config } from "src/app/services/config/config";

@Injectable()
export class ReferenceDataService {
  private referenceDataUrl = '/urn/';
  private urnResolverUrl: string;
  textCache: any;

  constructor(
    private http: HttpClient
  ) {
    this.urnResolverUrl = config.urnResolverUrl ?? 'https://urn.fi/';
  }

  getReferenceData(id: string): Observable<any> {
    id = encodeURI(encodeURIComponent(id));
    // We need to doulbe encode the URL for the API
    return this.http.get(
      config.app.apiEndpoint +
        '/' +
        config.app.machineName +
        this.referenceDataUrl +
        id +
        '/'
    );
  }

  public getUrnResolverUrl() {
    return this.urnResolverUrl;
  }
}
