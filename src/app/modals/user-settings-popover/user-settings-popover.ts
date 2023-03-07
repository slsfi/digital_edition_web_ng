import { Component } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { EventsService } from 'src/app/services/events/events.service';
import { UserSettingsService } from 'src/app/services/settings/user-settings.service';
import { LanguageService } from 'src/app/services/languages/language.service';
import { config } from "src/app/services/config/config";

/**
 * Popover with list of available user settings.
 * Settings: view mode, language.
 */

/*@IonicPage({
  name: 'user-settings-popover-page'
})*/
@Component({
  selector: 'user-settings-popover-page',
  templateUrl: 'user-settings-popover.html',
  styleUrls: ['user-settings-popover.scss']
})
export class UserSettingsPopoverPage {

  enableLanguageChanges = true;
  language?: string;

  constructor(
    public viewCtrl: PopoverController,
    public userSettingsService: UserSettingsService,
    public languageService: LanguageService,
    private events: EventsService
  ) {
    this.enableLanguageChanges = config.i18n?.enableLanguageChanges ?? true;
  }

  ionViewWillLeave() {
    this.events.publishIonViewWillLeave(this.constructor.name);
  }
  ionViewWillEnter() {
    this.events.publishIonViewWillEnter(this.constructor.name);
  }

  close() {
    this.viewCtrl.dismiss();
  }

}
