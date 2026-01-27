
# 🧱 FASE 0 — Modelado de dominio (PRISMA PRIMERO)

> ❗ **Nada de Express, rutas o servicios antes de esto**

## 0.1 Definir entidades base

Modelar **qué existe**, no cómo se sirve:

* Movie
* Series
* Season
* Episode
* MediaFile (archivo físico)
* (opcional después: Genre, Poster, Subtitle)

---

## 0.2 Decisiones clave (antes de escribir schema)

✔ Movie y Episode **comparten archivos**
✔ Series → Seasons → Episodes (jerarquía estricta)
✔ Un MediaFile puede existir sin estar publicado
✔ Nada depende de Express

---

## 0.3 Modelar relaciones en Prisma

* Series 1 → N Seasons
* Season 1 → N Episodes
* Episode 1 → 1 MediaFile
* Movie 1 → 1 MediaFile

Definir:

* índices
* unicidades
* cascadas
* soft delete (`deletedAt`)

---

## 0.4 Migraciones

* Primera migración **solo estructura**
* Sin lógica
* Sin datos dummy

---

# 🧩 FASE 1 — Repositories (Prisma puro)

> Prisma **solo vive aquí**

* `movies.repository`
* `series.repository`
* `seasons.repository`
* `episodes.repository`

Reglas:

* Nada de Express
* Nada de HttpError
* Devuelven `null` o lanzan errores de Prisma

---

# 🧠 FASE 2 — Services (reglas de negocio)

> Aquí vive la inteligencia

* Validar consistencia:

  * no duplicar seasonNumber
  * no saltar episodeNumber
* Convertir errores Prisma → dominio
* Decidir qué es válido o no

---

# 🌐 FASE 3 — HTTP (Express)

> Solo transporte

* Routes
* Zod DTOs
* Status codes
* Middlewares

Nada de lógica compleja aquí.

---

# 🎥 FASE 4 — Streaming base

* HTTP Range
* Lectura de archivos
* Seguridad de paths
* Headers correctos

---

# 🧪 FASE 5 — Robustez

* Logs
* Healthcheck
* Error tracking
