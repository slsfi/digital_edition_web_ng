import { Component, Input, EventEmitter, Output } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ModalController, NavParams, Events, ViewController, Platform } from 'ionic-angular';
import { FacsimileZoomModalPage } from '../../pages/facsimile-zoom/facsimile-zoom';
import { ReadPopoverService } from '../../app/services/settings/read-popover.service';
import { FacsimileService } from '../../app/services/facsimile/facsimile.service';
import { Facsimile } from '../../app/models/facsimile.model'
import { ConfigService } from '@ngx-config/core';
import { TranslateService } from '@ngx-translate/core';
import { SongService } from '../../app/services/song/song.service';
import { IfObservable } from 'rxjs/observable/IfObservable';
/**
 * Generated class for the FacsimilesComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'facsimiles',
  templateUrl: 'facsimiles.html'
})
export class FacsimilesComponent {

  @Input() itemId: any;
  @Input() selectedFacsimile: any;
  @Input() matches?: Array<string>;
  @Input() facsID?: any;
  @Input() facsNr?: any;
  @Input() songID?: any;
  @Output() openNewFacsimileView: EventEmitter<any> = new EventEmitter();

  public text: any;
  protected errorMessage: string;

  selection: 0;
  facsimiles: any;
  zoomedFacsimiles: any;
  images: any;
  activeImage = 0;
  facsimilePage = 0;
  manualPageNumber: number;

  facsUrl = '';
  facsimilePagesInfinite = false;

  facsPage: any;
  facsNumber = 0;

  constructor(
    protected sanitizer: DomSanitizer,
    protected readPopoverService: ReadPopoverService,
    protected modalController: ModalController,
    protected facsimileService: FacsimileService,
    public params: NavParams,
    public translate: TranslateService,
    protected config: ConfigService,
    protected events: Events,
    private viewctrl: ViewController,
    private platform: Platform,
    public songService: SongService
  ) {
    this.deRegisterEventListeners();
    this.registerEventListeners();
    this.manualPageNumber = 1;
    this.text = '';
    this.facsimiles = [];
    if (this.params.get('facsimilePage') !== undefined) {
      this.facsimilePage = this.params.get('facsimilePage');
      // To account for index at 0
      this.facsimilePage -= 1;
    } else {
      this.facsimilePage = 0;
    }
    this.events.publish('view:enter', 'facsimiles');
  }

  openNewFacs(event: Event, id: any) {
    event.preventDefault();
    event.stopPropagation();
    id.viewType = 'facsimile';
    this.openNewFacsimileView.emit(id);
  }

  openNewManuscriptFacs(event: Event, id: any) {
    event.preventDefault();
    event.stopPropagation();
    id.viewType = 'facsimileManuscript';
    id.id = id.manuscript_id;
    this.openNewFacsimileView.emit(id);
  }

  ngOnInit() {
    if (!this.selectedFacsimile) {
      let getFacsimilePagesInfinite = false;
      try {
        getFacsimilePagesInfinite = this.config.getSettings('settings.getFacsimilePagesInfinite')
      } catch (e) {

      }

      if (getFacsimilePagesInfinite) {
        this.facsimilePagesInfinite = this.config.getSettings('settings.getFacsimilePagesInfinite');
      }

      if (this.facsimilePagesInfinite) {
        if (this.facsID && this.facsNr && this.songID) {
          this.facsUrl = this.config.getSettings('app.apiEndpoint') + '/' +
            this.config.getSettings('app.machineName') +
            `/song-example/page/image/${this.facsID}/`;
          this.facsNumber = this.facsNr;
        } else if (this.facsID && this.facsNr) {
          this.facsUrl = this.config.getSettings('app.apiEndpoint') + '/' +
            this.config.getSettings('app.machineName') +
            `/facsimile/page/image/${this.facsID}/`;
          this.facsNumber = this.facsNr;
        } else {
          this.facsUrl = this.config.getSettings('app.apiEndpoint') + '/' +
            this.config.getSettings('app.machineName') +
            `/facsimile/page/image/${this.params.get('collectionID')}/`;
          this.getFacsimilePageInfinite();
        }
      } else {
        this.getFacsimiles();
      }
    } else {
      this.getFacsimiles(this.selectedFacsimile.itemId);
    }
  }

  getFacsimilePageInfinite() {
    this.facsimileService.getFacsimilePage(this.itemId).subscribe(
      facs => {
        this.facsPage = facs;
        this.facsNumber = facs['page_number'];
      },
      error => {
        console.log('Error loading facsimiles...');
        this.errorMessage = <any>error
      }
    );
  }

  nextFacsimileUrl() {
    this.facsNumber++;
  }

  prevFacsimileUrl() {
    if (this.facsNumber === 1) {
      return;
    }
    this.facsNumber--;
  }

  getFacsimiles(itemId?: any) {
    if (itemId) {
      this.itemId = itemId
    }
    this.facsimileService.getFacsimiles(this.itemId).subscribe(
      facs => {
        // in order to get id attributes for tooltips
        this.facsimiles = [];
        for (const f of facs) {
          const facsimile = new Facsimile(f);
          for (let i = f.first_page; i <= f.last_page; i++) {
            if (f.publication_facsimile_collection_id === undefined && f['publication_facsimile_collection_id'] !== undefined) {
              f.publication_facsimile_collection_id = f['publication_facsimile_collection_id'];
            }
            const f_url = this.facsimileService.getFacsimileImage(f.publication_facsimile_collection_id, i, 1);
            facsimile.images.push(f_url);
            const zf_url = this.facsimileService.getFacsimileImage(f.publication_facsimile_collection_id, i, 4);
            facsimile.zoomedImages.push(zf_url);
          }
          facsimile.itemId = this.itemId;
          facsimile.manuscript_id = f.publication_manuscript_id;
          this.facsimiles.push(facsimile)
        }

        if (!itemId) {
          if (this.selectedFacsimile !== undefined && this.selectedFacsimile['viewType'] === 'manuscriptFacsimile') {
            for (let i = 0; i < facs.length; i++) {
              if (String(facs[i].publication_manuscript_id) === String(this.selectedFacsimile.id)) {
                this.selectedFacsimile = this.facsimiles[i];
              }
            }
          } else {
            this.selectedFacsimile = this.facsimiles[0];
          }
          this.images = this.selectedFacsimile.images;
          this.activeImage = 0;
        }
        this.changeFacsimile();
      },
      error => {
        console.log('Error loading facsimiles...', this.itemId);
        this.errorMessage = <any>error
      }
    )
  }

  registerEventListeners() {
    this.events.subscribe('next:facsimile', () => {
      this.next();
    });
    this.events.subscribe('previous:facsimile', () => {
      this.previous();
    });
    this.events.subscribe('zoom:facsimile', () => {
      this.openZoom();
    });
  }

  deRegisterEventListeners() {
    this.events.unsubscribe('next:facsimile');
    this.events.unsubscribe('previous:facsimile');
    this.events.unsubscribe('zoom:facsimile');
  }

  changeFacsimile(facs?: any) {
    if (facs) {
      this.selectedFacsimile = facs;
      this.itemId = this.selectedFacsimile.itemId;
    }
    this.text = this.sanitizer.bypassSecurityTrustHtml(
      this.selectedFacsimile.content.replace(/images\//g, 'assets/images/')
        .replace(/\.png/g, '.svg')
    );
    this.images = this.selectedFacsimile.images;
    this.activeImage = this.facsimilePage;
  }

  previous() {
    if (this.facsimilePagesInfinite) {
      this.prevFacsimileUrl();
      this.manualPageNumber = Number(this.manualPageNumber) - 1;
      return;
    }
    this.activeImage = (this.activeImage - 1);
    this.manualPageNumber = Number(this.manualPageNumber) - 1;
    if (this.activeImage < 0) {
      this.activeImage = this.images.length - 1;
      this.manualPageNumber = this.images.length;
    }
    if (this.manualPageNumber === 0) {
      this.manualPageNumber = 1;
    }
  }

  next() {
    if (this.facsimilePagesInfinite) {
      this.nextFacsimileUrl();
      this.manualPageNumber = Number(this.manualPageNumber) + 1;
      return;
    }
    this.activeImage = (this.activeImage + 1);
    this.manualPageNumber = Number(this.manualPageNumber) + 1;
    if (this.activeImage > this.images.length - 1) {
      this.activeImage = 0;
      this.manualPageNumber = 1;
    }
  }

  setPage(e) {
    if (this.manualPageNumber <= 0) {
      this.manualPageNumber = 1;
    }
    const pNumber: number = (this.manualPageNumber - 1);
    if (this.facsimilePagesInfinite) {
      this.facsNumber = pNumber;
      return;
    }
    this.activeImage = pNumber;
    if (this.activeImage > this.images.length - 1) {
      this.activeImage = 0;
      this.manualPageNumber = 1;
    }
  }

  openZoom() {
    let modal = null;
    if (this.facsimilePagesInfinite) {
      const params = {
        'facsimilePagesInfinite': true,
        'facsUrl': this.facsUrl,
        'facsID': this.facsID,
        'facsNr': this.facsNr
      };

      modal = this.modalController.create(FacsimileZoomModalPage,
        params,
        { cssClass: 'facsimile-zoom-modal' }
      );
    } else {
      modal = this.modalController.create(FacsimileZoomModalPage,
        { 'images': this.selectedFacsimile.zoomedImages, 'activeImage': this.activeImage },
        { cssClass: 'facsimile-zoom-modal' }
      );
    }

    modal.present();
    modal.onDidDismiss(data => {
      console.log('dismissed', data);
    });
  }

}
