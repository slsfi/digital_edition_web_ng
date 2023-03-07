import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { config } from "src/app/services/config/config";

@Injectable()
export class DigitalEditionListService {
  private digitalEditionsUrl = '/collections';

  constructor(
    private http: HttpClient
  ) {}

  getDigitalEditions(): Observable<any> {
    return this.http.get(
      config.app.apiEndpoint +
        '/' +
        config.app.machineName +
        this.digitalEditionsUrl
    );
  }

  async getDigitalEditionsPromise(): Promise<any> {
    try {
      const response = await fetch(
        config.app.apiEndpoint +
          '/' +
          config.app.machineName +
          this.digitalEditionsUrl
      );
      return response.json();
    } catch (e) {}
  }

  getCollectionsFromAssets(): Observable<any> {
    return this.http.get('assets/collections.json');
  }
}
