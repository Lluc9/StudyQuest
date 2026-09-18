// Petit "beep" generat amb Web Audio API — sense fitxers d'àudio externs
// que carregar. S'crea un `AudioContext` nou cada cop (cost mínim, evita
// haver de gestionar el seu cicle de vida) i es tanca sol en acabar.
export function playNotificationSound() {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext
    if (!AudioContextClass) return
    const ctx = new AudioContextClass()
    const oscillator = ctx.createOscillator()
    const gain = ctx.createGain()
    oscillator.type = 'sine'
    oscillator.frequency.value = 880
    gain.gain.setValueAtTime(0.08, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25)
    oscillator.connect(gain)
    gain.connect(ctx.destination)
    oscillator.start()
    oscillator.stop(ctx.currentTime + 0.25)
    oscillator.onended = () => ctx.close()
  } catch {
    // Entorns sense suport d'àudio: silenciós, no és crític.
  }
}
