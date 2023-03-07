import { Component, Input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { EventsService } from 'src/app/services/events/events.service';
import { LanguageService } from 'src/app/services/languages/language.service';
import { UserSettingsService } from 'src/app/services/settings/user-settings.service';
import { StorageService } from 'src/app/services/storage/storage.service';
import { TextService } from 'src/app/services/texts/text.service';
import { TableOfContentsService } from 'src/app/services/toc/table-of-contents.service';
import { config } from "src/app/services/config/config";

/**
 * Generated class for the TextChangerComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'text-changer',
  templateUrl: 'text-changer.html',
  styleUrls: ['text-changer.scss'],
})
export class TextChangerComponent {

  @Input() recentlyOpenViews?: any;
  @Input() parentPageType?: string;
  tocItemId: any;
  prevItem: any;
  nextItem: any;
  lastNext: any;
  lastPrev: any;
  prevItemTitle?: string;
  nextItemTitle?: string;
  firstItem?: boolean;
  lastItem?: boolean;
  currentItemTitle?: string;
  collectionId: string;
  languageSubscription: Subscription | null;

  displayNext: Boolean = true;
  displayPrev: Boolean = true;

  flattened: any;
  currentToc: any;

  collectionHasCover: Boolean = false;
  collectionHasTitle: Boolean = false;
  collectionHasForeword: Boolean = false;
  collectionHasIntro: Boolean = false;
  defaultReadViews = '';

  constructor(
    public events: EventsService,
    public storage: StorageService,
    public tocService: TableOfContentsService,
    public userSettingsService: UserSettingsService,
    public translateService: TranslateService,
    private langService: LanguageService,
    protected textService: TextService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.collectionHasCover = config.HasCover ?? false;
    this.collectionHasTitle = config.HasTitle ?? false;
    this.collectionHasForeword = config.HasForeword ?? false;
    this.collectionHasIntro = config.HasIntro ?? false;
    const defaultReadViewsArray = config.defaults?.ReadModeView ?? ['established'];
    this.defaultReadViews = defaultReadViewsArray.join('&');

    if (this.parentPageType === undefined) {
      this.parentPageType = 'page-read';
    }
    this.languageSubscription = null;
    this.tocItemId = '';
    this.collectionId = '';
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.collectionId = params['collectionID'];
      let publicationId = '';
      let chapterId = '';

      try {
        publicationId = params['publicationID'];
        chapterId = params['chapterID'];
      } catch {}

      this.tocItemId = this.collectionId;
      if (publicationId) {
        this.tocItemId += '_' + publicationId;
        if (chapterId && chapterId.startsWith('nochapter') === false) {
          this.tocItemId += '_' + chapterId;
        }
      }

      if (this.languageSubscription) {
        this.languageSubscription.unsubscribe();
      }
      this.languageSubscription = this.langService.languageSubjectChange().subscribe(lang => {
        this.loadData();
      });
  
      this.events.getUpdatePositionInPageReadTextChanger().complete();
      this.events.getUpdatePositionInPageReadTextChanger().subscribe((itemId) => {
        this.setCurrentItem(itemId);
      });
  
      this.events.getTocActiveSorting().complete();
      this.events.getTocActiveSorting().subscribe((sortType) => {
        this.loadData();
      });
    });
  }

  ngOnDestroy() {
    if (this.languageSubscription) {
      this.languageSubscription.unsubscribe();
    }
  }

  loadData() {
    this.flattened = [];

    if (this.parentPageType === 'page-cover') {
      // Initialised from page-cover
      this.translateService.get('Read.CoverPage.Title').subscribe({
        next: translation => {
          this.currentItemTitle = translation;
        },
        error: e => { this.currentItemTitle = ''; }
      });

      this.firstItem = true;
      this.lastItem = false;
      if (this.collectionHasTitle) {
        this.setPageTitleAsNext(this.collectionId);
      } else if (this.collectionHasForeword) {
        this.setPageForewordAsNext(this.collectionId);
      } else if (this.collectionHasIntro) {
        this.setPageIntroductionAsNext(this.collectionId);
      } else {
        this.setFirstTocItemAsNext(this.collectionId);
      }

    } else if (this.parentPageType === 'page-title') {
      // Initialised from page-title
      this.translateService.get('Read.TitlePage.Title').subscribe({
        next: translation => {
          this.currentItemTitle = translation;
        },
        error: e => { this.currentItemTitle = ''; }
      });

      if (this.collectionHasCover) {
        this.firstItem = false;
        this.setPageCoverAsPrevious(this.collectionId);
      } else {
        this.firstItem = true;
      }

      this.lastItem = false;
      if (this.collectionId === 'mediaCollections') {
        this.setMediaCollectionsAsNext();
      } else {
        if (this.collectionHasForeword) {
          this.setPageForewordAsNext(this.collectionId);
        } else if (this.collectionHasIntro) {
          this.setPageIntroductionAsNext(this.collectionId);
        } else {
          this.setFirstTocItemAsNext(this.collectionId);
        }
      }

    } else if (this.parentPageType === 'page-foreword') {
      // Initialised from page-foreword
      this.translateService.get('Read.ForewordPage.Title').subscribe({
        next: translation => {
          this.currentItemTitle = translation;
        },
        error: e => { this.currentItemTitle = ''; }
      });

      this.lastItem = false;
      if (this.collectionHasCover || this.collectionHasTitle) {
        this.firstItem = false;
      } else {
        this.firstItem = true;
      }

      if (this.collectionHasTitle) {
        this.setPageTitleAsPrevious(this.collectionId);
      } else if (this.collectionHasCover) {
        this.setPageCoverAsPrevious(this.collectionId);
      }

      if (this.collectionHasIntro) {
        this.setPageIntroductionAsNext(this.collectionId);
      } else {
        this.setFirstTocItemAsNext(this.collectionId);
      }

    } else if (this.parentPageType === 'page-introduction') {
      // Initialised from page-introduction
      this.translateService.get('Read.Introduction.Title').subscribe({
        next: translation => {
          this.currentItemTitle = translation;
        },
        error: e => { this.currentItemTitle = ''; }
      });

      this.lastItem = false;
      if (this.collectionHasCover || this.collectionHasTitle || this.collectionHasForeword) {
        this.firstItem = false;
      } else {
        this.firstItem = true;
      }

      if (this.collectionHasForeword) {
        this.setPageForewordAsPrevious(this.collectionId);
      } else if (this.collectionHasTitle) {
        this.setPageTitleAsPrevious(this.collectionId);
      } else if (this.collectionHasCover) {
        this.setPageCoverAsPrevious(this.collectionId);
      }
      this.setFirstTocItemAsNext(this.collectionId);

    } else {
      // Default functionality, e.g. as when initialised from page-read
      this.firstItem = false;
      this.lastItem = false;
      const that = this;
      this.next(true).then(function(val: any) {
        that.displayNext = val;
      }.bind(this));
      this.previous(true).then(function(val: any) {
        that.displayPrev = val;
      }.bind(this));
      // this.flattened = [];
      // this.setupData(this.collectionId);
    }
  }

  setFirstTocItemAsNext(collectionId: string) {
    try {
      this.tocService.getTableOfContents(collectionId).subscribe(
        (toc: any) => {
          if (toc && toc.children && String(toc.collectionId) === collectionId) {
            this.flatten(toc);
            if (this.textService.activeTocOrder === 'alphabetical') {
              this.sortFlattenedTocAlphabetically();
            } else if (this.textService.activeTocOrder === 'chronological') {
              this.sortFlattenedTocChronologically();
            }
            for (let i = 0; i < this.flattened.length; i++) {
              if (this.flattened[i].itemId !== undefined && this.flattened[i].type !== 'subtitle'
              && this.flattened[i].type !== 'section_title') {
                this.nextItemTitle = this.flattened[i].text;
                this.nextItem = this.flattened[i];
                break;
              }
            }
          } else {
            this.nextItemTitle = '';
            this.nextItem = null;
            this.lastItem = true;
          }
        }
      );
    } catch ( e ) {
      console.log('Unable to get first toc item as next in text-changer');
      this.nextItemTitle = '';
      this.nextItem = null;
      this.lastItem = true;
    }
  }

  setPageTitleAsNext(collectionId: string) {
    this.translateService.get('Read.TitlePage.Title').subscribe({
      next: translation => {
        this.nextItemTitle = translation;
        this.nextItem = {
          itemId: collectionId,
          page: 'page-title'
        };
      },
      error: e => {
        this.nextItemTitle = '';
        this.nextItem = null;
        this.lastItem = true;
      }
    });
  }

  setPageForewordAsNext(collectionId: string) {
    this.translateService.get('Read.ForewordPage.Title').subscribe({
      next: translation => {
        this.nextItemTitle = translation;
        this.nextItem = {
          itemId: collectionId,
          page: 'page-foreword'
        };
      },
      error: e => {
        this.nextItemTitle = '';
        this.nextItem = null;
        this.lastItem = true;
      }
    });
  }

  setPageIntroductionAsNext(collectionId: string) {
    this.translateService.get('Read.Introduction.Title').subscribe({
      next: translation => {
        this.nextItemTitle = translation;
        this.nextItem = {
          itemId: collectionId,
          page: 'page-introduction'
        };
      },
      error: e => {
        this.nextItemTitle = '';
        this.nextItem = null;
        this.lastItem = true;
      }
    });
  }

  setMediaCollectionsAsNext() {
    this.nextItemTitle = '';
    this.nextItem = {
      itemId: 'mediaCollections',
      page: 'media-collections'
    };
  }

  setPageCoverAsPrevious(collectionId: string) {
    this.translateService.get('Read.CoverPage.Title').subscribe({
      next: translation => {
        this.prevItemTitle = translation;
        this.prevItem = {
          itemId: collectionId,
          page: 'page-cover'
        };
      },
      error: e => {
        this.prevItemTitle = '';
        this.prevItem = null;
        this.firstItem = true;
      }
    });
  }

  setPageTitleAsPrevious(collectionId: string) {
    this.translateService.get('Read.TitlePage.Title').subscribe({
      next: translation => {
        this.prevItemTitle = translation;
        this.prevItem = {
          itemId: collectionId,
          page: 'page-title'
        };
      },
      error: e => {
        this.prevItemTitle = '';
        this.prevItem = null;
        this.firstItem = true;
      }
    });
  }

  setPageForewordAsPrevious(collectionId: string) {
    this.translateService.get('Read.ForewordPage.Title').subscribe({
      next: translation => {
        this.prevItemTitle = translation;
        this.prevItem = {
          itemId: collectionId,
          page: 'page-foreword'
        };
      },
      error: e => {
        this.prevItemTitle = '';
        this.prevItem = null;
        this.firstItem = true;
      }
    });
  }

  setPageIntroductionAsPrevious(collectionId: string) {
    this.translateService.get('Read.Introduction.Title').subscribe({
      next: translation => {
        this.prevItemTitle = translation;
        this.prevItem = {
          itemId: collectionId,
          page: 'page-introduction'
        };
      },
      error: e => {
        this.prevItemTitle = '';
        this.prevItem = null;
        this.firstItem = true;
      }
    });
  }

  async previous(test?: boolean) {
    this.tocService.getTableOfContents(this.collectionId).subscribe(
      toc => {
        this.findNext(toc);
      }
    );
    if (this.prevItem !== undefined && test !== true) {
      this.storage.set('currentTOCItem', this.prevItem);
      await this.open(this.prevItem);
    } else if (test && this.prevItem !== undefined) {
      return true;
    } else if (test && this.prevItem === undefined) {
      return false;
    }
    return false;
  }

  async next(test?: boolean) {
    if (this.tocItemId !== 'mediaCollections') {
      this.tocService.getTableOfContents(this.collectionId).subscribe(
        toc => {
          this.findNext(toc);
        }
      );
    }
    if (this.nextItem !== undefined && test !== true) {
      this.storage.set('currentTOCItem', this.nextItem);
      await this.open(this.nextItem);
    }  else if (test && this.nextItem !== undefined) {
      return true;
    } else if (test && this.nextItem === undefined) {
      return false;
    }
    return false;
  }

  findNext(toc: any) {
    // flatten the toc structure
    if ( this.flattened.length < 1 ) {
      this.flatten(toc);
    }
    if (this.textService.activeTocOrder === 'alphabetical') {
      this.sortFlattenedTocAlphabetically();
    } else if (this.textService.activeTocOrder === 'chronological') {
      this.sortFlattenedTocChronologically();
    }
    let itemFound = this.setCurrentPreviousAndNextItemsFromFlattenedToc();
    if (!itemFound) {
      if (this.tocItemId.indexOf(';') > -1) {
        let searchTocId = this.tocItemId.split(';')[0];
        // The current toc item was not found with position in legacy id, so look for toc item without position
        itemFound = this.setCurrentPreviousAndNextItemsFromFlattenedToc(searchTocId);
        if (!itemFound && this.tocItemId.split(';')[0].split('_').length > 2) {
          // The current toc item was not found without position either, so look without chapter if any
          const chapterStartPos = this.tocItemId.split(';')[0].lastIndexOf('_');
          searchTocId = this.tocItemId.slice(0, chapterStartPos);
          itemFound = this.setCurrentPreviousAndNextItemsFromFlattenedToc(searchTocId);
        }
      }
    }
  }

  setCurrentPreviousAndNextItemsFromFlattenedToc(currentTextId = this.tocItemId) {
    // get the id of the current toc item in the flattened toc array
    let currentId = 0;
    let currentItemFound = false;
    for (let i = 0; i < this.flattened.length; i ++) {
      if ( this.flattened[i].itemId === currentTextId ) {
        currentId = i;
        currentItemFound = true;
        break;
      }
    }
    let nextId = 0 as any;
    let prevId = 0 as any;
    // last item
    if ((currentId + 1) === this.flattened.length) {
      // nextId = 0; // this line makes the text-changer into a loop
      nextId = null;
    } else {
      nextId = currentId + 1;
    }

    if (currentId === 0) {
      // prevId = this.flattened.length - 1; // this line makes the text-changer into a loop
      prevId = null;
    } else {
      prevId = currentId - 1;
    }

    // Set the new next, previous and current items only if on page-read in order to prevent these
    // from flashing before the new page is loaded.
    if (this.parentPageType === 'page-read') {
      if (nextId !== null) {
        this.lastItem = false;
        this.nextItem = this.flattened[nextId];
        if (this.nextItem !== undefined && this.nextItem.text !== undefined) {
          this.nextItemTitle = String(this.nextItem.text);
        } else {
          this.nextItemTitle = '';
        }
      } else {
        this.lastItem = true;
        this.nextItem = null;
        this.nextItemTitle = '';
      }
    }

    if (prevId !== null) {
      if (this.parentPageType === 'page-read') {
        this.firstItem = false;
        this.prevItem = this.flattened[prevId];
        if (this.prevItem !== undefined && this.prevItem.text !== undefined) {
          this.prevItemTitle = String(this.prevItem.text);
        } else {
          this.prevItemTitle = '';
        }
      }
    } else {
      if (this.collectionHasIntro) {
        this.firstItem = false;
        this.setPageIntroductionAsPrevious(this.collectionId);
      } else if (this.collectionHasForeword) {
        this.firstItem = false;
        this.setPageForewordAsPrevious(this.collectionId);
      } else if (this.collectionHasTitle) {
        this.firstItem = false;
        this.setPageTitleAsPrevious(this.collectionId);
      } else if (this.collectionHasCover) {
        this.firstItem = false;
        this.setPageCoverAsPrevious(this.collectionId);
      } else {
        this.firstItem = true;
        this.prevItem = null;
        this.prevItemTitle = '';
      }
    }

    if (this.parentPageType === 'page-read') {
      if (this.flattened[currentId] !== undefined) {
        this.currentItemTitle = String(this.flattened[currentId].text);
      } else {
        this.currentItemTitle = '';
      }
      this.storage.set('currentTOCItemTitle', this.currentItemTitle);
    }
    return currentItemFound;
  }

  flatten(toc: any) {
    if (toc !== null && toc !== undefined) {
      if ( toc.children ) {
        for (let i = 0, count = toc.children.length; i < count; i++) {
          if ( toc.children[i].itemId !== undefined && toc.children[i].itemId !== '') {
            this.flattened.push(toc.children[i]);
          }
          this.flatten(toc.children[i]);
        }
      }
    }
  }

  sortFlattenedTocAlphabetically() {
    if (this.flattened.length > 0) {
      this.flattened.sort(
        (a: any, b: any) =>
          (a.text !== undefined && b.text !== undefined) ?
            ((String(a.text).toUpperCase() < String(b.text).toUpperCase()) ? -1 :
            (String(a.text).toUpperCase() > String(b.text).toUpperCase()) ? 1 : 0) : 0
      );
    }
  }

  sortFlattenedTocChronologically() {
    if (this.flattened.length > 0) {
      this.flattened.sort((a: any, b: any) => (a.date < b.date) ? -1 : (a.date > b.date) ? 1 : 0);
    }
  }

  findPrevTitle(toc: any, currentIndex: any, prevChild?: any) {
    if ( currentIndex === 0 ) {
      this.findPrevTitle(prevChild, prevChild.length);
    }
    for ( let i = currentIndex; i > 0; i-- ) {
      if ( toc[i - 1] !== undefined ) {
        if ( toc[i - 1].type !== 'subtitle' &&  toc[i - 1].type !== 'section_title' ) {
          return toc[i - 1];
        }
      }
    }
  }

  open(item: any) {
    if (item.page !== undefined) {
      // Open text in page-cover, page-title, page-foreword, page-introduction or media-collections
      if (item.page === 'page-cover') {
        this.router.navigate(['/publication-cover/', item.itemId]);
      } else if (item.page === 'page-title') {
        this.router.navigate(['/publication-title', item.itemId]);
      } else if (item.page === 'page-foreword') {
        this.router.navigate(['/publication-foreword', item.itemId]);
      } else if (item.page === 'page-introduction') {
        this.router.navigate(['/publication-introduction', item.itemId]);
      } else if (item.page === 'media-collections') {
        this.router.navigate(['/media-collections']);
      }
    } else {
      // Open text in page-read
      const itemIdParts = item.itemId.split('_');
      const collectionId = itemIdParts[0];
      const publicationId = itemIdParts[1];
      let chapterId = 'nochapter';
      if (itemIdParts[2]) {
        chapterId = itemIdParts[2];
      }

      /**
       * TODO: The params below are not needed. events.publishUpdatePositionInPageRead only really
       * needs item.itemId. Basically the function sends a message to the read page to scroll the read
       * text to a specific position in the text that is already displayed there.
       */
      item.selected = true;
      this.events.publishSelectOneItem(item.itemId);

      const params = {tocItem: item, collection: {title: item.text}} as any;
      params['tocLinkId'] = item.itemId;
      params['collectionID'] = collectionId;
      params['publicationID'] = publicationId;
      if ( itemIdParts[2] !== undefined ) {
        params['chapterID'] = itemIdParts[2];
      }
      params['search_title'] = 'searchtitle';
      if (this.recentlyOpenViews !== undefined && this.recentlyOpenViews.length > 0) {
        params['recentlyOpenViews'] = this.recentlyOpenViews;
      }
      params['selectedItemInAccordion'] = true;

      if (this.textService.readViewTextId && item.itemId.split('_').length > 1 && item.itemId.indexOf(';') > -1
      && item.itemId.split(';')[0] === this.textService.readViewTextId.split(';')[0]) {
        // The read page we are navigating to is just a different position in the text that is already open
        // --> no need to reload page-read, just scroll to correct position
        console.log('Text-changer setting new position in page-read');
        this.setCurrentItem(item.itemId);
        this.events.publishUpdatePositionInPageRead(params);
      } else {
        console.log('Opening read from TextChanger.open()');
        this.router.navigate(['/publication', collectionId, 'text', publicationId, chapterId, 'not', 'infinite', 'nosong', 'searchtitle', this.defaultReadViews]);
      }
    }

  }

  setCurrentItem(itemId: string) {
    this.tocItemId = itemId;
    if (this.tocItemId.indexOf('_') > -1) {
      this.collectionId = this.tocItemId.split('_')[0];
    } else {
      this.collectionId = this.tocItemId;
    }
    if (this.flattened.length < 1) {
      this.tocService.getTableOfContents(this.collectionId).subscribe(
        toc => {
          this.flatten(toc);
          this.setCurrentPreviousAndNextItemsFromFlattenedToc();
        }
      );
    } else {
      this.setCurrentPreviousAndNextItemsFromFlattenedToc();
    }
  }

}
