import { Injectable } from '@angular/core';
import { config } from "src/app/services/config/config";

@Injectable()
export class GenericSettingsService {

  constructor() {
  }

  appName() {
    return config.app.machineName;
  }

  /**
   * This method is used to check if an item should be displayed in a project.
   * Settings can be found in config.json
   * @param settingPath - path for json object key
   */
  show(settingPath: any) {
    return config.show?.[settingPath] ?? null;
  }

  /**
   * This can be used to hide back button on certain pages.
   * Example: <ion-navbar hideBackButton="genericSettingsService.hideTopMenuBackButton('TopMenu')">
   * @param settingPath - path for json object key
   */
  hideTopMenuBackButton(settingPath: any) {
    return config.HideBackButton?.[settingPath] ?? false;
  }

}
