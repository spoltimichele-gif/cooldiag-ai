import type { Screen } from "../types/navigation";

export const modules: {
  id: Screen;
  icon: string;
  title: string;
  desc: string;
}[] = [
  {
    id: "cooldiag",
    icon: "❄️",
    title: "CoolDiag AI",
    desc: "Diagnosi climatizzatori split e multisplit",
  },
  {
    id: "toolbox",
    icon: "🧰",
    title: "Toolbox",
    desc: "Calcoli rapidi HVAC",
  },
  {
    id: "library",
    icon: "📚",
    title: "Libreria tecnica",
    desc: "Gas, procedure, valori e controlli",
  },
  {
    id: "history",
    icon: "🕘",
    title: "Storico",
    desc: "Interventi e diagnosi salvate",
  },
  {
    id: "reports",
    icon: "📄",
    title: "Report",
    desc: "PDF interventi e firme clienti",
  },
  {
    id: "settings",
    icon: "⚙️",
    title: "Impostazioni",
    desc: "Strumenti, unità e preferenze",
  },
];