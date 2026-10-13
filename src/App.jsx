import { useEffect, useState } from 'react';
import { loadState, saveState, todayStr } from './storage.js';

const newId = () => Math.random().toString(36).slice(2, 9);
const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);

// Si cambió el día, se limpian las tareas marcadas. Las estrellas se conservan.
function withToday(s) {
  return s.day === todayStr() ? s : { ...s, day: todayStr(), done: {} };
}

function Star({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 2.8l2.8 5.9 6.4.8-4.7 4.4 1.2 6.4L12 17.2 6.3 20.3l1.2-6.4-4.7-4.4 6.4-.8z"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M5 12.5l4.5 4.5L19 7.5" />
    </svg>
  );
}

export default function App() {
  const [state, setState] = useState(() => withToday(loadState()));
  const [tab, setTab] = useState('hoy');

  useEffect(() => {
    saveState(state);
  }, [state]);

  // Revisa el cambio de día mientras la app está abierta.
  useEffect(() => {
    const tick = () => setState((s) => withToday(s));
    const id = setInterval(tick, 60000);
    document.addEventListener('visibilitychange', tick);
    return () => {
      clearInterval(id);
      document.removeEventListener('visibilitychange', tick);
    };
  }, []);

  const toggleTask = (task) =>
    setState((s) => {
      const done = { ...s.done };
      if (done[task.id]) {
        delete done[task.id];
        return { ...s, done, stars: Math.max(0, s.stars - task.points) };
      }
      done[task.id] = true;
      return { ...s, done, stars: s.stars + task.points };
    });

  const redeem = (reward) => {
    if (state.stars < reward.cost) return;
    if (!window.confirm(`¿Canjear "${reward.label}" por ${reward.cost} estrellas?`)) return;
    setState((s) => (s.stars >= reward.cost ? { ...s, stars: s.stars - reward.cost } : s));
  };

  const doneCount = state.tasks.filter((t) => state.done[t.id]).length;
  const total = state.tasks.length;
  const next = state.tasks.find((t) => !state.done[t.id]);
  const pct = total ? Math.round((doneCount / total) * 100) : 0;
  const dateLabel = capitalize(
    new Date().toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' })
  );

  return (
    <div className="app">
      <main className="screen">
        {tab === 'hoy' && (
          <section aria-label="Hoy" className="section">
            <header className="top">
              <div>
                <p className="muted small">{dateLabel}</p>
                <h1>Hola{state.childName ? `, ${state.childName}` : ''}</h1>
              </div>
              <div className="stars-pill" aria-label={`${state.stars} estrellas`}>
                <Star />
                <span>{state.stars}</span>
              </div>
            </header>

            <div className="card">
              <div className="row between bold">
                <span>Rutina de hoy</span>
                <span>
                  {doneCount} de {total}
                </span>
              </div>
              <div className="bar">
                <div style={{ width: `${pct}%` }} />
              </div>
            </div>

            {next ? (
              <div className="now">
                <p className="label">Ahora toca</p>
                <p className="now-title">{next.label}</p>
                <p className="row bold">
                  <Star /> {next.points} estrellas
                </p>
                <button className="btn light" onClick={() => toggleTask(next)}>
                  Ya lo hice
                </button>
              </div>
            ) : (
              <div className="now">
                <p className="label">Listo</p>
                <p className="now-title">¡Rutina completa!</p>
              </div>
            )}

            <ul className="list">
              {state.tasks.map((t) => {
                const isDone = !!state.done[t.id];
                return (
                  <li key={t.id}>
                    <button
                      className={`task ${isDone ? 'is-done' : ''}`}
                      aria-pressed={isDone}
                      onClick={() => toggleTask(t)}
                    >
                      <span className="check">{isDone && <CheckIcon />}</span>
                      <span className="task-label">{t.label}</span>
                      <span className="task-pts">+{t.points}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>
        )}

        {tab === 'premios' && (
          <section aria-label="Premios" className="section">
            <header className="top">
              <div>
                <p className="muted small">Canjea tus estrellas</p>
                <h1>Premios</h1>
              </div>
            </header>

            <div className="balance">
              <div>
                <p className="small">Tienes</p>
                <p className="big">{state.stars} estrellas</p>
              </div>
              <Star size={44} />
            </div>

            <ul className="list">
              {state.rewards.map((r) => {
                const can = state.stars >= r.cost;
                return (
                  <li key={r.id} className={`card reward ${can ? '' : 'locked'}`}>
                    <div>
                      <p className="bold">{r.label}</p>
                      <p className="small muted">
                        {r.cost} estrellas
                        {!can && ` · faltan ${r.cost - state.stars}`}
                      </p>
                    </div>
                    <button className="btn" disabled={!can} onClick={() => redeem(r)}>
                      {can ? 'Canjear' : 'Aún no'}
                    </button>
                  </li>
                );
              })}
            </ul>

            {state.rule && (
              <div className="rule">
                <p className="label">Regla de la casa</p>
                <p>{state.rule}</p>
              </div>
            )}
          </section>
        )}

        {tab === 'ajustes' && <Settings state={state} setState={setState} />}
      </main>

      <nav className="tabs" aria-label="Secciones">
        {[
          ['hoy', 'Hoy'],
          ['premios', 'Premios'],
          ['ajustes', 'Ajustes'],
        ].map(([key, label]) => (
          <button
            key={key}
            className={tab === key ? 'active' : ''}
            aria-current={tab === key ? 'page' : undefined}
            onClick={() => setTab(key)}
          >
            {label}
          </button>
        ))}
      </nav>
    </div>
  );
}

function Settings({ state, setState }) {
  const [unlocked, setUnlocked] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [error, setError] = useState('');

  const set = (patch) => setState((s) => ({ ...s, ...patch }));

  const editList = (list, id, patch) =>
    setState((s) => ({
      ...s,
      [list]: s[list].map((it) => (it.id === id ? { ...it, ...patch } : it)),
    }));

  const removeItem = (list, id) =>
    setState((s) => ({ ...s, [list]: s[list].filter((it) => it.id !== id) }));

  const addItem = (list, item) =>
    setState((s) => ({ ...s, [list]: [...s[list], { id: newId(), ...item }] }));

  if (!unlocked) {
    const creating = !state.pin;

    const submit = (e) => {
      e.preventDefault();
      if (!/^\d{4}$/.test(pinInput)) {
        setError('El PIN debe tener 4 números.');
        return;
      }
      if (creating) {
        setState((s) => ({ ...s, pin: pinInput }));
        setUnlocked(true);
      } else if (pinInput === state.pin) {
        setUnlocked(true);
      } else {
        setError('PIN incorrecto.');
        return;
      }
      setPinInput('');
      setError('');
    };

    return (
      <section aria-label="Ajustes" className="section">
        <header className="top">
          <div>
            <p className="muted small">Solo para adultos</p>
            <h1>Ajustes</h1>
          </div>
        </header>
        <form className="card stack" onSubmit={submit}>
          <label className="field">
            <span className="bold">{creating ? 'Crea un PIN de 4 números' : 'Ingresa tu PIN'}</span>
            <input
              type="password"
              inputMode="numeric"
              autoComplete="off"
              maxLength={4}
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ''))}
            />
          </label>
          {error && (
            <p className="error" role="alert">
              {error}
            </p>
          )}
          <button className="btn" type="submit">
            {creating ? 'Guardar PIN' : 'Entrar'}
          </button>
        </form>
      </section>
    );
  }

  return (
    <section aria-label="Ajustes" className="section">
      <header className="top">
        <div>
          <p className="muted small">Solo para adultos</p>
          <h1>Ajustes</h1>
        </div>
        <button className="btn ghost small-btn" onClick={() => setUnlocked(false)}>
          Bloquear
        </button>
      </header>

      <div className="card stack">
        <label className="field">
          <span className="bold">Nombre</span>
          <input
            value={state.childName}
            maxLength={20}
            onChange={(e) => set({ childName: e.target.value })}
          />
        </label>
        <label className="field">
          <span className="bold">Regla de la casa</span>
          <textarea
            rows={2}
            value={state.rule}
            onChange={(e) => set({ rule: e.target.value })}
          />
        </label>
      </div>

      <h2>Tareas diarias</h2>
      <div className="card stack">
        {state.tasks.map((t) => (
          <div key={t.id} className="edit-row">
            <input
              aria-label="Nombre de la tarea"
              value={t.label}
              onChange={(e) => editList('tasks', t.id, { label: e.target.value })}
            />
            <input
              aria-label="Estrellas de la tarea"
              type="number"
              min="1"
              max="50"
              value={t.points}
              onChange={(e) =>
                editList('tasks', t.id, {
                  points: Math.min(50, Math.max(1, parseInt(e.target.value, 10) || 1)),
                })
              }
            />
            <button
              className="btn ghost small-btn"
              aria-label={`Quitar ${t.label}`}
              onClick={() => removeItem('tasks', t.id)}
            >
              Quitar
            </button>
          </div>
        ))}
        <button
          className="btn ghost"
          onClick={() => addItem('tasks', { label: 'Nueva tarea', points: 5 })}
        >
          Agregar tarea
        </button>
      </div>

      <h2>Premios</h2>
      <div className="card stack">
        {state.rewards.map((r) => (
          <div key={r.id} className="edit-row">
            <input
              aria-label="Nombre del premio"
              value={r.label}
              onChange={(e) => editList('rewards', r.id, { label: e.target.value })}
            />
            <input
              aria-label="Costo en estrellas"
              type="number"
              min="1"
              max="500"
              value={r.cost}
              onChange={(e) =>
                editList('rewards', r.id, {
                  cost: Math.min(500, Math.max(1, parseInt(e.target.value, 10) || 1)),
                })
              }
            />
            <button
              className="btn ghost small-btn"
              aria-label={`Quitar ${r.label}`}
              onClick={() => removeItem('rewards', r.id)}
            >
              Quitar
            </button>
          </div>
        ))}
        <button
          className="btn ghost"
          onClick={() => addItem('rewards', { label: 'Nuevo premio', cost: 20 })}
        >
          Agregar premio
        </button>
      </div>

      <h2>Otros</h2>
      <div className="card stack">
        <button
          className="btn ghost"
          onClick={() => {
            if (window.confirm('¿Poner las estrellas en 0?')) set({ stars: 0 });
          }}
        >
          Poner estrellas en 0
        </button>
        <button
          className="btn ghost"
          onClick={() => {
            const p = window.prompt('Nuevo PIN de 4 números');
            if (p && /^\d{4}$/.test(p)) set({ pin: p });
          }}
        >
          Cambiar PIN
        </button>
      </div>
    </section>
  );
}
