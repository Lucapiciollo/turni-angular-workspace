import { NgModule } from '@angular/core';
import { PlCoreModule, BROWSER } from 'pl-core-utils-library';

@NgModule({
  imports: [
    PlCoreModule.forRoot({
      browserValid: [BROWSER.CHROME, BROWSER.EDGE, BROWSER.FIREFOX],
      disableLog: false,
      maxCacheAge: 300000,
      cacheTag: '@cachable@',
      mockPath: 'public/mock',
      enableAlert: true
    })
  ],
  exports: [
    PlCoreModule
  ]
})
export class PlCoreUtilsModule {}