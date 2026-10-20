import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { Capacitor } from '@capacitor/core';
import { defineCustomElements as defineSqlite } from 'jeep-sqlite/loader';
import { defineCustomElements as defineCamera } from '@ionic/pwa-elements/loader';
import { AppModule } from './app/app.module';

async function bootstrap(): Promise<void> {
  if (!Capacitor.isNativePlatform()) {
    defineCamera(window);
    defineSqlite(window);
    await customElements.whenDefined('jeep-sqlite');
    const sqlite = document.createElement('jeep-sqlite');
    sqlite.setAttribute('autoSave', 'true');
    document.body.appendChild(sqlite);
    await (sqlite as any).componentOnReady();
  }
  await platformBrowserDynamic().bootstrapModule(AppModule);
}
bootstrap().catch(error => {
  console.error(error);
  document.body.textContent = 'No se pudo iniciar la aplicación. Recarga la página e intenta de nuevo.';
});
