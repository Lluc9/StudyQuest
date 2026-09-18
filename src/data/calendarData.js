// Datos ficticios (mock) para las activitats compartides entre Inici i
// Calendari. Les activitats reals viuen a l'estat global (AppContext);
// aquest fitxer només aporta el contingut inicial per poblar `buildInitialState()`
// (utilitat interna de desenvolupament — mai el que veu un usuari real,
// que sempre comença amb `activities: {}` via l'Onboarding). Les dates
// fixes (juny del 2026) es mantenen a propòsit per a proves: "avui" real
// ja NO depèn d'aquest fitxer (veure `getTodayKey()` a
// `utils/calendarUtils.js`), així que aquestes activitats de demo poden
// quedar "al passat" respecte al dia real — és l'esperat.
//
// `subjectId` fa referència al sistema de matèries de l'usuari
// (src/data/subjectsCatalog.js + matèries personalitzades), no a les 4
// categories antigues que hi havia abans. "Examen" ha deixat de ser una
// materia falsa per convertir-se en un `type` real (veure
// src/data/activityOptions.js). Els ids `t*` eren abans les "tasques"
// exclusives d'Inici (`seedData.js`); ara són activitats normals més,
// només distingides per l'id per continuïtat.
export const initialActivities = {
  '2026-06-09': [
    { id: 't4', title: "Exercicis d'Àlgebra Lineal", subjectId: 'matematiques', type: 'exercicis', time: '08:00', durationMin: 48, xp: 80, completed: true },
    { id: 'c1', title: 'Estudi Càlcul III', subjectId: 'matematiques', type: 'estudi', time: '09:00', durationMin: 120, xp: 200, completed: false },
    { id: 'c2', title: 'Pràctica Física Quàntica', subjectId: 'fisica', type: 'practica', time: '11:30', durationMin: 90, xp: 150, completed: false },
    { id: 't1', title: 'Repassar Càlcul III — Integrals', subjectId: 'matematiques', type: 'estudi', time: '20:00', durationMin: 90, xp: 150, urgent: true, completed: false },
    { id: 't3', title: 'Assaig de Literatura Comparada', subjectId: 'catala', type: 'treball', time: '23:59', durationMin: 120, xp: 200, urgent: true, completed: false },
    { id: 'c3', title: 'Entrega assaig Literatura', subjectId: 'castella', type: 'treball', time: '23:59', durationMin: 0, xp: 300, completed: false },
  ],
  '2026-06-10': [
    { id: 't2', title: 'Llegir capítols 4-6 de Bioquímica', subjectId: 'biologia', type: 'estudi', time: '09:00', durationMin: 72, xp: 120, completed: false },
    { id: 'c4', title: "Deures d'Àlgebra Lineal", subjectId: 'matematiques', type: 'deures', time: '18:00', durationMin: 60, xp: 90, completed: false },
  ],
  '2026-06-11': [
    { id: 't5', title: 'Pràctica de laboratori de Física', subjectId: 'fisica', type: 'practica', time: '10:00', durationMin: 90, xp: 150, completed: false },
    { id: 'c5', title: 'Informe de laboratori', subjectId: 'biologia', type: 'treball', time: '16:00', durationMin: 90, xp: 130, completed: false },
    { id: 'c6', title: 'Lectura obligatòria', subjectId: 'castella', type: 'deures', time: '19:00', durationMin: 60, xp: 90, completed: false },
  ],
  '2026-06-12': [
    { id: 'c7', title: 'Examen de Química', subjectId: 'quimica', type: 'examen', time: '10:00', durationMin: 90, xp: 250, completed: false },
  ],
  '2026-06-14': [
    { id: 'c8', title: 'Repàs de Física', subjectId: 'fisica', type: 'estudi', time: '17:00', durationMin: 60, xp: 100, completed: false },
  ],
  '2026-06-15': [
    { id: 'c9', title: 'Exercicis addicionals', subjectId: 'matematiques', type: 'exercicis', time: '10:00', durationMin: 60, xp: 80, completed: false },
  ],
  '2026-06-17': [
    { id: 'c10', title: 'Laboratori de Ciències', subjectId: 'quimica', type: 'practica', time: '11:00', durationMin: 120, xp: 140, completed: false },
  ],
  '2026-06-20': [
    { id: 'c11', title: 'Seminari de Física', subjectId: 'fisica', type: 'estudi', time: '09:30', durationMin: 60, xp: 110, completed: false },
  ],
  '2026-06-25': [
    { id: 'c12', title: 'Examen final de Matemàtiques', subjectId: 'matematiques', type: 'examen', time: '09:00', durationMin: 120, xp: 300, completed: false },
  ],
}
