import { Component } from '@angular/core';
import { EventsService } from 'src/app/services/events/events.service';
import { UserSettingsService } from 'src/app/services/settings/user-settings.service';
import { config } from "src/app/services/config/config";

@Component({
  selector: 'title-logo',
  templateUrl: 'title-logo.html',
  styleUrls: ['title-logo.scss']
})
export class TitleLogoComponent {

  public siteLogoURL: string;
  public useMobileLogo: Boolean = false;

  constructor(
    private events: EventsService,
    public userSettingsService: UserSettingsService
  ) {
    this.siteLogoURL = config.app?.siteLogoURL ?? 'https://www.sls.fi/';
  }

  ionViewWillLeave() {
    this.events.publishIonViewWillLeave(this.constructor.name);
  }
  ionViewWillEnter() {
    this.events.publishIonViewWillEnter(this.constructor.name);
  }

  ngOnInit() {
    const viewportWidth = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
    if (viewportWidth <= 820) {
      this.useMobileLogo = true;
    } else {
      this.useMobileLogo = false;
    }
  }

}
