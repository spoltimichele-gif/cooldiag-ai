import { useState } from "react";
import "./App.css";

type Screen =
  | "home"
  | "cooldiag"
  | "toolbox"
  | "library"
  | "history"
  | "reports"
  | "settings";

const modules = [
  { id: "cooldiag", icon: "❄️", title: "CoolDiag AI", desc: "Diagnosi climatizzatori split e multisplit" },
  { id: "toolbox", icon: "🧰", title: "Toolbox", desc: "Calcoli rapidi HVAC" },
  { id: "library", icon: "📚", title: "Libreria tecnica", desc: "Gas, procedure, valori e controlli" },
  { id: "history", icon: "🕘", title: "Storico", desc: "Interventi e diagnosi salvate" },
  { id: "reports", icon: "📄", title: "Report", desc: "PDF interventi e firme clienti" },
  { id: "settings", icon: "⚙️", title: "Impostazioni", desc: "Strumenti, unità e preferenze" },
] as const;

function App() {
  const [screen, setScreen] = useState<Screen>("home");

  async function scanBluetooth() {
    try {
      if (!navigator.bluetooth) {
        alert("Bluetooth non disponibile in questo browser. Prova da Chrome sul Pixel 9a.");
        return;
      }

      const device = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
      });

      alert(`Dispositivo trovato: ${device.name || "Senza nome"}`);
      console.log(device);
    } catch (error) {
      console.error(error);
      alert("Nessun dispositivo selezionato oppure Bluetooth non disponibile.");
    }
  }

  return (
    <main className="app-shell">
      {screen === "home" ? (
        <>
          <section className="hero-card">
            <div className="badge">HVAC Pro · Test Bluetooth</div>
            <h1>La tua piattaforma HVAC</h1>
            <p>
              Diagnosi, strumenti, report e storico interventi in un’unica app
              professionale.
            </p>
          </section>

          <section className="module-grid">
            {modules.map((module) => (
              <button
                key={module.id}
                className="module-card"
                onClick={() => setScreen(module.id)}
              >
                <span className="module-icon">{module.icon}</span>
                <span>
                  <strong>{module.title}</strong>
                  <small>{module.desc}</small>
                </span>
              </button>
            ))}
          </section>
        </>
      ) : (
        <section className="page-card">
          <button className="back-button" onClick={() => setScreen("home")}>
            ← HVAC Pro
          </button>

          <div className="badge">Modulo</div>
          <h1>{modules.find((m) => m.id === screen)?.title}</h1>
          <p>{modules.find((m) => m.id === screen)?.desc}</p>

          {screen === "cooldiag" && (
            <div className="action-panel">
              <h2>Test strumenti Bluetooth</h2>
              <p>
                Accendi le Testo 549i / 115i, avvicinale al telefono o al PC e
                premi il pulsante. Per il test migliore usa Chrome sul Pixel 9a.
              </p>

              <button className="start-button">Nuova diagnosi</button>

              <button className="start-button" onClick={scanBluetooth}>
                Cerca strumenti Bluetooth
              </button>
            </div>
          )}
        </section>
      )}
    </main>
  );
}

export default App;