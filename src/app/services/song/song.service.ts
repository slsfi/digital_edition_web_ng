import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { config } from "src/app/services/config/config";

@Injectable()
export class SongService {
  textCache: any;

  constructor(
    private http: HttpClient
  ) {}

  getSongs(): Observable<any> {
    return this.http.get('assets/fsfd_songs_example.json');
  }

  getSongsByCategory(category: any): Observable<any> {
    return this.http.get(
      config.app.apiEndpoint +
        '/' +
        config.app.machineName +
        `/songs/category/${category}`
    );
  }

  getSongsFiltered(filters: any): Observable<any> {
    return this.http.get(
      config.app.apiEndpoint +
        '/' +
        config.app.machineName +
        '/songs/filtered',
      { params: filters }
    );
  }

  getSong(file_name: string): Observable<any> {
    file_name = String(file_name).toUpperCase();
    return this.http.get(
      config.app.apiEndpoint +
        '/' +
        config.app.machineName +
        `/song/${file_name}`
    );
  }

  getSongById(id: any): Observable<any> {
    id = String(id).toUpperCase();
    return this.http.get(
      config.app.apiEndpoint +
        '/' +
        config.app.machineName +
        `/song/${id}`
    );
  }

  getSongByItemId(itemid: any): Observable<any> {
    return this.http.get(
      config.app.apiEndpoint +
        '/' +
        config.app.machineName +
        `/song/itemid/${itemid}`
    );
  }
}
