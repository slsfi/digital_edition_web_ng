import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subscription } from 'rxjs';
import { LanguageService } from '../languages/language.service';
import { config } from "src/app/services/config/config";

@Injectable()
export class TableOfContentsService {
  private tableOfContentsUrl = '/toc/'; // plus an id...
  private lang = 'sv';
  private multilingualTOC = false;
  languageSubscription?: Subscription;
  apiEndpoint: string;

  constructor(
    private languageService: LanguageService,
    private http: HttpClient
  ) {
    this.apiEndpoint = config.app?.apiEndpoint ?? '';
    try {
      const simpleApi = config.app?.simpleApi ?? '';
      if (simpleApi) {
        this.apiEndpoint = simpleApi as string;
      }
    } catch (e) {}

    try {
      const multilingualTOC = config.i18n?.multilingualTOC ?? false;
      if (multilingualTOC) {
        this.multilingualTOC = multilingualTOC;

        this.languageSubscription = this.languageService
          .languageSubjectChange()
          .subscribe((lang: any) => {
            if (lang) {
              this.lang = lang;
            }
          });
      }
    } catch (e) {}
  }

  // TODO ngOnDestroy change to angular
  ngOnDestroy() {
    if (this.languageSubscription) {
      this.languageSubscription.unsubscribe();
    }
  }

  getToc(): Observable<any> {
    return this.http.get('assets/toc-example.json');
  }

  getTableOfContents(id: string): Observable<any> {
    let url =
      this.apiEndpoint +
      '/' +
      config.app.machineName +
      this.tableOfContentsUrl +
      id;

    if (this.multilingualTOC) {
      url += '/' + this.lang;
    }

    return this.http.get(url);
  }

  getTableOfContentsRoot(id: string): Observable<any> {
    return this.getTableOfContents(id);
  }

  getTableOfContentsGroup(id: string, group_id: string): Observable<any> {
    // @TODO add multilingual support to this as well...
    return this.http.get(
      config.app.apiEndpoint +
        '/' +
        config.app.machineName +
        this.tableOfContentsUrl +
        id +
        '/group/' +
        group_id
    );
  }

  getPrevNext(id: string): Observable<any> {
    // @TODO add multilingual support to this as well...
    const arr = id.split('_');
    const ed_id = arr[0];
    const item_id = arr[1];
    return this.http.get(
      config.app.apiEndpoint +
        '/' +
        config.app.machineName +
        this.tableOfContentsUrl +
        ed_id +
        '/prevnext/' +
        item_id
    );
  }

  getFirst(collectionID: string): Observable<any> {
    // @TODO add multilingual support to this as well...
    return this.http.get(
      config.app.apiEndpoint +
        '/' +
        config.app.machineName +
        this.tableOfContentsUrl +
        collectionID +
        '/first'
    );
  }
}
