import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { config } from "src/app/services/config/config";

@Injectable()
export class OccurrenceService {
  constructor(
    private http: HttpClient
  ) {}

  getOccurences(object_type: string, id: string): Observable<any> {
    return this.http.get(
      config.app.apiEndpoint +
        '/occurrences/' +
        object_type +
        '/' +
        id
    );
  }

  getMediaData(object_type: string, id: string): Observable<any> {
    return this.http.get(
      config.app.apiEndpoint +
        '/' +
        config.app.machineName +
        '/media/data/' +
        object_type +
        '/' +
        id
    );
  }

  getGalleryOccurrences(type: any, id: any) {
    return this.http.get(
      config.app.apiEndpoint +
        '/' +
        config.app.machineName +
        '/gallery/' +
        type +
        '/connections/' +
        id +
        '/1'
    );
  }

  getArticleData(object_type: string, id: string): Observable<any> {
    return this.http.get(
      config.app.apiEndpoint +
        '/' +
        config.app.machineName +
        '/media/articles/' +
        object_type +
        '/' +
        id
    );
  }
}
