# Mi cámara

Ejemplo del profesor completado para navegador y Android.

Basado en [frappelab/appcamera](https://github.com/frappelab/appcamera), commit `92c16fee01fc2b0a24194a4de63130da7189973b`. Se conserva el historial y se documentan aquí las ampliaciones del ejemplo.

## Uso

Escribe una descripción opcional y pulsa **Tomar fotografía**. La imagen se guarda y aparece inmediatamente en la galería, con descripción y fecha. Al volver a abrir se recupera la galería. La captura cancelada no genera registros. Los fallos de permisos y almacenamiento muestran un mensaje y permiten volver a intentar.

## Cambios respecto al repositorio base

- Captura con `Camera.takePhoto` de Capacitor 8.1; resuelve `webPath` y `uri` nativo.
- Nombre único con `Date.now()` y UUID para evitar sobrescrituras.
- Imágenes en `Directory.Data`, metadatos en SQLite y rutas resueltas según plataforma.
- SQLite web con `jeep-sqlite` e IndexedDB. **sql.js 1.11.0 está fijado** porque el JavaScript embebido en jeep-sqlite 2.8.0 necesita su WASM correspondiente.
- Galería actualizada después de guardar. Los registros con archivos faltantes no impiden cargar los demás. Si falla el registro en la base, se elimina el archivo recién creado.
- Android, identidad `edu.electiva.appcamera`, permisos y APK debug.

## Ejecutar

Desde la raíz de este repositorio, con Node.js compatible con Angular 20 y npm (en las comprobaciones se utilizó Node 24):

```powershell
npm ci
npm start -- --port 8100
```

Abre http://localhost:8100. En navegador se usa el selector de imágenes de Capacitor (`webUseInput`): en escritorio seleccionas un archivo y en móvil el navegador puede ofrecer tomar una foto. En el APK se abre la cámara nativa. Los datos pertenecen al origen utilizado: localhost y 127.0.0.1 tienen almacenes distintos.

La cámara requiere localhost o HTTPS. `npm run build` genera la versión web en `www/`. La instalación comienza sin fotografías; los datos creados al usarla se guardan en el dispositivo y no forman parte del repositorio.

## Verificar y compilar

Para Android necesitas Java 21 y Android SDK 36. Las pruebas necesitan Chrome instalado.

```powershell
npm run lint
npm run test:ci
npm run android:sync
cd android
.\gradlew.bat assembleDebug --console=plain
```

El SDK se configura en `android/local.properties` mediante `sdk.dir=RUTA_DEL_SDK`; ese archivo es local y no se versiona. El APK se genera en `android/app/build/outputs/apk/debug/app-debug.apk`, con firma debug destinada a pruebas. Requiere Android 7 o superior. En Linux y macOS usa `./gradlew assembleDebug` en lugar del comando de Windows.

Las pruebas de permisos y cancelación usan una fuente simulada; las de persistencia ejecutan SQLite, IndexedDB y Filesystem reales en Chrome Headless. Las comprobaciones realizadas y pendientes en un teléfono constan en [docs/VALIDACION.md](docs/VALIDACION.md).

## Arquitectura

`PhotoStorageService` captura, guarda y resuelve archivos; `PhotoDbService` administra SQLite; `HomePage` presenta la galería y coordina operaciones. Se conserva `PhotoItem`; `PhotoView` añade una ruta solo para visualización. No hay servidor ni subida de fotos.

## Relación con las clases

La galería y su persistencia corresponden a la ampliación del 15/09, 1:14:25–1:15:51. SQLite y el almacenamiento separado de archivos son decisiones técnicas para completar este repositorio; el profesor también mostró localStorage e IndexedDB. La aplicación integrada con mapa y tabs es un proyecto independiente de esta cámara.

Referencia de captura: [API oficial Camera](https://capacitorjs.com/docs/apis/camera). Se emplea `takePhoto`, incorporado en la versión 8.1, y el selector de archivos web admitido por `webUseInput`.

## Diseño actualizado (06/10/2026)

Paleta compartida: verde jade `#087f72`, tinta `#173a37`, crema `#f5f5ef` y terracota `#b75330`. Tipografía del sistema, tarjetas con bordes suaves y controles con contraste. No requiere descargar fuentes externas. El presupuesto de estilos por componente es de 6 kB de aviso y 8 kB de límite para alojar los diseños adaptables.

Cámara: área de captura separada de la colección, contador y fotografías con proporción 4:3. En móvil se organiza en una columna y permite desplazar la galería.
