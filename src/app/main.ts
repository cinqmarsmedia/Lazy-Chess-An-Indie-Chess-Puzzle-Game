import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app.module';
import {enableProdMode} from '@angular/core';

//disable this in dev
enableProdMode();


platformBrowserDynamic().bootstrapModule(AppModule);