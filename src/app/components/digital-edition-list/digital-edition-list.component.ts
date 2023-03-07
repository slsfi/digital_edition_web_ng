import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';
import { NavController, Platform } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { GeneralTocItem } from 'src/app/models/table-of-contents.model';
import { DigitalEdition } from 'src/app/models/digital-edition.model';
import { DigitalEditionListService } from 'src/app/services/toc/digital-edition-list.service';
import { TableOfContentsService } from 'src/app/services/toc/table-of-contents.service';
import { EventsService } from 'src/app/services/events/events.service';
import { UserSettingsService } from 'src/app/services/settings/user-settings.service';
import { AnalyticsService } from 'src/app/services/analytics/analytics.service';
import { config } from "src/app/services/config/config";

@Component({
  selector: 'digital-editions-list',
  templateUrl: `./digital-edition-list.html`,
  styleUrls: ['digital-edition-list.scss']
})
export class DigitalEditionList implements OnInit {
  errorMessage?: string;
  digitalEditions?: any;
  digitalEditionsFirstHalf: any = [];
  digitalEditionsSecondHalf: any = [];
  projectMachineName: string;
  editionImages: any;
  appLanguage: any;
  grid?: boolean;
  collectionDownloads: any;
  apiEndPoint: string;
  pdfsAreDownloadOnly = false;
  tocItems?: GeneralTocItem[];
  hasCover = true;
  hasTitle = true;
  hasForeword = true;
  hasIntro = true;
  hideBooks = false;
  hasMediaCollections = false;
  galleryInReadMenu = false;
  collectionSortOrder: any;
  showEpubsInList = false;
  availableEpubs = [];

  @Input() layoutType?: string;
  @Input() collectionsToShow?: Array<any>;

  constructor(
    private digitalEditionListService: DigitalEditionListService,
    public translate: TranslateService,
    private platform: Platform,
    protected tableOfContentsService: TableOfContentsService,
    private events: EventsService,
    public userSettingsService: UserSettingsService,
    private analyticsService: AnalyticsService,
    private navCtrl: NavController,
    private router: Router
  ) {
    this.apiEndPoint = config.app?.apiEndpoint ?? '';
    this.projectMachineName = config.app?.machineName ?? '';
    this.editionImages = config.editionImages ?? undefined;
    this.appLanguage = config.i18n?.locale ?? 'sv';
    this.collectionDownloads = config.collectionDownloads ?? undefined;
    this.hasCover = config.HasCover ?? true;
    this.hasTitle = config.HasTitle ?? true;
    this.hasForeword = config.HasForeword ?? true;
    this.hasIntro = config.HasIntro ?? true;
    this.collectionSortOrder = config.app?.CollectionSortOrder ?? undefined;
    this.hasMediaCollections = config.show?.TOC?.MediaCollections ?? false;
    this.galleryInReadMenu = config.ImageGallery?.ShowInReadMenu ?? false;
    this.showEpubsInList = config.show?.epubsInDigitalEditionList ?? false;
    this.availableEpubs = config.AvailableEpubs ?? [];
    this.pdfsAreDownloadOnly = config.collectionDownloads?.isDownloadOnly ?? false;
    this.hideBooks = config.show?.TOC?.Books ?? false;
  }

  ngOnInit() {
    if (this.platform.is('mobile')) {
      this.grid = false;
    } else {
      this.grid = true;
    }

    let loadCollectionsFromAssets = config.LoadCollectionsFromAssets ?? false;

    if (loadCollectionsFromAssets) {
      this.digitalEditionListService.getCollectionsFromAssets()
        .subscribe(digitalEditions => {
          this.digitalEditions = digitalEditions;
          this.events.publishDigitalEditionListRecieveData({ digitalEditions })
          this.setPDF(digitalEditions);
        });
    } else {
      this.getDigitalEditions();
    }
  }

  getDigitalEditions() {
    this.digitalEditionsFirstHalf = [];
    this.digitalEditionsSecondHalf = [];
    this.digitalEditionListService.getDigitalEditions().subscribe({
      next: digitalEditions => {
        this.digitalEditions = digitalEditions;
        if ( this.hasMediaCollections && this.galleryInReadMenu ) {
          const mediaColl = new DigitalEdition({id: 'mediaCollections', title: 'media'});
          this.digitalEditions?.unshift(mediaColl);
        }
        let de = digitalEditions;
        this.events.publishDigitalEditionListRecieveData({ digitalEditions });
        this.setPDF(de);
        if ( this.collectionSortOrder !== undefined && Object.keys(this.collectionSortOrder).length > 0 )  {
          de = this.sortListDefined(de, this.collectionSortOrder);
        }
        if (this.collectionsToShow !== undefined && this.collectionsToShow.length > 0) {
          this.filterCollectionsToShow(de);
        }
        if (this.showEpubsInList && Object.keys(this.availableEpubs).length > 0) {
          this.prependEpubsToDigitalEditions();
        }
      },
      error: e => { this.errorMessage = <any>e; }
    });
  }

  sortListDefined(list: any, sort: any) {
    for (const coll of list) {
      let order = sort[coll.id];
      // If the sort order is not defined in the config, just set a high number
      // so that it will be at the end of the list.
      if ( order === undefined ) {
        order = 9999;
      }
      coll['order'] = order;
    }

    list.sort((a: any, b: any) => {
      if (typeof a['order'] === 'number') {
        return (a['order'] - b['order']);
      } else {
        return ((a['order'] < b['order']) ? -1 : ((a['order'] > b['order']) ? 1 : 0));
      }
    });

    return list;
  }

