"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Calculator,
  Divide,
  Equal,
  History,
  MemoryStick,
  Pi,
  RotateCcw,
  Sigma,
  SquareRadical,
} from "lucide-react";

type AngleMode = "DEG" | "RAD";
type TokenType = "number" | "operator" | "function" | "constant" | "leftParen" | "rightParen";

type Token = {
  type: TokenType;
  value: string;
};

type HistoryItem = {
  expression: string;
  result: string;
};

const functionNames = new Set(["sin", "cos", "tan", "asin", "acos", "atan", "sqrt", "ln", "log", "abs"]);
const constantValues: Record<string, number> = {
  pi: Math.PI,
  e: Math.E,
};

const operatorMeta: Record<string, { precedence: number; associativity: "left" | "right"; arity: 1 | 2 }> = {
  "+": { precedence: 2, associativity: "left", arity: 2 },
  "-": { precedence: 2, associativity: "left", arity: 2 },
  "*": { precedence: 3, associativity: "left", arity: 2 },
  "/": { precedence: 3, associativity: "left", arity: 2 },
  "^": { precedence: 4, associativity: "right", arity: 2 },
  "neg": { precedence: 5, associativity: "right", arity: 1 },
  "!": { precedence: 6, associativity: "left", arity: 1 },
  "%": { precedence: 6, associativity: "left", arity: 1 },
};

const primaryButtons = [
  "7", "8", "9", "÷", "sin", "cos",
  "4", "5", "6", "×", "tan", "√",
  "1", "2", "3", "-", "ln", "log",
  "0", ".", "(", ")", "+", "^",
] as const;

const quickExamples = [
  "sin(30)+cos(60)",
  "sqrt(144)+3^2",
  "log(1000)+ln(e)",
  "5!/(3!*2!)",
];

function tokenize(input: string): Token[] {
  const normalized = input
    .replaceAll("×", "*")
    .replaceAll("÷", "/")
    .replaceAll("π", "pi")
    .replaceAll("√", "sqrt");
  const tokens: Token[] = [];
  let index = 0;

  while (index < normalized.length) {
    const character = normalized[index];

    if (/\s/.test(character)) {
      index += 1;
      continue;
    }

    if (/\d|\./.test(character)) {
      let value = character;
      index += 1;
      while (index < normalized.length && /[\d.]/.test(normalized[index])) {
        value += normalized[index];
        index += 1;
      }
      if ((value.match(/\./g) ?? []).length > 1) {
        throw new Error("Too many decimal points");
      }
      tokens.push({ type: "number", value });
      continue;
    }

    if (/[a-z]/i.test(character)) {
      let value = character.toLowerCase();
      index += 1;
      while (index < normalized.length && /[a-z]/i.test(normalized[index])) {
        value += normalized[index].toLowerCase();
        index += 1;
      }

      if (functionNames.has(value)) {
        tokens.push({ type: "function", value });
      } else if (value in constantValues) {
        tokens.push({ type: "constant", value });
      } else {
        throw new Error(`Unknown token: ${value}`);
      }
      continue;
    }

    if (character === "(") {
      tokens.push({ type: "leftParen", value: character });
      index += 1;
      continue;
    }

    if (character === ")") {
      tokens.push({ type: "rightParen", value: character });
      index += 1;
      continue;
    }

    if ("+-*/^!%".includes(character)) {
      const previous = tokens.at(-1);
      const unaryMinus =
        character === "-" &&
        (!previous || previous.type === "operator" || previous.type === "leftParen" || previous.type === "function");
      tokens.push({ type: "operator", value: unaryMinus ? "neg" : character });
      index += 1;
      continue;
    }

    throw new Error(`Cannot read: ${character}`);
  }

  return tokens;
}

function toRpn(tokens: Token[]) {
  const output: Token[] = [];
  const stack: Token[] = [];

  tokens.forEach((token) => {
    if (token.type === "number" || token.type === "constant") {
      output.push(token);
      return;
    }

    if (token.type === "function") {
      stack.push(token);
      return;
    }

    if (token.type === "operator") {
      const current = operatorMeta[token.value];
      if (!current) {
        throw new Error(`Unsupported operator: ${token.value}`);
      }

      while (stack.length) {
        const top = stack.at(-1);
        if (!top || top.type === "leftParen") {
          break;
        }
        if (top.type === "function") {
          output.push(stack.pop() as Token);
          continue;
        }

        const previous = operatorMeta[top.value];
        if (
          previous &&
          (previous.precedence > current.precedence ||
            (previous.precedence === current.precedence && current.associativity === "left"))
        ) {
          output.push(stack.pop() as Token);
          continue;
        }
        break;
      }

      stack.push(token);
      return;
    }

    if (token.type === "leftParen") {
      stack.push(token);
      return;
    }

    if (token.type === "rightParen") {
      while (stack.length && stack.at(-1)?.type !== "leftParen") {
        output.push(stack.pop() as Token);
      }
      if (!stack.length) {
        throw new Error("Mismatched parentheses");
      }
      stack.pop();
      if (stack.at(-1)?.type === "function") {
        output.push(stack.pop() as Token);
      }
    }
  });

  while (stack.length) {
    const token = stack.pop() as Token;
    if (token.type === "leftParen" || token.type === "rightParen") {
      throw new Error("Mismatched parentheses");
    }
    output.push(token);
  }

  return output;
}

