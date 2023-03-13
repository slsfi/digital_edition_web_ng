import { Component, Input, EventEmitter, Output } from '@angular/core';
import { ModalController, PopoverController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { ReferenceDataModalPage } from 'src/app/modals/reference-data-modal/reference-data-modal';
import { SearchAppPage } from 'src/app/modals/search-app/search-app';
import { UserSettingsPopoverPage } from 'src/app/modals/user-settings-popover/user-settings-popover';
import { UserSettingsService } from 'src/app/services/settings/user-settings.service';
import { LanguageService } from 'src/app/services/languages/language.service';
import { EventsService } from 'src/app/services/events/events.service';
import { config } from "src/app/services/config/config";

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
  @Input() showSideMenu: boolean;
  @Output() hamburgerMenuClick = new EventEmitter();

  public showHelpButton;
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
    public userSettingsService: UserSettingsService,
    public languageService: LanguageService,
    private modalController: ModalController
  ) {
    this.showHelpButton = config.component?.topMenu?.showHelpButton ?? true;
    this.showViewToggle = config.component?.topMenu?.showLanguageButton ?? true;
    this.showTopURNButton = config.component?.topMenu?.showURNButton ?? true;
    this.showTopElasticButton = config.component?.topMenu?.showElasticSearchButton ?? true;
    this.showTopSimpleSearchButton = config.component?.topMenu?.showSimpleSearchButton ?? true;
    this.showTopContentButton = config.component?.topMenu?.showContentButton ?? true;
    this.showTopAboutButton = config.component?.topMenu?.showAboutButton ?? true;
    this.showTopMusicButton = config.component?.topMenu?.showMusicButton ?? true;
    this.language = config.i18n?.locale ?? 'sv';

    const aboutPagesFolderNumber = config.page?.about?.markdownFolderNumber ?? '03';
    const initialAboutPageNode = config.page?.about?.initialPageNode ?? '01';
    this.firstAboutPageId = aboutPagesFolderNumber + "-" + initialAboutPageNode;

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
    return await modal.present();
  }

  public toggleSplitPane() {
    this.hamburgerMenuClick.emit();
  }

  public async showUserSettingsPopover(event: any) {
    const popover = await this.popoverCtrl.create({
      component: UserSettingsPopoverPage,
    });
    return await popover.present(event);
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
    return await modal.present();
  }
}
