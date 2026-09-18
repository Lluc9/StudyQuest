// Utilitat per a "Canviar foto" (Configuració → Compte). No hi ha backend
// ni pujada a servidor (encara és una web app local): la imatge es
// redimensiona a mida petita i es desa com a data URL dins de l'estat
// global (persisteix via el mateix `localStorage` que la resta de l'app).
// Redimensionar abans de desar evita que una foto gran de mòbil (varis MB)
// esgoti la quota de `localStorage` compartida amb tota la resta de dades.

const MAX_DIMENSION = 160
const MAX_SOURCE_BYTES = 5 * 1024 * 1024

export function isFileTooBig(file) {
  return file.size > MAX_SOURCE_BYTES
}

/** Llegeix un `File` d'imatge i el retorna com a data URL JPEG,
 * redimensionat perquè el costat més gran no superi `MAX_DIMENSION`. */
export function fileToResizedDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(reader.error)
    reader.onload = () => {
      const img = new Image()
      img.onerror = () => reject(new Error('invalid-image'))
      img.onload = () => {
        const scale = Math.min(1, MAX_DIMENSION / Math.max(img.width, img.height))
        const width = Math.max(1, Math.round(img.width * scale))
        const height = Math.max(1, Math.round(img.height * scale))

        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, width, height)
        resolve(canvas.toDataURL('image/jpeg', 0.85))
      }
      img.src = reader.result
    }
    reader.readAsDataURL(file)
  })
}
