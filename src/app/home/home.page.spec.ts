import { HomePage } from './home.page';
import { PhotoDbService } from './photo-db.service';
import { PhotoStorageService } from './photo-storage.service';

describe('Galería', () => {
  let page: HomePage;
  let db: jasmine.SpyObj<PhotoDbService>;
  let storage: jasmine.SpyObj<PhotoStorageService>;
  beforeEach(() => {
    db = jasmine.createSpyObj('db', ['init', 'getPhotos', 'savePhoto']);
    storage = jasmine.createSpyObj('storage', ['capture', 'save', 'displayPath', 'remove']);
    db.init.and.resolveTo(); db.getPhotos.and.resolveTo([]); db.savePhoto.and.resolveTo();
    storage.capture.and.resolveTo('blob:photo'); storage.save.and.resolveTo('photos/unique.jpeg');
    storage.displayPath.and.resolveTo('data:image/jpeg;base64,photo'); storage.remove.and.resolveTo();
    page = new HomePage(db, storage);
  });
  it('actualiza la galería inmediatamente después de guardar', async () => {
    await page.initialize();
    db.getPhotos.and.resolveTo([{ id: 1, imagePath: 'photos/unique.jpeg', caption: 'Clase', photoDate: '2026-09-29', isFavorite: false }]);
    page.caption = 'Clase';
    await page.takePicture();
    expect(page.photos.length).toBe(1);
    expect(page.photos[0].webPath).toContain('data:image');
    expect(db.savePhoto).toHaveBeenCalledWith(jasmine.objectContaining({ caption: 'Clase' }));
    expect(page.busy).toBeFalse();
  });
  it('cancelar no guarda archivos ni registros', async () => {
    await page.initialize(); storage.capture.and.rejectWith(new Error('User cancelled photos app'));
    await page.takePicture();
    expect(db.savePhoto).not.toHaveBeenCalled(); expect(storage.save).not.toHaveBeenCalled();
    expect(page.message).toBe(''); expect(page.busy).toBeFalse();
  });
  it('muestra el error de permisos y permite intentar de nuevo', async () => {
    await page.initialize(); storage.capture.and.rejectWith(new Error('User denied camera access'));
    await page.takePicture();
    expect(page.message).toContain('permiso'); expect(page.busy).toBeFalse();
  });
  it('elimina el archivo nuevo si falla el registro en SQLite', async () => {
    await page.initialize(); db.savePhoto.and.rejectWith(new Error('disk full'));
    await page.takePicture();
    expect(storage.remove).toHaveBeenCalledWith('photos/unique.jpeg');
    expect(page.photos).toEqual([]);
  });
  it('conserva registros de archivos faltantes sin impedir cargar los demás', async () => {
    db.getPhotos.and.resolveTo([{ imagePath: 'missing.jpeg', caption: 'Foto', photoDate: '2026-09-29', isFavorite: false }]);
    storage.displayPath.and.rejectWith(new Error('not found'));
    await page.initialize();
    expect(page.ready).toBeTrue(); expect(page.photos[0].webPath).toBe('');
  });
});
