import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { AnalyticsService } from 'src/app/services/analytics/analytics.service';
import { EventsService } from 'src/app/services/events/events.service';
import { LanguageService } from 'src/app/services/languages/language.service';
import { MdContentService } from 'src/app/services/md/md-content.service';
import { UserSettingsService } from 'src/app/services/settings/user-settings.service';
import { config } from "src/app/services/config/config";

/**
 * Generated class for the MusicPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

// @IonicPage({
//   name: 'music',
//   segment: 'music'
// })
@Component({
  selector: 'page-music',
  templateUrl: 'music.html',
})
export class MusicPage {

  appMachineName: string;
  homeContent?: string;
  homeFooterContent?: string;
  errorMessage?: string;
  initLanguage?: string;
  languageSubscription?: Subscription;

  collectionsToShow = [];

  constructor(
    public translate: TranslateService,
    public languageService: LanguageService,
    private events: EventsService,
    private mdContentService: MdContentService,
    private userSettingsService: UserSettingsService,
    private analyticsService: AnalyticsService
  ) {
    this.appMachineName = config.app?.machineName ?? '';
    this.userSettingsService.temporarilyHideSplitPane();
    this.collectionsToShow = config.page?.music?.collectionsToShow ?? [];
  }

  ionViewWillEnter() {
    this.events.publishIonViewWillEnter(this.constructor.name);
    this.events.publishTableOfContentsUnSelectSelectedTocItem(true);
  }

  ionViewDidEnter() {
    this.analyticsService.doPageView('music');
  }

  ngOnInit() {
    this.languageSubscription = this.languageService.languageSubjectChange().subscribe(lang => {
      if (lang) {
        this.loadContent(lang);
      } else {
        this.languageService.getLanguage().subscribe(language => {
          this.loadContent(language);
        });
      }
    });
  }

  ionViewWillLeave() {
    this.events.publishIonViewWillLeave(this.constructor.name);
  }

  ngOnDestroy() {
    if (this.languageSubscription) {
      this.languageSubscription.unsubscribe();
    }
  }

  loadContent(lang: string) {
    this.getMdContent(lang + '-09'); // @TODO remove hardcoded thins
    this.getFooterMdContent(lang + '-06'); // @TODO remove hardcoded thins
  }

  getMdContent(fileID: string) {
    this.mdContentService.getMdContent(fileID).subscribe({
      next: text => { this.homeContent = text.content; },
      error: e =>  { this.errorMessage = <any>e; }
    });
  }

  getFooterMdContent(fileID: string) {
    this.mdContentService.getMdContent(fileID).subscribe({
      next: text => { this.homeFooterContent = text.content; },
      error: e =>  { this.errorMessage = <any>e; }
    });
  }

}
