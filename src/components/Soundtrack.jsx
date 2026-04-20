import { useEffect, useRef, useState } from "react";

const EVENT_MESSAGES = {
  Comns_Start:
    "Unusual behavior detected. All personnel are to expect gliches. We are working to investigate and restore communications properly.",
  Comns_End:
    "Communications have been restored. All operations may now resume.",
  Attack_Imminent:
    "Attack imminent. Prepare for defense in 3…2…1. We are now under attack. Please wait for further notice.",
  Defense_Failed:
    "Defense failed. All operations are under lockdown. Personnel within the core chamber must evacuate immediately. All research evidence must be contained. Operations must not resume under any circumstances.",
  Defense_Succeed:
    "Defense successful. All operations may now resume.",
  Core_Corruption:
    "Core corruption detected. All personnel must evacuate the core chamber within 60 seconds. All non-essential personnel must evacuate according to protocol K-5. Within 3 minutes, all personnel must be evacuated from the station according to protocol K-5.",
};

const randomBetween = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const playAudioByName = (name, volume = 0.5) => {
  const audio = new Audio(`/${name}.m4a`);
  audio.preload = "auto";
  audio.volume = volume;
  audio.loop = false;
  audio.play().catch(() => {
    // autoplay restrictions may block this until user interacts.
  });
  return audio;
};

const getRandomSequence = (allowCore = false) => {
  const choices = ["Comns_Start", "Attack_Imminent"];
  if (allowCore) choices.push("Core_Corruption");
  return [choices[Math.floor(Math.random() * choices.length)]];
};

export default function Soundtrack() {
  const bgRef = useRef(null);
  const eventAudioRef = useRef(null);
  const timerRef = useRef(null);
  const followUpRef = useRef(null);
  const sequenceRef = useRef([]);
  const [toasts, setToasts] = useState([]);
  const [timeLeft, setTimeLeft] = useState(6 * 60);

  const showToast = (eventName) => {
    setToasts((current) => [
      {
        id: `${eventName}-${Date.now()}`,
        title: eventName,
        message: EVENT_MESSAGES[eventName] || "",
      },
      ...current.slice(0, 2),
    ]);
  };

  const clearToast = (id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  };

  const scheduleFollowUp = (eventName, minDelay = 6000, maxDelay = 12000) => {
    followUpRef.current = window.setTimeout(() => {
      sequenceRef.current.unshift(eventName);
      if (!eventAudioRef.current) {
        playSequence();
      }
    }, randomBetween(minDelay, maxDelay));
  };

  const scheduleNextSequence = () => {
    const delay = randomBetween(14000, 30000);
    timerRef.current = window.setTimeout(() => {
      sequenceRef.current = getRandomSequence(timeLeft <= 15);
      playSequence();
    }, delay);
  };

  const playSequence = () => {
    const next = sequenceRef.current.shift();
    if (!next) {
      scheduleNextSequence();
      return;
    }

    showToast(next);
    const eventAudio = playAudioByName(next, 0.55);
    eventAudioRef.current = eventAudio;
    eventAudio.onended = () => {
      eventAudioRef.current = null;
      if (next === "Comns_Start") {
        scheduleFollowUp("Comns_End");
      } else if (next === "Attack_Imminent") {
        const defense = Math.random() > 0.5 ? "Defense_Failed" : "Defense_Succeed";
        scheduleFollowUp(defense);
      } else {
        playSequence();
      }
    };
  };

  useEffect(() => {
    const bg = bgRef.current;
    if (!bg) return;

    bg.loop = true;
    bg.preload = "auto";
    bg.volume = 0.35;
    bg.muted = true;

    const playBg = () => {
      bg.play().catch(() => {});
      bg.muted = false;
    };

    playBg();

    const wakeAudio = () => {
      playBg();
      document.removeEventListener("click", wakeAudio);
      document.removeEventListener("keydown", wakeAudio);
    };

    document.addEventListener("click", wakeAudio, { once: true });
    document.addEventListener("keydown", wakeAudio, { once: true });

    scheduleNextSequence();

    return () => {
      document.removeEventListener("click", wakeAudio);
      document.removeEventListener("keydown", wakeAudio);
      window.clearTimeout(timerRef.current);
      window.clearTimeout(followUpRef.current);
      if (eventAudioRef.current) {
        eventAudioRef.current.pause();
        eventAudioRef.current = null;
      }
      bg.pause();
    };
  }, []);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setTimeLeft((current) => Math.max(0, current - 1));
    }, 1000);

    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    if (timeLeft <= 15 && timeLeft > 0 && !sequenceRef.current.includes("Core_Corruption")) {
      window.clearTimeout(timerRef.current);
      sequenceRef.current = ["Core_Corruption"];
      if (!eventAudioRef.current) {
        playSequence();
      }
    }
  }, [timeLeft]);

  return (
    <>
      <audio
        ref={bgRef}
        src="/soundtrack.m4a"
        autoPlay
        preload="auto"
        playsInline
      />
      <div style={{ position: "fixed", bottom: 22, right: 22, zIndex: 9999, width: 340 }}>
        {toasts.map((toast) => (
          <div
            key={toast.id}
            style={{
              marginBottom: 10,
              padding: "14px 16px",
              borderRadius: 12,
              background: "rgba(7, 14, 12, 0.96)",
              border: "1px solid rgba(73, 255, 147, 0.26)",
              color: "#d8ffd8",
              boxShadow: "0 18px 34px rgba(0,0,0,0.25)",
            }}
          >
            <strong style={{ display: "block", marginBottom: 6 }}>{toast.title}</strong>
            <span style={{ fontSize: 13, lineHeight: 1.5, color: "#c8ffc8" }}>{toast.message}</span>
            <button
              onClick={() => clearToast(toast.id)}
              style={{
                marginTop: 10,
                border: "none",
                background: "rgba(255,255,255,0.08)",
                color: "#c8ffc8",
                padding: "6px 10px",
                borderRadius: 8,
                cursor: "pointer",
              }}
            >
              Dismiss
            </button>
          </div>
        ))}
      </div>
    </>
  );
}
