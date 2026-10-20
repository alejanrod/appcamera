# Validación de Mi cámara

Comprobaciones realizadas el **06/10/2026**. Preparación del repositorio independiente: **20/10/2026**, sin cambios en la lógica de la aplicación.

## Comprobado

- Instalación de dependencias, lint y compilación web aprobados.
- **10 pruebas aprobadas** en Chrome Headless. Se comprueban actualización inmediata de la galería, cancelación sin registros, permisos denegados, nombres únicos, archivos faltantes y limpieza del archivo nuevo si falla el registro de metadatos.
- Integración con **Filesystem, IndexedDB y SQLite web reales**: guarda dos imágenes sintéticas, comprueba su renderizado y recupera archivos y metadatos con una conexión nueva. La fuente de captura se simula; no se usan fotografías personales.
- En el navegador integrado se seleccionaron imágenes de prueba PNG y JPEG mediante el flujo de Capacitor. Se recuperaron después de recargar y de cerrar y reabrir la pestaña del mismo origen.
- Revisión visual en escritorio y con tamaño de navegador **390×844**: controles, galería desplazable y distribución de una columna en móvil.
- Compilación Android aprobada con Gradle y firma APK v2 verificada. Identidad `edu.electiva.appcamera`, minSDK 24 y targetSDK 36.

La captura mediante el selector del navegador no equivale a una prueba de cámara física. El ajuste de tamaño del navegador tampoco equivale a ejecución en Android.

## Pendiente en un teléfono Android

- Instalar y abrir el APK.
- Conceder permiso y tomar varias fotografías; comprobar que todas aparecen y conservan nombres distintos.
- Cerrar completamente la aplicación y recuperar imágenes, descripciones y fechas.
- Cancelar la cámara y denegar permisos; comprobar el mensaje y el reintento.

No se afirma una validación física Android ni una entrega académica realizada.

## Repetir las comprobaciones

Desde la raíz del repositorio:

```powershell
npm ci
npm run lint
npm run test:ci
npm run android:sync
cd android
.\gradlew.bat assembleDebug --console=plain
```

Las pruebas requieren Chrome. La compilación Android necesita Java 21, SDK 36 y la ruta local del SDK en `android/local.properties`. El APK debug se encuentra en `android/app/build/outputs/apk/debug/app-debug.apk`.

La compilación web advierte de una referencia opcional a `crypto` de Node dentro de jeep-sqlite; no impidió compilar ni comprobar la persistencia en navegador. Gradle advierte sobre dependencias `flatDir` sin impedir la compilación.
