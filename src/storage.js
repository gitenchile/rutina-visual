// Todo se guarda en el navegador del dispositivo (localStorage).
// Nada de lo que escribas en la app se sube al repositorio ni a ningún servidor.

export const STORAGE_KEY = 'rutina-visual-v1';

export const todayStr = () => {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
};

// Datos de ejemplo. Edítalos desde la pestaña Ajustes (requiere PIN).
export const DEFAULT_STATE = {
  childName: '',
  pin: '',
  rule: 'La pantalla se abre cuando la rutina del día está hecha.',
  tasks: [
    { id: 't1', label: 'Levantarse y vestirse', points: 5 },
    { id: 't2', label: 'Desayunar', points: 5 },
    { id: 't3', label: 'Lavarse los dientes', points: 5 },
    { id: 't4', label: 'Preparar la mochila', points: 5 },
    { id: 't5', label: 'Tarea de 20 minutos', points: 5 },
  ],
  rewards: [
    { id: 'r1', label: '30 min de tablet', cost: 20 },
    { id: 'r2', label: 'Elegir el postre del viernes', cost: 35 },
    { id: 'r3', label: 'Salida al parque', cost: 60 },
  ],
  stars: 0,
  day: '',
  done: {},
};

export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return structuredClone(DEFAULT_STATE);
    return { ...structuredClone(DEFAULT_STATE), ...JSON.parse(raw) };
  } catch {
    return structuredClone(DEFAULT_STATE);
  }
}

export function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Si el almacenamiento no está disponible, la app sigue funcionando en memoria.
  }
}
