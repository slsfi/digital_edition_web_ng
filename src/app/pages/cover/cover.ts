import { Component } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { NavController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { ConfigService } from 'src/app/services/config/core/config.service';
import { EventsService } from 'src/app/services/events/events.service';
import { LanguageService } from 'src/app/services/languages/language.service';
import { MdContentService } from 'src/app/services/md/md-content.service';
import { MetadataService } from 'src/app/services/metadata/metadata.service';
import { UserSettingsService } from 'src/app/services/settings/user-settings.service';
import { StorageService } from 'src/app/services/storage/storage.service';
import { TextService } from 'src/app/services/texts/text.service';
import { TableOfContentsService } from 'src/app/services/toc/table-of-contents.service';

/**
 * Generated class for the CoverPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

// @IonicPage({
//   name: 'cover-page',
//   segment: 'publication-cover/:collectionID',
//   priority: 'high'
// })
@Component({
  selector: 'page-cover',
  templateUrl: 'cover.html',
  styleUrls: ['cover.scss']
})
export class CoverPage {

  errorMessage: any;
  image_alt = '';
  image_src = '';
  hasMDCover = false;
  hasDigitalEditionListChildren = false;
  childrenPdfs = [];
  protected id = '';
  protected text: any;
  protected collection: any;
  coverSelected: boolean;
  languageSubscription?: Subscription;

  constructor(
    public navCtrl: NavController,
    private langService: LanguageService,
    private textService: TextService,
    protected sanitizer: DomSanitizer,
    protected events: EventsService,
    private storage: StorageService,
    public userSettingsService: UserSettingsService,
    protected tableOfContentsService: TableOfContentsService,
    public config: ConfigService,
    private mdContentService: MdContentService,
    private metadataService: MetadataService,
    private route: ActivatedRoute,
  ) {
    this.coverSelected = true;
    try {
      this.hasMDCover = this.config.getSettings('ProjectStaticMarkdownCoversFolder');
    } catch (e) {
      this.hasMDCover = false;
    }
  }

  ionViewWillEnter() {
    this.events.publishIonViewWillEnter(this.constructor.name);

    // Try to remove META-Tags
    this.metadataService.clearHead();
    // Add the new META-Tags
    this.metadataService.addDescription(this.constructor.name);
    this.metadataService.addKeywords();

    this.events.publishMusicAccordionReset(true);
    this.events.publishTableOfContentsUnSelectSelectedTocItem({'selected': 'cover'});
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.id = params['collectionID'];
      this.checkIfCollectionHasChildrenPdfs();

      this.languageSubscription = this.langService.languageSubjectChange().subscribe(lang => {
        if (lang) {
          this.loadCover(lang, this.id);
        }
      });

      this.events.publishSelectedItemInMenu({
        menuID: this.id,
        component: 'cover-page'
      });
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

  loadCover(lang: string, id: string) {
    // this.getTocRoot(id);
    this.events.publishPageLoadedCover();
    if (!isNaN(Number(id))) {
      if (!this.hasMDCover) {
        /**
         * ! The necessary API endpoint for getting the cover page via textService has not been
         * ! implemented, so getting the cover this way does not work. It has to be given in a
         * ! markdown file.
         */
        this.textService.getCoverPage(id, lang).subscribe({
          next: (res) => {
            // in order to get id attributes for tooltips
            this.text = this.sanitizer.bypassSecurityTrustHtml(
              res.content.replace(/images\//g, 'assets/images/')
                .replace(/\.png/g, '.svg')
            );
          },
          error: (e) => { this.errorMessage = <any>e; }
        });
      } else {
        this.getCoverImageFromMdContent(`${lang}-${this.hasMDCover}-${id}`);
      }
    }
  }

  getCoverImageFromMdContent(fileID: string) {
    this.mdContentService.getMdContent(fileID).subscribe({
      next: (text) => {
        /* Extract image url and alt-text from markdown content. */
        this.image_alt = text.content.match(/!\[(.*?)\]\(.*?\)/)[1];
        if (this.image_alt === null) {
          this.image_alt = 'Cover image';
        }
        this.image_src = text.content.match(/!\[.*?\]\((.*?)\)/)[1];
        if (this.image_src === null) {
          this.image_src = '';
        }
      },
      error: (e) =>  { this.errorMessage = <any>e; }
    });
  }

  getTocRoot(id: string) {
    if ( !(id === 'mediaCollections' || id === undefined ) ) {
      this.tableOfContentsService.getTableOfContents(id).subscribe({
        next: (tocItems: any) => {
          tocItems.coverSelected = true;
          this.events.publishTableOfContentsLoaded({tocItems: tocItems, searchTocItem: true, collectionID: tocItems.collectionId, 'caller':  'cover'});
          this.storage.set('toc_' + id, tocItems);
        },
        error: (e) =>  { this.errorMessage = <any>e; }
      });
    }
  }

  printMainContentClasses() {
    if (this.userSettingsService.isMobile()) {
      return 'mobile-mode-content';
    } else {
      return '';
    }
  }

}
