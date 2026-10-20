import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { Camera } from '@capacitor/camera';
import { Directory, Filesystem } from '@capacitor/filesystem';

@Injectable({ providedIn: 'root' })
export class PhotoStorageService {
  async capture(): Promise<string | undefined> {
    const photo = await Camera.takePhoto({ quality: 90, correctOrientation: true, saveToGallery: false,
      webUseInput: !Capacitor.isNativePlatform() });
    return photo.webPath ?? (photo.uri ? Capacitor.convertFileSrc(photo.uri) : undefined);
  }

  async save(webPath: string): Promise<string> {
    const response = await fetch(webPath);
    if (!response.ok) throw new Error('No se pudo leer la fotografía.');
    const blob = await response.blob();
    const extension = ({ 'image/jpeg': 'jpeg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif' } as Record<string, string>)[blob.type];
    if (!extension) throw new Error('Formato de imagen no compatible.');
    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve((reader.result as string).split(',')[1]);
      reader.onerror = () => reject(new Error('No se pudo procesar la fotografía.'));
      reader.readAsDataURL(blob);
    });
    const name = `photos/photo_${Date.now()}_${crypto.randomUUID()}.${extension}`;
    await Filesystem.writeFile({ path: name, data: base64, directory: Directory.Data, recursive: true });
    return name;
  }

  async displayPath(path: string): Promise<string> {
    if (Capacitor.isNativePlatform()) {
      const result = await Filesystem.getUri({ path, directory: Directory.Data });
      return Capacitor.convertFileSrc(result.uri);
    }
    const file = await Filesystem.readFile({ path, directory: Directory.Data });
    const extension = path.split('.').pop() ?? 'jpeg';
    const mime = ({ png: 'image/png', webp: 'image/webp', gif: 'image/gif' } as Record<string, string>)[extension] ?? 'image/jpeg';
    if (typeof file.data === 'string') return `data:${mime};base64,${file.data}`;
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file.data as Blob);
    });
  }

  async remove(path: string): Promise<void> {
    await Filesystem.deleteFile({ path, directory: Directory.Data });
  }
}
