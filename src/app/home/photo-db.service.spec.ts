import { CapacitorSQLite } from '@capacitor-community/sqlite';
import { defineCustomElements } from 'jeep-sqlite/loader';
import { PhotoDbService } from './photo-db.service';

describe('SQLite web real', () => {
  beforeAll(async () => {
    defineCustomElements(window);
    await customElements.whenDefined('jeep-sqlite');
    const el = document.querySelector('jeep-sqlite') ?? document.createElement('jeep-sqlite');
    if (!el.parentElement) document.body.appendChild(el);
    await (el as any).componentOnReady();
  });
  it('conserva una foto al cerrar y reabrir la conexión', async () => {
    const service = new PhotoDbService();
    const caption = `persistencia-${crypto.randomUUID()}`;
    await service.savePhoto({ imagePath: 'photos/test.jpeg', caption, photoDate: new Date().toISOString(), isFavorite: true });
    await CapacitorSQLite.closeConnection({ database: 'photos_db' });
    const reopened = new PhotoDbService();
    const rows = await reopened.getPhotos();
    const saved = rows.find(row => row.caption === caption);
    expect(saved).toBeDefined(); expect(saved?.isFavorite).toBeTrue();
    await reopened.deletePhoto(saved!.id!);
    expect((await reopened.getPhotos()).find(row => row.caption === caption)).toBeUndefined();
  }, 30000);
});
