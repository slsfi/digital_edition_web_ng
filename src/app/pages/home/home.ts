import { Component } from '@angular/core';
import { NavController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { EventsService } from 'src/app/services/events/events.service';
import { LanguageService } from 'src/app/services/languages/language.service';
import { MdContentService } from 'src/app/services/md/md-content.service';
import { UserSettingsService } from 'src/app/services/settings/user-settings.service';
import { TextService } from 'src/app/services/texts/text.service';
import { config } from "src/app/services/config/config";


/**
 * HomePage is the first page user sees.
 */

@Component({
  selector: 'home-page',
  templateUrl: 'home.html',
  styleUrls: ['home.scss'],
})
export class HomePage {
  siteHasSubtitle: boolean = false;
  homeContent?: string;
  homeFooterContent?: string;
  imageOrientationPortrait: Boolean = false;
  imageOnRight: Boolean = false;
  titleOnImage: Boolean = false;
  showSimpleSearch: Boolean = false;
  showEditionList: Boolean = false;
  showFooter: Boolean = false;
  imageUrl = '';
  imageUrlStyle = '';
  portraitImageAltText = '';
  errorMessage?: string;
  initLanguage?: string;
  languageSubscription: Subscription | null;

  constructor(
    public navCtrl: NavController,
    public translate: TranslateService,
    public languageService: LanguageService,
    private events: EventsService,
    private mdContentService: MdContentService,
    private userSettingsService: UserSettingsService,
    protected textService: TextService
  ) {
    if (this.userSettingsService.isMobile()) {
      this.userSettingsService.temporarilyHideSplitPane();
    }

    // Get config for front page image and text content
    this.imageOrientationPortrait = config.page?.home?.imageOrientationIsPortrait ?? false;
    this.imageOnRight = config.page?.home?.imageOnRightIfPortrait ?? false;
    this.titleOnImage = config.page?.home?.siteTitleOnTopOfImageInMobileModeIfPortrait ?? false;
    this.portraitImageAltText = config.page?.home?.portraitImageAltText ?? 'front image';
    this.showSimpleSearch = config.page?.home?.showSimpleSearch ?? false;
    this.showEditionList = config.page?.home?.showEditionList ?? false;
    this.showFooter = config.page?.home?.showFooter ?? false;
    this.imageUrl = config.page?.home?.imageUrl ?? 'assets/images/frontpage-image-landscape.jpg';

    // Change front page image if not in desktop mode and the image orientation is set to portrait
    if (!this.userSettingsService.isDesktop() && this.imageOrientationPortrait) {
      const imageUrlMobile = config.page?.home?.portraitImageUrlInMobileMode ?? '';
      if (imageUrlMobile) {
        this.imageUrl = imageUrlMobile;
      }
    }

    this.imageUrlStyle = `url(${this.imageUrl})`;
    this.languageSubscription = null;
  }

  ngOnInit() {
    this.languageSubscription = this.languageService.languageSubjectChange().subscribe((lang) => {
      if (lang) {
        this.loadContent(lang);
      } else {
        this.languageService.getLanguage().subscribe((language) => {
          this.loadContent(language);
        });
      }
    });
  }

  ionViewWillEnter() {
    /* Update the variables in textService that keep track of which texts have
       recently been opened in page-read. The purpose of this is to cause
       texts that are cached in storage to be cleared upon the next visit
       to page-read after visiting home. */
    if (
      this.textService.previousReadViewTextId !== undefined &&
      this.textService.readViewTextId !== undefined
    ) {
      this.textService.previousReadViewTextId = this.textService.readViewTextId;
      this.textService.readViewTextId = '';
    }
  }

  ngOnDestroy() {
    if (this.languageSubscription) {
      this.languageSubscription.unsubscribe();
    }
  }

  loadContent(lang: string) {
    this.getMdContent(lang + '-01');
    this.getFooterMdContent(lang + '-06');

    this.translate.get('Site.Subtitle').subscribe({
      next: translation => {
        if (translation) {
          this.siteHasSubtitle = true;
        } else {
          this.siteHasSubtitle = false;
        }
      },
      error: e => { this.siteHasSubtitle = false; }
    });
  }

  getMdContent(fileID: string) {
    this.mdContentService.getMdContent(fileID).subscribe({
      next: (text) => {
        this.homeContent = text.content;
      },
      error: (e) => {
        this.errorMessage = <any>e;
      }
    });
  }

  getFooterMdContent(fileID: string) {
    this.mdContentService.getMdContent(fileID).subscribe({
      next: (text) => {
        this.homeFooterContent = text.content;
      },
      error: (e) => {
        this.errorMessage = <any>e;
      }
    });
  }
}
