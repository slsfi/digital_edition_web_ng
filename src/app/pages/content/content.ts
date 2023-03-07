import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NavController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { MdContent } from 'src/app/models/md-content.model';
import { AnalyticsService } from 'src/app/services/analytics/analytics.service';
import { EventsService } from 'src/app/services/events/events.service';
import { LanguageService } from 'src/app/services/languages/language.service';
import { MdContentService } from 'src/app/services/md/md-content.service';
import { SongService } from 'src/app/services/song/song.service';
import { config } from "src/app/services/config/config";

/**
 * A page used for displaying markdown content.
 */

// @IonicPage({
//   name: 'content',
//   segment: 'content/:id'
// })
@Component({
  selector: 'page-content',
  templateUrl: 'content.html',
  styleUrls: ['content.scss']
})
export class ContentPage {

  errorMessage?: string;
  appName?: string;
  mdContent?: MdContent;
  lang: string;
  songCategories: Array<string> = [];
  songCategory?: string;
  songExample?: string;
  fileID?: string;
  languageSubscription: Subscription | null;

  constructor(
    public navCtrl: NavController,
    private mdContentService: MdContentService,
    protected langService: LanguageService,
    public events: EventsService,
    public songService: SongService,
    private analyticsService: AnalyticsService,
    private route: ActivatedRoute,
  ) {
    this.languageSubscription = null;
    this.lang = config.i18n?.locale ?? 'sv';

    this.langService.getLanguage().subscribe((lang) => {
      this.lang = lang;
    });

    this.songCategoriesConfig();
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      if (this.fileID !== params['id']) {
        this.fileID = params['id'];
        this.mdContent = new MdContent({id: this.fileID, title: '...', content: null, filename: null});
        this.loadContent(this.lang);
      }
    });
    this.route.queryParams.subscribe(params => {
      if (!params['selectedItemInAccordion'] || params['selectedItemInAccordion'] === undefined) {
        this.searchTocItem();
      }
    });

    this.languageSubscription = this.langService.languageSubjectChange().subscribe(lang => {
      if (lang) {
        this.loadContent(lang);
      }
    });
  }

  ionViewWillEnter() {
    this.events.publishIonViewWillEnter(this.constructor.name);
    this.events.publishPageLoadedContent({'title': this.mdContent?.title});
  }

  ionViewDidEnter() {
    this.analyticsService.doPageView('Content');
  }

  ionViewWillLeave() {
    this.events.publishIonViewWillLeave(this.constructor.name);
  }

  ngOnDestroy() {
    if (this.languageSubscription) {
      this.languageSubscription.unsubscribe();
    }
    this.events.getAboutMarkdownTOCLoaded().complete();
  }

  loadContent(lang: string) {
    if ( !String(this.fileID).includes(lang) ) {
      // The language has changed so the content needs to be reloaded
      this.fileID = lang + String(this.fileID).slice(String(this.fileID).indexOf('-'));
      // Update url with the new id
      let url = window.location.href;
      url = url.slice(0, url.lastIndexOf('/')) + '/';
      if (url.endsWith('/#/content/')) {
        url += this.fileID;
        history.pushState(null, '', url);
      }
      this.events.getAboutMarkdownTOCLoaded().subscribe((toc) => {
        this.events.publishTableOfContentsFindMarkdownTocItem({
          markdownID: this.fileID
        });
      });
    }
    if (this.fileID) {
      this.getMdContent(this.fileID);
    }
    this.songCategoriesConfig();
  }

  songCategoriesConfig() {
    this.songCategories = config.SongCategories?.[this.lang] ?? [];
  }

  searchTocItem() {
    const playManTraditionPageInMusicAccordion = config.MusicAccordionShow?.PlaymanTraditionPage ?? false;

    // If playman tradition exists in musicaccordion
    // we don't have to search for it in table-of-contents-accordion component.
    // Instead we search for it in MusicAccordion
    let language = config.i18n?.locale ?? 'sv';
    this.langService.getLanguage().subscribe((lang: string) => {
      language = lang;
    });

    let playmanTraditionPageID = '03-03';
    playmanTraditionPageID = `${language}-${playmanTraditionPageID}`;

    if (playManTraditionPageInMusicAccordion && this.fileID === playmanTraditionPageID) {
      this.events.publishMusicAccordionSetSelected({musicAccordionKey: 'playmanTraditionPage'});
    } else {
      // Wait for the About-markdownpages TOC to be loaded before proceeding to find markdown TOC item
      this.events.getAboutMarkdownTOCLoaded().subscribe((toc) => {
        this.events.publishTableOfContentsFindMarkdownTocItem({
          markdownID: this.fileID
        });
      });
    }
  }

  doAnalytics( title: any ) {
    this.analyticsService.doPageView('Content - ' + title);
    this.analyticsService.doAnalyticsEvent('Content', 'Content - ' + title, title);
  }

  getMdContent(fileID: string) {
    this.mdContentService.getMdContent(fileID).subscribe({
      next: text => {
        this.getSongsByType(text.content);
        this.getSongExample(text.content);
        if (this.mdContent) {
          this.mdContent.content = text.content;
          this.doAnalytics(this.mdContent.id);
        }
      },
      error: e => { this.errorMessage = <any>e; }
    });
  }

  getSongsByType(markdownText: any) {
    for (const category of this.songCategories) {
      if (markdownText.indexOf(`<!-- {songtype:"${category}"} -->`) !== -1) {
        // Fetch songs
        this.songCategory = category;
        break;
      }
    }
  }

  getSongExample(markdownText: any) {
    const songExample = markdownText.split('<!--SONGEXAMPLESTART--').pop().split('--SONGEXAMPLEEND-->')[0];
    if (songExample) {
      this.songExample = songExample;
    }
  }
}
