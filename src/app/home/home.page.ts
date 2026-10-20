import { Component, OnInit } from '@angular/core';
import { PhotoDbService } from './photo-db.service';
import { PhotoStorageService } from './photo-storage.service';
import { PhotoView } from './IPhotoItem';

@Component({ selector: 'app-home', templateUrl: 'home.page.html', styleUrls: ['home.page.scss'], standalone: false })
export class HomePage implements OnInit {
  photos: PhotoView[] = [];
  busy = false;
  ready = false;
  message = '';
  caption = '';

  constructor(private db: PhotoDbService, private storage: PhotoStorageService) {}

  async ngOnInit(): Promise<void> { await this.initialize(); }

  async initialize(): Promise<void> {
    this.busy = true;
    this.message = '';
    try {
      await this.db.init();
      await this.loadPhotos();
      this.ready = true;
    } catch {
      this.message = 'No se pudo abrir la galería. Intenta de nuevo.';
    } finally { this.busy = false; }
  }

  async loadPhotos(): Promise<void> {
    const photos = await this.db.getPhotos();
    this.photos = await Promise.all(photos.map(async photo => {
      let webPath = '';
      try { webPath = await this.storage.displayPath(photo.imagePath); } catch { /* Mostrar el registro aunque falte el archivo. */ }
      return { ...photo, webPath };
    }));
  }

  async takePicture(): Promise<void> {
    if (this.busy || !this.ready) return;
    this.busy = true;
    this.message = '';
    let path: string | undefined;
    let saved = false;
    try {
      const webPath = await this.storage.capture();
      if (!webPath) return;
      path = await this.storage.save(webPath);
      await this.db.savePhoto({ imagePath: path, caption: this.caption.trim() || 'Sin descripción',
        photoDate: new Date().toISOString(), isFavorite: false });
      saved = true;
      this.caption = '';
      await this.loadPhotos();
      this.message = 'Fotografía guardada.';
    } catch (error) {
      if (path && !saved) await this.storage.remove(path).catch(() => undefined);
      const detail = error instanceof Error ? error.message : String(error);
      if (!/cancel|dismiss/i.test(detail)) {
        this.message = saved ? 'La fotografía se guardó, pero no se pudo actualizar la galería. Recarga la página.'
          : 'No se pudo guardar la fotografía. Comprueba el permiso de cámara y el espacio disponible.';
      }
    } finally { this.busy = false; }
  }
}
