type BackButtonProps = {
  onClick: () => void;
};

export function BackButton({ onClick }: BackButtonProps) {
  return (
    <button className="back-button" onClick={onClick}>
      ← HVAC Pro
    </button>
  );
}