import { Component, OnInit } from '@angular/core';
import { Camera } from '@capacitor/camera';
import { Directory, Filesystem } from "@capacitor/filesystem";
import { PhotoDbService } from "./photo-db.service";
import { PhotoItem } from "./IPhotoItem";

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage implements OnInit {

  photos: PhotoItem[] = [];

  constructor(private _PhotoDbService: PhotoDbService) { }

  async ngOnInit(): Promise<void> {
    await this._PhotoDbService.init();
    await this.loadPhotos();
  }


  async takePicture(): Promise<void> {
    try {
      const result = await Camera.takePhoto({
        quality: 90,
      });

      if (!result.webPath) return;

      const fileName = `photo_${Date.now}.jpeg`;
      const savePath = await this.saveImageToFileSystem(result.webPath, fileName);

      await this._PhotoDbService.savePhoto({
        imagePath: savePath,
        caption: 'Por defecto',
        photoDate: new Date().toLocaleDateString(),
        isFavorite: false
      });

   
    } catch (error) {
      console.error('Error al tomar la foto:', error);
    }
  }

  async loadPhotos(): Promise<void> {
    this.photos = await this._PhotoDbService.getPhotos();
  }

  async saveImageToFileSystem(webPath: string, fileName: string): Promise<string> {
    const response = await fetch(webPath);
    const blob = await response.blob();
    const base64Data = await this.blobToBase64(blob);

    const savedFile = await Filesystem.writeFile({
      path: fileName,
      data: base64Data,
      directory: Directory.Data
    })

    return savedFile.uri;

  }

  private blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = (reader.result as string).split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

}