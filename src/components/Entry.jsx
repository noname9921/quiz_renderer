import { useState } from "react";
import HubAccess from "./HubAccess";

export default function Entry({ setTeam, goHub, goGame }) {
  const [mode, setMode] = useState("menu");
  const [teamInput, setTeamInput] = useState("");

  const HUB_KEY = "my-secret-123";

  // ----------------------------
  // MAIN MENU (2 OPTIONS ONLY)
  // ----------------------------
  if (mode === "menu") {
    return (
      <div style={{ textAlign: "center" }}>
        <h1>Game Lobby</h1>

        <button
          style={{ fontSize: "20px", margin: "10px" }}
          onClick={() => setMode("join")}
        >
          🎮 JOIN GAME
        </button>

        <button
          style={{ fontSize: "20px", margin: "10px" }}
          onClick={() => setMode("hub")}
        >
          🔐 HUB ACCESS
        </button>
      </div>
    );
  }

  // ----------------------------
  // JOIN GAME (TEAM SELECT)
  // ----------------------------
  if (mode === "join") {
    return (
      <div style={{ textAlign: "center" }}>
        <h2>Join Game</h2>

        <p>Select Team (1–4)</p>

        <input
          value={teamInput}
          onChange={(e) => setTeamInput(e.target.value)}
          placeholder="Enter team number"
        />

        <br />

        <button
          onClick={() => {
            const t = Number(teamInput);

            if (t >= 1 && t <= 4) {
              setTeam(t);
              goGame();
            } else {
              alert("Pick team 1–4");
            }
          }}
        >
          Enter Game
        </button>

        <br />

        <button onClick={() => setMode("menu")}>
          Back
        </button>
      </div>
    );
  }

  // ----------------------------
  // HUB ACCESS (SIMPLE GATE)
  // ----------------------------
  return (
    <HubAccess
      goHub={goHub}
      goBack={() => setMode("menu")}
    />
  );
}