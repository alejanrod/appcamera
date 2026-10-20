import { PhotoStorageService } from './photo-storage.service';

describe('Archivos de fotografías', () => {
  it('dos capturas en el mismo milisegundo producen nombres distintos', async () => {
    spyOn(Date, 'now').and.returnValue(12345);
    spyOn(window, 'fetch').and.callFake(async () => new Response(new Blob(['photo'], { type: 'image/jpeg' })));
    const service = new PhotoStorageService();
    const first = await service.save('blob:photo'); const second = await service.save('blob:photo');
    expect(first).not.toBe(second); expect(first).toContain('photo_12345_');
    expect(await service.displayPath(first)).toContain('data:image/jpeg;base64,');
    expect(await service.displayPath(second)).toContain('data:image/jpeg;base64,');
    await service.remove(first); await service.remove(second);
  });
  it('conserva el formato PNG y su tipo al recuperar la imagen', async () => {
    spyOn(window, 'fetch').and.callFake(async () => new Response(new Blob(['png'], { type: 'image/png' })));
    const service = new PhotoStorageService();
    const path = await service.save('blob:png');
    expect(path.endsWith('.png')).toBeTrue();
    expect(await service.displayPath(path)).toContain('data:image/png;base64,');
    await service.remove(path);
  });
});
