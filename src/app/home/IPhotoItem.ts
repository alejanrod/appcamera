export interface PhotoItem {
  id?: number;
  imagePath: string;
  caption: string;
  photoDate: string;
  isFavorite: boolean;
}
export interface PhotoView extends PhotoItem {
  webPath: string;
}
