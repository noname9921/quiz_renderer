import { useEffect, useState } from "react";
import { supabase } from "./supabase";
import quiz from "./quiz.json";
import Toast from "./components/Toast";

export default function TeamGame({ team }) {
  const [ready, setReady] = useState(false);
  const [loadingReady, setLoadingReady] = useState(true);
  const [readyError, setReadyError] = useState("");
  const [scoreError, setScoreError] = useState("");
  const [started, setStarted] = useState(false);
  const [toast, setToast] = useState(null);

  const [questionIndex, setQuestionIndex] = useState(
    Math.floor(Math.random() * quiz.length)
  );

  const [point, setPoint] = useState(0);

  const currentQuestion = quiz[questionIndex];

  // ----------------------------
  // TOGGLE READY STATE
  // ----------------------------
  const toggleReady = async () => {
    const newState = !ready;
    setLoadingReady(true);
    setReadyError("");

    const { error } = await supabase
      .from("game_state")
      .update({ ready: newState })
      .eq("team", team);

    if (error) {
      console.error("Supabase toggleReady failed", error);
      setReadyError(error.message);
      alert("Unable to update ready state: " + error.message);
      setReady((prev) => prev);
    } else {
      setReady(newState);
    }

    setLoadingReady(false);
  };

  // ----------------------------
  // LOAD TEAM READY STATE
  // ----------------------------
  useEffect(() => {
    const fetchReadyState = async () => {
      if (!team) return;
      setLoadingReady(true);
      setReadyError("");

      const { data, error } = await supabase
        .from("game_state")
        .select("ready")
        .eq("team", team)
        .single();

      if (error) {
        console.error("Supabase fetchReadyState failed", error);
        setReadyError(error.message);
        setLoadingReady(false);
        return;
      }

      setReady(data?.ready ?? false);
      setLoadingReady(false);
    };

    fetchReadyState();
  }, [team]);

  // ----------------------------
  // LISTEN FOR GAME START
  // ----------------------------
  useEffect(() => {
    const fetchStart = async () => {
      const { data } = await supabase
        .from("game_control")
        .select("started")
        .eq("id", 1)
        .single();

      setStarted(data.started);
    };

    fetchStart();

    const interval = setInterval(fetchStart, 1000);
    return () => clearInterval(interval);
  }, []);

  // ----------------------------
  // ANSWER QUESTION
  // ----------------------------
  const showToast = (message, type = "info") => {
    setToast({ message, type });
  };

  const answer = async (isCorrect) => {
    const newPoint = Math.max(0, point + (isCorrect ? 1 : -3));
    setPoint(newPoint);
    setQuestionIndex(Math.floor(Math.random() * quiz.length));
    setScoreError("");
    showToast(
      isCorrect ? "Correct! Score updated." : "Wrong answer — penalty applied.",
      isCorrect ? "success" : "error"
    );

    const { error } = await supabase
      .from("game_state")
      .update({ score: newPoint })
      .eq("team", team);

    if (error) {
      console.error("Supabase score update failed", error);
      setScoreError(error.message);
      showToast("Score sync failed. Try again.", "error");
    }
  };

  // ----------------------------
  // LOBBY SCREEN (NOT STARTED)
  // ----------------------------
  if (!started) {
    return (
      <div className="terminal-panel">
        <h2>Team {team}</h2>

        <button
          onClick={toggleReady}
          disabled={loadingReady}
          style={{
            padding: "12px 20px",
            fontSize: "16px",
            background: ready ? "#2efc95" : "#ff3b5c",
            color: "black",
            border: "none",
            cursor: loadingReady ? "not-allowed" : "pointer",
            opacity: loadingReady ? 0.65 : 1
          }}
        >
          {loadingReady
            ? "Syncing..."
            : ready
            ? "READY ✓ (click to unready)"
            : "NOT READY ❌ (click to ready)"}
        </button>

        {readyError && (
          <p style={{ color: "#ff7f7f", margin: "12px 0" }}>
            {readyError}
          </p>
        )}

        <p>Waiting for host to start the game...</p>
      </div>
    );
  }

  // ----------------------------
  // GAME SCREEN
  // ----------------------------
  return (
    <div className="terminal-panel">
      <Toast
        message={toast?.message}
        type={toast?.type}
        onDismiss={() => setToast(null)}
      />
      <h2>Team {team}</h2>

      <p>Score: {point}</p>

      <h3>{currentQuestion.question}</h3>

      <div className="answers">
        {currentQuestion.ans.map((a, i) => {
          const isCorrect = a === currentQuestion.tans;

          return (
            <button
              key={i}
              onClick={() => answer(isCorrect)}
              style={{
                margin: "5px",
                padding: "10px"
              }}
            >
              {a}
            </button>
          );
        })}
      </div>
    </div>
  );
}