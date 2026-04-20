import { useState } from "react";
import TeamSelect from "./TeamSelect";
import HubAccess from "./components/HubAccess";
import TeamGame from "./TeamGame";
import Soundtrack from "./components/Soundtrack";

import './App.css'

export default function App() {
  const [team, setTeam] = useState(null);
  const [mode, setMode] = useState("select"); 
  // select | hub | game

  if (mode === "select") {
    return (
      <div className="terminal-shell">
        <div className="terminal-window">
          <div className="terminal-header">› init / ssh / team-select</div>
          <TeamSelect
            setTeam={setTeam}
            goHub={() => setMode("hub")}
          />
        </div>
      </div>
    );
  }

  if (mode === "hub") {
    return (
      <div className="terminal-shell">
        <div className="terminal-window">
          <div className="terminal-header">› root / hub / access</div>
          <HubAccess
            team={team}
            goGame={() => setMode("game")}
            goBack={() => setMode("select")}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="terminal-shell">
      <Soundtrack />
      <div className="terminal-window">
        <div className="terminal-header">› live / game / buffer</div>
        <TeamGame team={team} />
      </div>
    </div>
  );
}