import { Injectable } from '@angular/core';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { EventsService } from '../events/events.service';
import { StorageService } from '../storage/storage.service';
import { config } from "src/app/services/config/config";

@Injectable()
export class LanguageService {

  private _language: string | null = null;
  private _langChangeEnabled: boolean;
  private _availableLanguages: Array<string>;
  private _defaultLanguage: string;
  private languageSubject: BehaviorSubject<string>;

  constructor(
    public translate: TranslateService,
    public storage: StorageService,
    private events: EventsService
  ) {
    this._langChangeEnabled = config.i18n?.enableLanguageChanges ?? true;
    this._defaultLanguage = config.i18n?.locale ?? 'sv';
    this._availableLanguages = config.i18n?.languages ?? [];
    this.translate.addLangs(this._availableLanguages);
    this.translate.setDefaultLang(this._defaultLanguage);

    if (!this._langChangeEnabled) {
      this.translate.use(this._defaultLanguage);
    } else {
      this.storage.get('language').then((lang) => {
        if (lang) {
          this.translate.use(lang);
        } else {
          const browserLang = this.translate.getBrowserLang();
          if (browserLang && this._availableLanguages.includes(browserLang)) {
            this.translate.use(browserLang);
          } else {
            this.translate.use(this._defaultLanguage);
          }
        }
      }).catch(() => {
        this.translate.use(this._defaultLanguage);
      });
    }

    this._language = this.translate.currentLang;
    this.storage.set('language', this.translate.currentLang);
    this.languageSubject = new BehaviorSubject<string>(this.translate.currentLang);

    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      const prevLang = this._language;
      this.storage.set('language', this.translate.currentLang);
      this._language = this.translate.currentLang;
      if (this._language !== undefined && prevLang !== this._language) {
        this.updateLanguageSubject(this._language);
      }
    });
  }

  public getLanguage(): Observable<string> {
    const translate = this.translate;
    const storage = this.storage;
    const _language = this._language;
    const that = this as any;
    return new Observable(function (subscriber: any) {
      if (!that._langChangeEnabled) {
        subscriber.next(that._defaultLanguage);
        subscriber.complete();
        return;
      }

      if (_language) {
        subscriber.next(_language);
        subscriber.complete();
        return;
      }

      storage.get('language').then((lang) => {
        if (lang) {
          subscriber.next(lang);
          subscriber.complete();
        } else {
          const browserLang = translate.getBrowserLang();
          subscriber.next(browserLang?.match(that._availableLanguages.join('|')) ? browserLang : that._defaultLanguage)
          subscriber.complete();
        }
      }).catch(() => {
          that.lang = that._defaultLanguage;
          subscriber.next(that.lang);
          subscriber.complete();
      });
    }.bind(this));
  }

  public setLanguage(lang: string) {
    this.translate.use(lang).subscribe({
      next: res => {
        this.events.publishLanguageStaticChange();
      },
      error: err => console.error(err)
    });
  }

  public get(text: string) {
    return this.translate.get(text);
  }

  get language(): string {
    return this._language as string;
  }

  set language(lang: string) {
    // Validate that lang is in supported languages
    if (!this._availableLanguages.includes(lang)) {
      lang = this._defaultLanguage;
    }
    this.setLanguage(lang);
  }

  get languages(): Array<string> {
    return this.translate.getLangs();
  }

  updateLanguageSubject(newLanguage: string) {
    this.languageSubject.next(newLanguage);
  }

  languageSubjectChange(): Observable<string> {
    return this.languageSubject.asObservable();
  }
}
