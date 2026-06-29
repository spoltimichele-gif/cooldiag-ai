type ModuleCardProps = {
  icon: string;
  title: string;
  desc: string;
  onClick: () => void;
};

export function ModuleCard({ icon, title, desc, onClick }: ModuleCardProps) {
  return (
    <button className="module-card" onClick={onClick}>
      <span className="module-icon">{icon}</span>
      <span>
        <strong>{title}</strong>
        <small>{desc}</small>
      </span>
    </button>
  );
}