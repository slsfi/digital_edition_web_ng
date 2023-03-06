import { Injectable } from '@angular/core';
import { get } from "lodash";

import {settings} from "../config";

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  constructor() {}


  getSettings(key: string) {
    const result = get(settings, key);

    if (result === undefined) {
      throw new Error(
        `No setting found with the specified key ${key}!`
      );
    }

    return result;
  }
}
