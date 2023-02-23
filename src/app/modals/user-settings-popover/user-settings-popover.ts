import { Component } from '@angular/core';

import { PopoverController } from '@ionic/angular';
import { EventsService } from 'src/app/services/events/events.service';
import { ConfigService } from 'src/app/services/config/core/config.service';
import { UserSettingsService } from 'src/app/services/settings/user-settings.service';
import { LanguageService } from 'src/app/services/languages/language.service';

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
    private config: ConfigService,
    public userSettingsService: UserSettingsService,
    public languageService: LanguageService,
    private events: EventsService
  ) {
    this.enableLanguageChanges = this.config.getSettings('i18n.enableLanguageChanges') as boolean;
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
