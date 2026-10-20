import { TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { CapacitorSQLite } from '@capacitor-community/sqlite';
import { defineCustomElements } from 'jeep-sqlite/loader';
import { HomePage } from './home.page';
import { PhotoDbService } from './photo-db.service';
import { PhotoStorageService } from './photo-storage.service';

// Solo la fuente de cámara es simulada; SQLite, IndexedDB y Filesystem son reales.
describe('Galería web integrada', () => {
  beforeAll(async () => {
    defineCustomElements(window);
    await customElements.whenDefined('jeep-sqlite');
    if (!document.querySelector('jeep-sqlite')) document.body.appendChild(document.createElement('jeep-sqlite'));
    await (document.querySelector('jeep-sqlite') as any).componentOnReady();
  });
  it('guarda dos imágenes, las muestra y las recupera con archivos al reabrir', async () => {
    await TestBed.configureTestingModule({ declarations: [HomePage], imports: [CommonModule, FormsModule, IonicModule.forRoot()] }).compileComponents();
    const storage = TestBed.inject(PhotoStorageService);
    const image = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aS1sAAAAASUVORK5CYII=';
    spyOn(storage, 'capture').and.resolveTo(image);
    const fixture = TestBed.createComponent(HomePage);
    const page = fixture.componentInstance;
    await page.initialize();
    const tag = `integracion-${crypto.randomUUID()}`;
    page.caption = tag; await page.takePicture();
    page.caption = tag; await page.takePicture();
    const created = page.photos.filter(photo => photo.caption === tag);
    expect(created.length).toBe(2); expect(created[0].imagePath).not.toBe(created[1].imagePath);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('ion-card img').length).toBeGreaterThanOrEqual(2);
    await CapacitorSQLite.closeConnection({ database: 'photos_db' });
    const reopened = new HomePage(new PhotoDbService(), new PhotoStorageService());
    await reopened.initialize();
    const recovered = reopened.photos.filter(photo => photo.caption === tag);
    expect(recovered.length).toBe(2); expect(recovered.every(photo => photo.webPath.startsWith('data:image/'))).toBeTrue();
    const db = new PhotoDbService();
    for (const photo of recovered) { await storage.remove(photo.imagePath); await db.deletePhoto(photo.id!); }
    fixture.destroy();
  }, 30000);
});
