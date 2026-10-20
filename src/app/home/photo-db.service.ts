import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { CapacitorSQLite, SQLiteConnection, SQLiteDBConnection } from '@capacitor-community/sqlite';
import { PhotoItem } from './IPhotoItem';

@Injectable({ providedIn: 'root' })
export class PhotoDbService {
  private sqlite = new SQLiteConnection(CapacitorSQLite);
  private db!: SQLiteDBConnection;
  private readonly dbName = 'photos_db';
  private initialization?: Promise<void>;

  init(): Promise<void> {
    if (!this.initialization) {
      this.initialization = this.open().catch(error => {
        this.initialization = undefined;
        throw error;
      });
    }
    return this.initialization;
  }

  private async open(): Promise<void> {
    if (!Capacitor.isNativePlatform()) await this.sqlite.initWebStore();
    const consistency = await this.sqlite.checkConnectionsConsistency();
    const connection = await this.sqlite.isConnection(this.dbName, false);
    this.db = consistency.result && connection.result
      ? await this.sqlite.retrieveConnection(this.dbName, false)
      : await this.sqlite.createConnection(this.dbName, false, 'no-encryption', 1, false);
    await this.db.open();
    await this.db.execute(`CREATE TABLE IF NOT EXISTS photos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      imagePath TEXT NOT NULL,
      caption TEXT,
      photoDate TEXT NOT NULL,
      is_favorite INTEGER NOT NULL DEFAULT 0
    );`);
    await this.persist();
  }

  private async persist(): Promise<void> {
    if (!Capacitor.isNativePlatform()) await this.sqlite.saveToStore(this.dbName);
  }

  async savePhoto(photo: PhotoItem): Promise<void> {
    await this.init();
    await this.db.run(`INSERT INTO photos (imagePath, caption, photoDate, is_favorite) VALUES (?, ?, ?, ?)`,
      [photo.imagePath, photo.caption, photo.photoDate, photo.isFavorite ? 1 : 0]);
    await this.persist();
  }

  async getPhotos(): Promise<PhotoItem[]> {
    await this.init();
    const result = await this.db.query('SELECT id, imagePath, caption, photoDate, is_favorite FROM photos ORDER BY id DESC');
    return (result.values ?? []).map(row => ({
      id: row.id, imagePath: row.imagePath, caption: row.caption ?? '',
      photoDate: row.photoDate, isFavorite: row.is_favorite === 1
    }));
  }

  async deletePhoto(id: number): Promise<void> {
    await this.init();
    await this.db.run('DELETE FROM photos WHERE id = ?', [id]);
    await this.persist();
  }
}
