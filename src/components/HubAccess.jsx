import { useState } from "react";
import Hub from "./Hub";

const HUB_KEY = "my-secret-123";

export default function HubAccess({ team, goBack, goGame }) {
  const [key, setKey] = useState("");
  const [ok, setOk] = useState(false);

  if (!ok) {
    return (
      <div className="card hub-access">
        <h2>🔐 Hub Access</h2>

        <div className="prompt-row">
          <span className="prompt-label">root@quiz:~$</span>
          <input
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder="admin-key"
          />
        </div>

        <div className="button-group">
          <button
            className="primary-button"
            onClick={() => {
              if (key === HUB_KEY) setOk(true);
              else alert("Wrong key");
            }}
          >
            Enter Hub
          </button>

          <button
            className="secondary-button"
            onClick={goGame}
          >
            Continue to Play
          </button>

          <button
            className="secondary-button"
            onClick={goBack}
          >
            Back
          </button>
        </div>
      </div>
    );
  }

  return <Hub team={team} goGame={goGame} />;
}