import { Component, Input, EventEmitter, Output } from '@angular/core';
import { UserSettingsService } from 'src/app/services/settings/user-settings.service';
import { LanguageService } from 'src/app/services/languages/language.service';
import { EventsService } from 'src/app/services/events/events.service';
import { ModalController, PopoverController } from '@ionic/angular';
import { ConfigService } from 'src/app/services/config/core/config.service';
import { ReferenceDataModalPage } from 'src/app/modals/reference-data-modal/reference-data-modal';
import { SearchAppPage } from 'src/app/modals/search-app/search-app';
import { UserSettingsPopoverPage } from 'src/app/modals/user-settings-popover/user-settings-popover';
import { Subscription } from 'rxjs';

/**
 * Generated class for the TopMenu component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'top-menu',
  templateUrl: 'top-menu.html',
  styleUrls: ['top-menu.scss']
})
export class TopMenuComponent {
  @Input() splitPaneMobile?: boolean;
  @Input() splitPanePossible?: boolean;
  @Input() splitPaneOpen?: boolean;
  @Output() hamburgerMenuClick = new EventEmitter();

  public showHelpButton: boolean;
  public showViewToggle: boolean;
  public showTopURNButton: boolean;
  public showTopMusicButton: boolean;
  public showTopElasticButton: boolean;
  public showTopSimpleSearchButton: boolean;
  public showTopContentButton: boolean;
  public showTopAboutButton: boolean;
  languageSubscription: Subscription | null;
  firstAboutPageId = '';
  language = '';

  constructor(
    private events: EventsService,
    private popoverCtrl: PopoverController,
    private config: ConfigService,
    public userSettingsService: UserSettingsService,
    public languageService: LanguageService,
    private modalController: ModalController
  ) {
    try {
      this.showHelpButton = this.config.getSettings('app.showHelpButton') as any;
    } catch ( e ) {
      this.showHelpButton = true;
    }
    try {
      this.showViewToggle = this.config.getSettings('app.showViewToggle') as any;
    } catch ( e ) {
      this.showViewToggle = true;
    }
    try {
      this.showTopURNButton = this.config.getSettings('showURNButton.topMenu') as any;
    } catch ( e ) {
      try {
        this.showTopURNButton = this.config.getSettings('app.showTopURNButton') as any;
      } catch ( e ) {
        this.showTopURNButton = true;
      }
    }

    try {
      this.showTopElasticButton = this.config.getSettings('app.showTopElasticButton') as any;
    } catch ( e ) {
      this.showTopElasticButton = true;
    }

    try {
      this.showTopSimpleSearchButton = this.config.getSettings('app.showTopSimpleSearchButton') as any;
    } catch ( e ) {
      this.showTopSimpleSearchButton = true;
    }

    try {
      this.showTopContentButton = this.config.getSettings('app.showTopContentButton') as any;
    } catch ( e ) {
      this.showTopContentButton = true;
    }

    try {
      this.showTopAboutButton = this.config.getSettings('app.showTopAboutButton') as any;
    } catch ( e ) {
      this.showTopAboutButton = true;
    }

    try {
      this.showTopMusicButton = this.config.getSettings('app.showTopMusicButton') as any;
    } catch ( e ) {
      this.showTopMusicButton = true;
    }

    let aboutPagesFolderNumber = '03';
    try {
      aboutPagesFolderNumber = this.config.getSettings('page.about.markdownFolderNumber') as any;
    } catch (e) {}

    let initialAboutPageNode = '01';
    try {
      initialAboutPageNode = this.config.getSettings('page.about.initialPageNode') as any;
    } catch (e) {}

    this.firstAboutPageId = aboutPagesFolderNumber + "-" + initialAboutPageNode;

    try {
      this.language = this.config.getSettings('i18n.locale');
    } catch (e) {
      this.language = 'sv';
    }

    this.languageSubscription = null;
  }

  ngOnInit() {
    this.languageSubscription = this.languageService.languageSubjectChange().subscribe(lang => {
      if (lang) {
        this.language = lang;
      }
    });
  }

  ngOnDestroy() {
    if (this.languageSubscription) {
      this.languageSubscription.unsubscribe();
    }
  }

  help() {
    this.events.publishTopMenuHelp();
  }

  async searchApp() {
    const modal = await this.modalController.create({
      component: SearchAppPage,
      cssClass: 'foo',
      componentProps: {
        'data': true,
      }
    });
    modal.present();
  }

  public toggleSplitPane() {
    this.hamburgerMenuClick.emit();
  }

  public async showUserSettingsPopover(event: any) {
    const popover = await this.popoverCtrl.create({
      component: UserSettingsPopoverPage,
    });
    popover.present(event);
  }

  public async showReference(event: any) {
    // Get URL of Page and then the URI
    const modal = await this.modalController.create({
      component: ReferenceDataModalPage,
      id: document.URL,
      componentProps: {
        type: 'reference',
        origin: 'top-menu',
      }
    });
    modal.present();
  }
}
