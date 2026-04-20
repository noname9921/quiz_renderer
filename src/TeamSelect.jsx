export default function TeamSelect({ setTeam, goHub }) {
  return (
    <div className="terminal-panel">
      <h2>Choose Team</h2>

      {[1, 2, 3, 4].map(t => (
        <button
          key={t}
          onClick={() => {
            setTeam(t);
            goHub();
          }}
        >
          Team {t}
        </button>
      ))}
    </div>
  );
}