function factorial(value: number) {
  if (!Number.isInteger(value) || value < 0 || value > 170) {
    throw new Error("Factorial needs a whole number from 0 to 170");
  }
  let total = 1;
  for (let step = 2; step <= value; step += 1) {
    total *= step;
  }
  return total;
}

function applyFunction(name: string, value: number, angleMode: AngleMode) {
  const radians = angleMode === "DEG" ? (value * Math.PI) / 180 : value;
  const inverseScale = angleMode === "DEG" ? 180 / Math.PI : 1;

  switch (name) {
    case "sin":
      return Math.sin(radians);
    case "cos":
      return Math.cos(radians);
    case "tan":
      return Math.tan(radians);
    case "asin":
      return Math.asin(value) * inverseScale;
    case "acos":
      return Math.acos(value) * inverseScale;
    case "atan":
      return Math.atan(value) * inverseScale;
    case "sqrt":
      if (value < 0) throw new Error("Square root needs a non-negative number");
      return Math.sqrt(value);
    case "ln":
      if (value <= 0) throw new Error("ln needs a positive number");
      return Math.log(value);
    case "log":
      if (value <= 0) throw new Error("log needs a positive number");
      return Math.log10(value);
    case "abs":
      return Math.abs(value);
    default:
      throw new Error(`Unknown function: ${name}`);
  }
}

function evaluateExpression(input: string, angleMode: AngleMode) {
  const stack: number[] = [];

  toRpn(tokenize(input)).forEach((token) => {
    if (token.type === "number") {
      const value = Number(token.value);
      if (!Number.isFinite(value)) throw new Error("Invalid number");
      stack.push(value);
      return;
    }

    if (token.type === "constant") {
      stack.push(constantValues[token.value]);
      return;
    }

    if (token.type === "function") {
      const value = stack.pop();
      if (value === undefined) throw new Error("Missing function input");
      stack.push(applyFunction(token.value, value, angleMode));
      return;
    }

    if (token.type === "operator") {
      const meta = operatorMeta[token.value];
      if (meta.arity === 1) {
        const value = stack.pop();
        if (value === undefined) throw new Error("Missing operator input");
        if (token.value === "neg") stack.push(-value);
        if (token.value === "!") stack.push(factorial(value));
        if (token.value === "%") stack.push(value / 100);
        return;
      }

      const right = stack.pop();
      const left = stack.pop();
      if (left === undefined || right === undefined) throw new Error("Missing operator input");

      switch (token.value) {
        case "+":
          stack.push(left + right);
          return;
        case "-":
          stack.push(left - right);
          return;
        case "*":
          stack.push(left * right);
          return;
        case "/":
          if (right === 0) throw new Error("Cannot divide by zero");
          stack.push(left / right);
          return;
        case "^":
          stack.push(left ** right);
          return;
        default:
          throw new Error(`Unknown operator: ${token.value}`);
      }
    }
  });

  if (stack.length !== 1 || !Number.isFinite(stack[0])) {
    throw new Error("Expression is incomplete");
  }

  return stack[0];
}

function formatResult(value: number) {
  if (Math.abs(value) < 1e-12) return "0";
  if (Math.abs(value) >= 1e12 || (Math.abs(value) < 1e-6 && value !== 0)) {
    return value.toExponential(8).replace(/\.?0+e/, "e");
  }
  return Number(value.toPrecision(12)).toString();
}

