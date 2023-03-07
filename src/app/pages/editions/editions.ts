import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { EventsService } from 'src/app/services/events/events.service';
import { LanguageService } from 'src/app/services/languages/language.service';
import { MdContentService } from 'src/app/services/md/md-content.service';
import { UserSettingsService } from 'src/app/services/settings/user-settings.service';

/**
 * List of collections.
 */

// @IonicPage({
//   segment: 'publications'
// })
@Component({
  selector: 'editions-page',
  templateUrl: 'editions.html',
  styleUrls: ['editions.scss']
})
export class EditionsPage {
  readContent?: string;
  errorMessage?: string;
  languageSubscription: Subscription | null;

  constructor(
    private mdContentService: MdContentService,
    public translate: TranslateService,
    public languageService: LanguageService,
    private events: EventsService,
    public userSettingsService: UserSettingsService
  ) {
    this.languageSubscription = null;
  }

  ngOnInit() {
    this.languageSubscription = this.languageService.languageSubjectChange().subscribe(lang => {
      if (lang) {
        this.getMdContent(lang + '-02');
      }
    });
  }

  ngOnDestroy() {
    if (this.languageSubscription) {
      this.languageSubscription.unsubscribe();
    }
  }

  ionViewWillLeave() {
    this.events.publishIonViewWillLeave(this.constructor.name);
  }
  ionViewWillEnter() {
    this.events.publishIonViewWillEnter(this.constructor.name);
    this.events.publishTableOfContentsUnSelectSelectedTocItem(true);
    this.events.publishMusicAccordionReset(true);
    this.events.publishPageLoadedCollections({'title': 'Editions'});
  }

  getMdContent(fileID: string) {
    this.mdContentService.getMdContent(fileID).subscribe({
      next: text => { this.readContent = text.content.trim(); },
      error: e => { this.errorMessage = <any>e; }
    });
  }
}
