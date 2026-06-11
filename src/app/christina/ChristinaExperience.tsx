"use client";

import { useState } from "react";
import { Mic, MicOff, Sparkles, Volume2 } from "lucide-react";

type SpeechRecognitionEventLike = {
  results: ArrayLike<ArrayLike<{ transcript: string }>>;
};

type SpeechRecognitionLike = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
};

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

const prompts = [
  "How can I make a first-time guest feel welcome?",
  "Help me improve the arrival experience at my restaurant.",
  "What should I say after a customer has a disappointing visit?"
];

function guidanceFor(question: string): string {
  const normalized = question.toLowerCase();

  if (normalized.includes("complaint") || normalized.includes("disappoint") || normalized.includes("upset")) {
    return "Begin by listening without interruption. Thank the guest for telling you, name what went wrong plainly, and offer one immediate next step. The goal is not only to fix the issue, but to help the person feel respected.";
  }

  if (normalized.includes("restaurant") || normalized.includes("arrival") || normalized.includes("first-time")) {
    return "Make the first thirty seconds feel effortless: acknowledge the guest quickly, explain what happens next, and notice one small preference you can remember. A warm arrival creates trust before the meal or service begins.";
  }

  if (normalized.includes("team") || normalized.includes("staff") || normalized.includes("employee")) {
    return "Give the team one hospitality habit to practice each shift: notice, name, and act. Notice what a guest may need, name it with care, then act before they have to ask twice.";
  }

  return "Start by asking what would make this person feel comfortable right now. Listen for the emotion beneath the request, then offer one clear and thoughtful next step. Excellent service feels personal because it is attentive.";
}

export function ChristinaExperience() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState(
    "Ask Christina about a guest, restaurant, or customer-experience moment."
  );
  const [listening, setListening] = useState(false);
  const [voiceMessage, setVoiceMessage] = useState("");

  function ask(value = question) {
    const clean = value.trim();
    if (!clean) return;
    setQuestion(clean);
    setAnswer(guidanceFor(clean));
  }

  function speak() {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(answer);
    utterance.rate = 0.95;
    utterance.pitch = 1.02;
    window.speechSynthesis.speak(utterance);
  }

  function toggleListening() {
    if (listening) {
      setListening(false);
      return;
    }

    const voiceWindow = window as typeof window & {
      SpeechRecognition?: SpeechRecognitionConstructor;
      webkitSpeechRecognition?: SpeechRecognitionConstructor;
    };
    const Recognition = voiceWindow.SpeechRecognition ?? voiceWindow.webkitSpeechRecognition;

    if (!Recognition) {
      setVoiceMessage("Voice input is not supported in this browser. You can type your question below.");
      return;
    }

    const recognition = new Recognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.continuous = false;
    recognition.onresult = (event) => {
      const transcript = event.results[0]?.[0]?.transcript ?? "";
      setQuestion(transcript);
      ask(transcript);
    };
    recognition.onend = () => setListening(false);
    recognition.onerror = () => {
      setListening(false);
      setVoiceMessage("I could not hear that clearly. Please try again or type your question.");
    };

    setVoiceMessage("Your browser will ask permission to use the microphone. Audio is not stored.");
    setListening(true);
    recognition.start();
  }

  return (
    <section className="christina-console" aria-labelledby="ask-christina">
      <div className="christina-console-copy">
        <span className="christina-eyebrow"><Sparkles aria-hidden="true" /> Voice-led hospitality guide</span>
        <h2 id="ask-christina">Ask Christina</h2>
        <p>
          Bring a real customer-experience moment. Christina turns it into one warm,
          practical next step.
        </p>
        <div className="christina-prompts">
          {prompts.map((prompt) => (
            <button key={prompt} onClick={() => ask(prompt)} type="button">
              {prompt}
            </button>
          ))}
        </div>
      </div>

      <div className="christina-assistant">
        <div className="christina-answer">
          <span>Christina&apos;s guidance</span>
          <p>{answer}</p>
          <button className="christina-listen" onClick={speak} type="button">
            <Volume2 aria-hidden="true" /> Listen to guidance
          </button>
        </div>

        <div className="christina-input">
          <label htmlFor="christina-question">What would you like to improve?</label>
          <textarea
            id="christina-question"
            onChange={(event) => setQuestion(event.target.value)}
            placeholder="Tell Christina about the guest experience..."
            value={question}
          />
          <div className="christina-actions">
            <button className="christina-ask" onClick={() => ask()} type="button">
              Ask Christina
            </button>
            <button
              aria-pressed={listening}
              className="christina-mic"
              onClick={toggleListening}
              type="button"
            >
              {listening ? <MicOff aria-hidden="true" /> : <Mic aria-hidden="true" />}
              {listening ? "Listening..." : "Use voice"}
            </button>
          </div>
          {voiceMessage && <p className="christina-voice-note">{voiceMessage}</p>}
        </div>
      </div>
    </section>
  );
}
