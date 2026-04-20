import { useEffect, useState } from "react";
import { supabase } from "../supabase";
import Toast from "./Toast";

export default function Hub({ team, goGame }) {
  const [teams, setTeams] = useState([]);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("checking");
  const [timeLeft, setTimeLeft] = useState(6 * 60);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameEnded, setGameEnded] = useState(false);
  const [toast, setToast] = useState(null);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60).toString().padStart(2, "0");
    const secs = (seconds % 60).toString().padStart(2, "0");
    return `${minutes}:${secs}`;
  };

  // ----------------------------
  // FETCH TEAM STATUS
  // ----------------------------
  const fetchTeams = async () => {
    const { data, error } = await supabase
      .from("game_state")
      .select("*")
      .order("team");

    if (error) {
      console.error("Supabase fetchTeams failed", error);
      setError(error.message);
      setStatus("offline");
      return;
    }

    setError("");
    setStatus("online");
    setTeams(data || []);
  };

  const fetchControl = async () => {
    const { data, error } = await supabase
      .from("game_control")
      .select("started")
      .eq("id", 1)
      .single();

    if (error) {
      console.error("Supabase fetchControl failed", error);
      setError(error.message);
      setStatus("offline");
      return;
    }

    setError("");
    setStatus("online");
    const startedFlag = data?.started ?? false;
    setGameStarted(startedFlag);
  };

  useEffect(() => {
    fetchTeams();
    fetchControl();

    const interval = setInterval(() => {
      fetchTeams();
      fetchControl();
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!gameStarted || gameEnded) return;

    const timer = setInterval(() => {
      setTimeLeft((seconds) => {
        const next = Math.max(0, seconds - 1);
        if (next <= 0) {
          setGameEnded(true);
          setGameStarted(false);
          supabase
            .from("game_control")
            .update({ started: false })
            .eq("id", 1)
            .catch((err) => console.error("Supabase endGame failed", err));
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameStarted, gameEnded]);

  useEffect(() => {
    if (!gameStarted && timeLeft < 6 * 60 && !gameEnded) {
      setGameEnded(true);
    }
  }, [gameStarted, timeLeft, gameEnded]);

  // ----------------------------
  // CHECK IF ALL READY
  // ----------------------------
  const allReady =
    teams.length === 4 && teams.every(t => t.ready);

  const leaderboard = teams
    .slice()
    .sort((a, b) => (b.score || 0) - (a.score || 0));

  // ----------------------------
  // START GAME (sets global flag)
  // ----------------------------
  const showToast = (message, type = "info") => {
    setToast({ message, type });
  };

  const startGame = async () => {
    if (!allReady || starting || gameStarted) return;

    setStarting(true);

    const { error } = await supabase
      .from("game_control")
      .update({ started: true })
      .eq("id", 1);

    if (error) {
      console.error("Supabase startGame failed", error);
      setError(error.message);
      showToast("Unable to start game. Check connection.", "error");
      setStarting(false);
      return;
    }

    setError("");
    setGameStarted(true);
    setGameEnded(false);
    setTimeLeft(6 * 60);
    showToast("Match started. Hub timer is live.", "success");
    setStarting(false);
  };

  // ----------------------------
  // UI
  // ----------------------------
  return (
    <div>
      <Toast
        message={toast?.message}
        type={toast?.type}
        onDismiss={() => setToast(null)}
      />
      <h2>🎮 Game Hub</h2>

      <p>Timer: {formatTime(timeLeft)}</p>
      <p>
        Status: {gameEnded ? "Match ended" : gameStarted ? "Match live" : "Waiting to start"}
      </p>
      <p>
        Supabase: {status === "checking" ? "Checking..." : status === "online" ? "Online" : "Offline"}
      </p>

      {error && (
        <p style={{ color: "#ff7f7f", margin: "12px 0" }}>
          Error: {error}
        </p>
      )}

      <p>Current Team: {team ?? "unknown"}</p>

      <h3>Leaderboard</h3>
      {leaderboard.length ? (
        <div>
          {leaderboard.map((t, index) => (
            <div key={t.team} style={{ marginBottom: 8 }}>
              #{index + 1} Team {t.team}: {t.score ?? 0} pts {t.ready ? "🟢" : "🔴"}
            </div>
          ))}
        </div>
      ) : (
        <p>No teams found yet.</p>
      )}

      <hr />

      <button
        onClick={startGame}
        disabled={!allReady || starting || gameStarted}
      >
        {starting
          ? "Starting..."
          : gameStarted
          ? "Match live"
          : allReady
          ? "Start Game"
          : "Waiting for all teams"}
      </button>
    </div>
  );
}