export function CalculatorExperience() {
  const [expression, setExpression] = useState("sin(30)+cos(60)");
  const [angleMode, setAngleMode] = useState<AngleMode>("DEG");
  const [memory, setMemory] = useState(0);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [error, setError] = useState("");

  const preview = useMemo(() => {
    if (!expression.trim()) return "0";
    try {
      return formatResult(evaluateExpression(expression, angleMode));
    } catch {
      return "Ready";
    }
  }, [angleMode, expression]);

  const append = (value: string) => {
    setError("");
    setExpression((current) => `${current}${value}`);
  };

  const evaluate = () => {
    try {
      const result = formatResult(evaluateExpression(expression, angleMode));
      setHistory((items) => [{ expression, result }, ...items].slice(0, 8));
      setExpression(result);
      setError("");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not evaluate");
    }
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (/[\d()+\-*/^.!%]/.test(event.key)) {
        event.preventDefault();
        append(event.key);
      }
      if (event.key === "Enter") {
        event.preventDefault();
        evaluate();
      }
      if (event.key === "Backspace") {
        event.preventDefault();
        setExpression((current) => current.slice(0, -1));
      }
      if (event.key === "Escape") {
        event.preventDefault();
        setExpression("");
        setError("");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  const handleButton = (button: string) => {
    const inserts: Record<string, string> = {
      "÷": "÷",
      "×": "×",
      "√": "sqrt(",
      sin: "sin(",
      cos: "cos(",
      tan: "tan(",
      ln: "ln(",
      log: "log(",
    };
    append(inserts[button] ?? button);
  };

  return (
    <main className="uni-calc">
      <section className="uni-calc-shell">
        <div className="uni-calc-header">
          <Link href="/" className="uni-calc-brand">
            <Calculator aria-hidden="true" />
            ideamuses
          </Link>
          <div className="uni-calc-mode" aria-label="Angle mode">
            <button className={angleMode === "DEG" ? "active" : ""} onClick={() => setAngleMode("DEG")} type="button">
              DEG
            </button>
            <button className={angleMode === "RAD" ? "active" : ""} onClick={() => setAngleMode("RAD")} type="button">
              RAD
            </button>
          </div>
        </div>

        <div className="uni-calc-layout">
          <section className="uni-calc-panel" aria-label="Scientific calculator">
            <div className="uni-calc-display">
              <div className="uni-calc-display-top">
                <span>Scientific</span>
                <span>{angleMode}</span>
              </div>
              <input
                aria-label="Expression"
                value={expression}
                onChange={(event) => {
                  setExpression(event.target.value);
                  setError("");
                }}
                spellCheck={false}
              />
              <div className={error ? "uni-calc-result error" : "uni-calc-result"}>
                {error || preview}
              </div>
            </div>

            <div className="uni-calc-tools">
              <button type="button" onClick={() => setExpression("")}>
                AC
              </button>
              <button type="button" onClick={() => setExpression((current) => current.slice(0, -1))}>
                DEL
              </button>
              <button type="button" onClick={() => append("π")}>
                <Pi aria-hidden="true" /> pi
              </button>
              <button type="button" onClick={() => append("e")}>
                e
              </button>
              <button type="button" onClick={() => append("!")}>
                n!
              </button>
              <button type="button" onClick={() => append("%")}>
                %
              </button>
            </div>

            <div className="uni-calc-grid">
              {primaryButtons.map((button) => (
                <button
                  className={/[÷×+\-^]/.test(button) ? "operator" : /sin|cos|tan|ln|log|√/.test(button) ? "function" : ""}
                  key={button}
                  onClick={() => handleButton(button)}
                  type="button"
                >
                  {button}
                </button>
              ))}
              <button className="function" type="button" onClick={() => append("asin(")}>
                sin⁻¹
              </button>
              <button className="function" type="button" onClick={() => append("acos(")}>
                cos⁻¹
              </button>
              <button className="function" type="button" onClick={() => append("atan(")}>
                tan⁻¹
              </button>
              <button className="function" type="button" onClick={() => append("abs(")}>
                |x|
              </button>
              <button className="memory" type="button" onClick={() => setMemory(Number(preview) || memory)}>
                MS
              </button>
              <button className="memory" type="button" onClick={() => append(formatResult(memory))}>
                MR
              </button>
            </div>

            <button className="uni-calc-equals" type="button" onClick={evaluate}>
              <Equal aria-hidden="true" />
              Evaluate
            </button>
          </section>

          <aside className="uni-calc-side">
            <div className="uni-calc-visual">
              <div className="uni-calc-axis x" />
              <div className="uni-calc-axis y" />
              <div className="uni-calc-curve" />
              <div className="uni-calc-point one" />
              <div className="uni-calc-point two" />
              <div className="uni-calc-point three" />
            </div>

            <div className="uni-calc-card">
              <div className="uni-calc-card-title">
                <Sigma aria-hidden="true" />
                Try these
              </div>
              <div className="uni-calc-examples">
                {quickExamples.map((example) => (
                  <button key={example} type="button" onClick={() => setExpression(example)}>
                    {example}
                  </button>
                ))}
              </div>
            </div>

            <div className="uni-calc-card">
              <div className="uni-calc-card-title">
                <MemoryStick aria-hidden="true" />
                Memory
              </div>
              <div className="uni-calc-memory-row">
                <strong>{formatResult(memory)}</strong>
                <button type="button" onClick={() => setMemory(0)}>
                  <RotateCcw aria-hidden="true" />
                </button>
              </div>
            </div>

            <div className="uni-calc-card">
              <div className="uni-calc-card-title">
                <History aria-hidden="true" />
                History
              </div>
              <div className="uni-calc-history">
                {history.length ? history.map((item) => (
                  <button key={`${item.expression}-${item.result}`} type="button" onClick={() => setExpression(item.expression)}>
                    <span>{item.expression}</span>
                    <strong>{item.result}</strong>
                  </button>
                )) : <p>No completed calculations yet.</p>}
              </div>
            </div>
          </aside>
        </div>

        <section className="uni-calc-footer-band">
          <div>
            <SquareRadical aria-hidden="true" />
            <span>Trig, logs, powers, roots, factorials, percentages, constants, memory, and clean keyboard entry.</span>
          </div>
          <div>
            <Divide aria-hidden="true" />
            <span>Built for classroom speed: fewer menus, larger buttons, and exact expression history.</span>
          </div>
        </section>
      </section>
    </main>
  );
}
