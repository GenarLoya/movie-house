# 🎬 Movie House – Roadmap Detallado y Explicado

Este documento describe **qué construir**, **por qué** y **cómo pensar cada parte**
del sistema de streaming basado en **Node.js + Express + Prisma + BullMQ + HLS**.

---

## 🧱 FASE 1 – Modelado de Datos (Prisma)

> Prisma es la **fuente de verdad** del sistema.
> Todo lo demás (API, colas, workers, filesystem) gira alrededor del modelo.

---

### 1.1 Definir enums base

**Por qué**
- Evitan strings mágicos
- Garantizan estados válidos
- Facilitan validaciones y queries

**Enums clave**
- `MediaType`
  - Distingue si el archivo pertenece a una película o a un episodio
- `MediaFileStatus`
  - Representa el estado real del archivo en el pipeline

**Beneficios**
- El backend siempre sabe *en qué punto del procesamiento está el media*
- El frontend puede reaccionar a estados claros

---

### 1.2 Modelo `MediaFile`

**Qué representa**
- Un archivo físico real
- El “asset” del sistema

**Responsabilidad**
- Ser el punto de unión entre:
  - Archivo original
  - HLS generado
  - Movies / Episodes

**Por qué es central**
- Permite reprocesar HLS
- Permite borrar derivados sin perder el original
- Evita duplicar lógica en Movies y Episodes

**Estado**
- `UPLOADED` → archivo guardado
- `PROCESSING` → worker activo
- `READY` → HLS listo
- `ERROR` → fallo en transcodificación

---

### 1.3 Modelo `Movie`

**Qué representa**
- Metadata de negocio
- No sabe nada de streaming

**Relación clave**
- 1 Movie → 1 MediaFile

**Por qué así**
- Una película es una unidad única
- Su media es reemplazable sin borrar la movie

---

### 1.4 Modelo `Series`

**Qué representa**
- Entidad padre de temporadas

**Importante**
- NO tiene MediaFile
- El contenido real vive en los episodios

---

### 1.5 Modelo `Season`

**Qué representa**
- Agrupación lógica
- Orden narrativo

**Relación**
- Series → Seasons (1:N)

---

### 1.6 Modelo `Episode`

**Qué representa**
- Unidad reproducible
- Similar a Movie, pero dentro de una serie

**Relación clave**
- 1 Episode → 1 MediaFile

---

### 1.7 Validación de relaciones

**Objetivo**
- Evitar inconsistencias
- Permitir borrados seguros

**Decisiones**
- Cascada Series → Seasons → Episodes
- MediaFile se borra solo si nadie lo usa

---

## 🧠 FASE 2 – MediaFile como Núcleo

> MediaFile es el **estado del pipeline**, no solo un registro.

---

### 2.1 Repository

**Responsabilidad**
- Acceso a BD
- Ninguna lógica de negocio

**Por qué separar**
- Facilita tests
- Evita Prisma regado por todo el proyecto

---

### 2.2 Service

**Responsabilidad**
- Cambiar estados
- Decidir cuándo procesar
- Coordinar acciones

**Ejemplos**
- Marcar como PROCESSING
- Guardar ruta HLS
- Manejar errores de pipeline

---

### 2.3 Routes

**Responsabilidad**
- Exponer MediaFile como recurso HTTP
- Diagnóstico y debugging

**NO debe**
- Ejecutar FFmpeg
- Lógica pesada

---

## 🎥 FASE 3 – Upload de Archivos

> El upload debe ser **rápido, seguro y no bloqueante**.

---

### 3.1 Estrategia de subida

**Decisiones clave**
- Streaming upload (no buffer completo)
- Tamaños grandes soportados
- Validación mínima (mime / extensión)

**Por qué**
- Los archivos pueden pesar GBs
- Node no debe quedarse sin memoria

---

### 3.2 Upload Service

**Responsabilidad**
- Guardar archivo original
- Crear MediaFile
- Encolar job de HLS

**Regla**
> El upload **nunca procesa video**

---

### 3.3 Upload Routes

**Responsabilidad**
- Endpoint HTTP limpio
- Respuesta rápida

**Resultado**
- Cliente recibe OK
- Procesamiento sigue en background

---

## ⚙️ FASE 4 – HLS + BullMQ

> Todo lo lento y peligroso vive aquí.

---

### 4.1 Cola (BullMQ)

**Responsabilidad**
- Orquestar trabajos
- Reintentos
- Backoff

**Beneficios**
- Resiliencia
- Escalabilidad
- Workers independientes

---

### 4.2 Worker

**Responsabilidad**
- Ejecutar FFmpeg
- Manejar estados
- Reportar errores

**Flujo**
1. Leer MediaFile
2. Cambiar estado
3. Transcodificar
4. Guardar resultado

---

### 4.3 HLS Service

**Responsabilidad**
- Paths
- Comandos FFmpeg
- Validaciones

**Por qué separado**
- Worker queda limpio
- Fácil de testear

---

## 🎬 FASE 5 – Movies & Series (Negocio)

> Aquí vive el dominio, no la infraestructura.

---

### 5.1 Movies

**Responsabilidad**
- CRUD
- Asociación a MediaFile existente

**Importante**
- Nunca crean archivos
- Nunca llaman FFmpeg

---

### 5.2 Series / Seasons / Episodes

**Responsabilidad**
- Organización jerárquica
- Asociar episodios a MediaFile

---

## 📡 FASE 6 – Streaming HTTP

> Servir HLS es **leer archivos**, no lógica de negocio.

---

### 6.1 Servir HLS

**Responsabilidad**
- Exponer `.m3u8` y segmentos
- Headers correctos

---

### 6.2 Seguridad básica

**Validaciones**
- MediaFile debe estar READY
- Evitar servir archivos incompletos

---

## 🧯 FASE 7 – Errores & Observabilidad

---

### 7.1 HttpError

**Por qué**
- Errores coherentes
- Responses uniformes

---

### 7.2 Middleware de errores

**Responsabilidad**
- Traducir errores a HTTP
- Manejar ZodError
- Evitar leaks de stacktrace

---

### 7.3 Logs

**Dónde**
- Upload
- Worker
- FFmpeg

**Por qué**
- Debug
- Auditoría
- Reintentos

---

## 🚀 FASE 8 – Futuro (No ahora)

Ideas claras, pero fuera del MVP:

- DASH
- Múltiples bitrates
- Thumbnails
- Subtitles
- Auth
- CDN

---

## 🧠 Conclusión

Este diseño:
- es modular
- es escalable
- evita refactors grandes
- separa negocio de infraestructura

Estás construyendo **un backend de streaming real**, no un experimento.

---
