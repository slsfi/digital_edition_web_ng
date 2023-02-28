import { Component } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { ModalController, PopoverController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { ReadPopoverPage } from 'src/app/modals/read-popover/read-popover';
import { ReferenceDataModalPage } from 'src/app/modals/reference-data-modal/reference-data-modal';
import { ConfigService } from 'src/app/services/config/core/config.service';
import { EventsService } from 'src/app/services/events/events.service';
import { LanguageService } from 'src/app/services/languages/language.service';
import { MdContentService } from 'src/app/services/md/md-content.service';
import { ReadPopoverService } from 'src/app/services/settings/read-popover.service';
import { UserSettingsService } from 'src/app/services/settings/user-settings.service';
import { StorageService } from 'src/app/services/storage/storage.service';
import { TextService } from 'src/app/services/texts/text.service';
import { TableOfContentsService } from 'src/app/services/toc/table-of-contents.service';

/**
 * Generated class for the TitlePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

// @IonicPage({
//   name: 'title-page',
//   segment: 'publication-title/:collectionID',
//   priority: 'high'
// })
@Component({
  selector: 'page-title',
  templateUrl: 'title.html',
  styleUrls: ['title.scss'],
})
export class TitlePage {

  errorMessage: any;
  mdContent: string;
  hasMDTitle = '';
  hasDigitalEditionListChildren = false;
  childrenPdfs = [];
  protected id = '';
  protected text: any;
  protected collection: any;
  titleSelected: boolean;
  showURNButton: boolean;
  showDisplayOptionsButton: Boolean = true;
  textLoading: Boolean = false;
  languageSubscription: Subscription | null;

  constructor(
    private langService: LanguageService,
    private textService: TextService,
    protected sanitizer: DomSanitizer,
    protected events: EventsService,
    private storage: StorageService,
    public userSettingsService: UserSettingsService,
    protected tableOfContentsService: TableOfContentsService,
    public config: ConfigService,
    public mdContentService: MdContentService,
    protected popoverCtrl: PopoverController,
    public readPopoverService: ReadPopoverService,
    private modalController: ModalController,
    private route: ActivatedRoute,
  ) {
    this.titleSelected = true;
    this.mdContent = '';
    try {
      this.hasMDTitle = this.config.getSettings('ProjectStaticMarkdownTitleFolder');
    } catch (e) {
      this.hasMDTitle = '';
    }

    try {
      this.showURNButton = this.config.getSettings('showURNButton.pageTitle');
    } catch (e) {
      this.showURNButton = false;
    }

    try {
      this.showDisplayOptionsButton = this.config.getSettings('showDisplayOptionsButton.pageTitle');
    } catch (e) {
      this.showDisplayOptionsButton = true;
    }

    this.languageSubscription = null;
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.id = params['collectionID'];
      this.checkIfCollectionHasChildrenPdfs();

      this.languageSubscription = this.langService.languageSubjectChange().subscribe(lang => {
        if (lang) {
          this.loadTitle(lang, this.id);
        }
      });

      if (this.id) {
        this.events.publishSelectedItemInMenu({
          menuID: this.id,
          component: 'title-page'
        });
      }
    });

    /*
    this.route.queryParams.subscribe(params => {
      if (params['collection']) {
        this.collection = JSON.parse(params['collection']);
      }

      if (params['publicationID']) {
        this.titleSelected = true;
      } else {
        this.titleSelected = false;
      }
    });
    */
  }

  ngOnDestroy() {
    if (this.languageSubscription) {
      this.languageSubscription.unsubscribe();
    }
  }

  checkIfCollectionHasChildrenPdfs() {
    let configChildrenPdfs = [];

    try {
      configChildrenPdfs = this.config.getSettings(`collectionChildrenPdfs.${this.id}`);
    } catch (e) {}

    if (configChildrenPdfs.length) {
      this.childrenPdfs = configChildrenPdfs;
      this.hasDigitalEditionListChildren = true;
      this.events.publishCollectionWithChildrenPdfsHighlight(this.id);
    }
  }

  ionViewWillLeave() {
    this.events.publishIonViewWillLeave(this.constructor.name);
  }
  ionViewWillEnter() {
    this.events.publishIonViewWillEnter(this.constructor.name);
    this.events.publishMusicAccordionReset(true);
    this.events.publishTableOfContentsUnSelectSelectedTocItem({'selected': 'title'});
  }

  getMdContent(fileID: string) {
    this.mdContentService.getMdContent(fileID).subscribe({
      next: text => { this.mdContent = text.content; },
      error: e =>  { this.errorMessage = <any>e; }
    });
  }

  getTocRoot(id: string) {
    if ( (id === 'mediaCollections' || id === undefined) && this.collection) {
      this.events.publishTableOfContentsLoaded({tocItems: this.collection, searchTocItem: false});
    } else {
      this.tableOfContentsService.getTableOfContents(id).subscribe({
          next: (tocItems: any) => {
            tocItems.titleSelected = this.titleSelected;
            this.events.publishTableOfContentsLoaded({tocItems: tocItems, searchTocItem: true, collectionID: tocItems.collectionId, 'caller':  'title'});
        },
        error: e =>  { this.errorMessage = <any>e; }
      });
    }
  }

  loadTitle(lang: string, id: string) {
    this.textLoading = true;
    // this.getTocRoot(id);
    const isIdText = isNaN(Number(id));
    if (this.hasMDTitle === '') {
      if (isIdText === false) {
        this.textService.getTitlePage(id, lang).subscribe({
          next: res => {
            this.text = this.sanitizer.bypassSecurityTrustHtml(
              res.content.replace(/images\//g, 'assets/images/')
                .replace(/\.png/g, '.svg')
            );
            this.textLoading = false;
          },
          error: e => {
            this.errorMessage = <any>e;
            this.textLoading = false;
          }
        });
      }
    } else {
      if (isIdText === false) {
        const fileID = `${lang}-${this.hasMDTitle}-${id}`;
        this.mdContentService.getMdContent(fileID).subscribe({
          next: res => {
            this.mdContent = res.content;
            this.textLoading = false;
          },
          error: e => {
            this.errorMessage = <any>e;
            this.textLoading = false;
          }
        });
      } else {
        this.mdContentService.getMdContent(`${lang}-gallery-intro`).subscribe({
          next: text => {
            this.mdContent = text.content;
            this.textLoading = false;
          },
          error: e =>  {
            this.errorMessage = <any>e;
            this.textLoading = false;
          }
        });
      }
    }
    // this.events.publish('pageLoaded:title');
  }

  async showReadSettingsPopover(myEvent: any) {
    const toggles = {
      'comments': false,
      'personInfo': false,
      'placeInfo': false,
      'workInfo': false,
      'changes': false,
      'normalisations': false,
      'abbreviations': false,
      'pageNumbering': false,
      'pageBreakOriginal': false,
      'pageBreakEdition': false
    };
    const popover = await this.popoverCtrl.create({
      component: ReadPopoverPage,
      componentProps: { toggles },
      cssClass: 'popover_settings'
    })
    popover.present(myEvent);
  }

  public async showReference() {
    // Get URL of Page and then the URI
    const modal = await this.modalController.create({
      component: ReferenceDataModalPage,
      componentProps: {id: document.URL, type: 'reference', origin: 'page-title'}
    });
    modal.present();
  }

  printMainContentClasses() {
    if (this.userSettingsService.isMobile()) {
      return 'mobile-mode-content';
    } else {
      return '';
    }
  }
}