  /*
  shortText(edition_id: string): Array<string> {
    let textData = '';
    try {
      const lang = this.translate.currentLang;
      if ( this.editionShortTexts[lang][edition_id] !== undefined ) {
        textData = this.editionShortTexts[lang][edition_id] ||
        this.editionShortTexts[lang].default;
        return textData.split('\n');
      } else {
        return [
          ''
        ];
      }
    } catch (e) {
      // console.error(e);
    }
    return textData.split('\n');
  }
  */

  filterCollectionsToShow(collections: any) {
    const filtered = [] as any;
    if (this.collectionsToShow && this.collectionsToShow.length) {
      collections.forEach((item: any) => {
        if (this.collectionsToShow?.indexOf(item.id) !== -1) {
          filtered.push(item)
        }
      });
    }

    this.digitalEditions = filtered;
  }

  getTocRoot(collection: DigitalEdition) {
    this.tableOfContentsService.getTableOfContents(collection.id).subscribe({
      next: tocItems => {
        this.tocItems = tocItems as any;
        this.openFirstPage(collection);
      },
      error: e => { this.errorMessage = <any>e; }
    });
  }

  setPDF(de: any) {
    let tresh = false;
    for (let i = 0; i < de.length; i++) {
      if (i === (de.length / 2) && de.length % 2 === 0) {
        tresh = true;
      }

      if ( this.collectionDownloads['pdf'] !== undefined &&  this.collectionDownloads['pdf'][String(de[i].id)] !== undefined ) {
        if ( de[i] !== undefined ) {
          de[i]['pdf'] = {
            'url': this.collectionDownloads['pdf'][String(de[i].id)].title,
            'isDownload': (String(de[i].url).length > 0) ? true : false
          };
        }
        de[i].isDownload = (String(de[i].url).length > 0) ? true : false;
        de[i].pdfFile = this.collectionDownloads['pdf'][String(de[i].id)].title;
      }

      if ( this.collectionDownloads['epub'] !== undefined && de[i].id in this.collectionDownloads['epub'] ) {
        if ( de[i] !== undefined ) {
          de[i]['epub'] = {
            'url': this.collectionDownloads['epub'][String(de[i].id)].title,
            'isDownload': (String(de[i].url).length > 0) ? true : false
          };
        }
        de[i].isDownload = (String(de[i].url).length > 0) ? true : false;
      }

      if (tresh && de[i] !== undefined) {
        this.digitalEditionsSecondHalf.push(de[i]);
      } else if (de[i] !== undefined) {
        this.digitalEditionsFirstHalf.push(de[i]);
      }
    }
  }

  downloadBook(event: Event, collection: any, type: any) {
    event.stopPropagation();
    if (collection.isDownload) {
      if (collection.id in this.collectionDownloads['pdf'] && type === 'pdf') {
        const dURL = this.apiEndPoint + '/' + this.projectMachineName + '/files/' + collection.id + '/pdf/' +
          this.collectionDownloads['pdf'][collection.id].title + '/' +
          this.collectionDownloads['pdf'][collection.id].title;
        const ref = window.open(dURL);
        this.doAnalytics('Download', 'PDF', this.collectionDownloads['pdf'][collection.id]);
      } else if (collection.id in this.collectionDownloads['epub'] && type === 'epub') {
        const dURL = this.apiEndPoint + '/' + this.projectMachineName + '/files/' + collection.id + '/epub/' +
          this.collectionDownloads['epub'][collection.id].title + '/' +
          this.collectionDownloads['epub'][collection.id].title;
        const ref = window.open(dURL);
        this.doAnalytics('Download', 'EPUB', this.collectionDownloads['epub'][collection.id]);
      }
    }
  }

  doAnalytics(category: any, type: any, name: any) {
    this.analyticsService.doAnalyticsEvent(category, 'digital-edition-list', String(type + ' - ' + name));
  }

  openFirstPage(collection: DigitalEdition) {
    const params = { tocItem: null, fetch: false, collection: { title: collection.title } } as any;
    params['collectionID'] = collection.id
    try {
      const tocItems = this.tocItems as any;
      params['publicationID'] = String(tocItems['children'][0]['itemId' as any]).split('_')[1];
    } catch (e) {
      params['publicationID'] = '1';
    }

    console.log('Opening read from DigitalEditionList.openFirstPage()');
    // TODO Sami
    this.router.navigate(['/read'], { queryParams: params })
  }

  openCollection(collection: DigitalEdition, animate = true) {
    if ( (collection.isDownload === undefined || collection.isDownload === false) ) {
      if (String(collection.id).endsWith('.epub')) {
        this.events.publishDigitalEditionListOpen(collection);
      } else if (this.hasCover === false && this.hasIntro === false
      && this.hasTitle === false && this.hasForeword === false) {
        this.getTocRoot(collection);
      } else {
        this.events.publishDigitalEditionListOpen(collection);
      }
    } else {
      this.openMediaCollections(collection);
    }
  }

  openMediaCollections(collection: any) {
    this.events.publishOpenMediaCollections({});
  }

  prependEpubsToDigitalEditions() {
    const epubNames = Object.keys(this.availableEpubs);
    const epubCollections: any = [];
    epubNames.forEach(name => {
      const epubFilename = this.availableEpubs[name as any]['filename'];
      const epubColl = new DigitalEdition({id: epubFilename, title: name});
      epubCollections.push(epubColl);
      if (this.availableEpubs[name as any]['cover'] !== undefined) {
        this.editionImages[epubFilename] = this.availableEpubs[name as any]['cover'];
      }
    });
    this.digitalEditions = epubCollections.concat(this.digitalEditions);
  }
}
