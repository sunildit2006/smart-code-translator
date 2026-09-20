import { useState } from "react";
import toast from "react-hot-toast";

import CodeEditor from "../components/CodeEditor.jsx";
import OutputPanel from "../components/OutputPanel.jsx";
import LanguageSelector from "../components/LanguageSelector.jsx";

import {
  STARTER_CODE,
} from "../constants/languages.js";

import {
  translateCode,
  analyzeComplexity,
  optimizeCode,
  explainCode,
} from "../services/codeService.js";

const ACTIONS = [
  "translate",
  "analyze",
  "optimize",
  "explain",
];

function HomePage() {
  const [code, setCode] = useState(
    STARTER_CODE.python
  );

  const [sourceLanguage, setSourceLanguage] =
    useState("python");

  const [targetLanguage, setTargetLanguage] =
    useState("java");

  const [activeAction, setActiveAction] =
    useState("translate");

  const [result, setResult] = useState(null);

  const [loading, setLoading] = useState(false);

  const [copied, setCopied] = useState(false);

  const handleSourceLanguageChange = (language) => {
    setSourceLanguage(language);

    if (STARTER_CODE[language]) {
      setCode(STARTER_CODE[language]);
    }

    setResult(null);
  };

  const handleSwap = () => {
    const oldSource = sourceLanguage;

    setSourceLanguage(targetLanguage);
    setTargetLanguage(oldSource);

    if (result?.translatedCode) {
      setCode(result.translatedCode);
      setResult(null);
    } else if (STARTER_CODE[targetLanguage]) {
      setCode(STARTER_CODE[targetLanguage]);
      setResult(null);
    }
  };

  const handleCopy = async () => {
    let textToCopy = "";

    if (activeAction === "translate") {
      textToCopy = result?.translatedCode || "";
    } else if (activeAction === "optimize") {
      textToCopy = result?.optimizedCode || "";
    } else if (activeAction === "analyze") {
      textToCopy = result
        ? `Time: ${result.timeComplexity}\nSpace: ${result.spaceComplexity}\n\n${result.explanation || ""}`
        : "";
    } else if (activeAction === "explain") {
      textToCopy = result?.explanation || "";
    }

    if (!textToCopy) {
      toast.error("Nothing to copy.");
      return;
    }

    try {
      await navigator.clipboard.writeText(textToCopy);

      setCopied(true);
      toast.success("Copied!");

      setTimeout(() => {
        setCopied(false);
      }, 1500);
    } catch {
      toast.error("Failed to copy.");
    }
  };

  const handleRun = async () => {
    if (!code.trim()) {
      toast.error("Please write some code first.");
      return;
    }

    if (!sourceLanguage) {
      toast.error("Select a source language.");
      return;
    }

    if (
      activeAction === "translate" &&
      !targetLanguage
    ) {
      toast.error("Select a target language.");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const functions = {
        translate: () =>
          translateCode(
            code,
            sourceLanguage,
            targetLanguage
          ),

        analyze: () =>
          analyzeComplexity(
            code,
            sourceLanguage
          ),

        optimize: () =>
          optimizeCode(
            code,
            sourceLanguage
          ),

        explain: () =>
          explainCode(
            code,
            sourceLanguage
          ),
      };

      const response =
        await functions[activeAction]();

      setResult(response);

      toast.success("Done!");
    } catch (error) {
      console.error(error);

      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="home-page">
      <div className="home-header">
        <div>
          <h1>Smart Code Translator</h1>
          <p>
            Translate, analyze, optimize and
            explain your code with AI.
          </p>
        </div>
      </div>

      <div className="action-toolbar">
        <div className="action-tabs">
          {ACTIONS.map((action) => (
            <button
              key={action}
              className={
                activeAction === action
                  ? "action-tab active"
                  : "action-tab"
              }
              onClick={() => {
                setActiveAction(action);
                setResult(null);
              }}
            >
              {action.charAt(0).toUpperCase() +
                action.slice(1)}
            </button>
          ))}
        </div>

        <button
          className="run-button"
          onClick={handleRun}
          disabled={loading}
        >
          {loading ? "Running..." : "Run"}
        </button>
      </div>

      <div className="translator-container">
        <section className="code-panel">
          <div className="panel-header">
            <div className="panel-title">
              Source Code
            </div>

            <LanguageSelector
              value={sourceLanguage}
              onChange={
                handleSourceLanguageChange
              }
              disabled={loading}
            />
          </div>

          <div className="editor-container">
            <CodeEditor
              code={code}
              onChange={setCode}
              language={sourceLanguage}
            />
          </div>
        </section>

        <section className="code-panel">
          <div className="panel-header">
            <div className="panel-title">
              {activeAction === "translate"
                ? "Translated Code"
                : "AI Output"}
            </div>

            {activeAction === "translate" && (
              <div className="target-controls">
                <LanguageSelector
                  value={targetLanguage}
                  onChange={(value) => {
                    setTargetLanguage(value);
                    setResult(null);
                  }}
                  disabled={loading}
                />

                <button
                  className="swap-button"
                  onClick={handleSwap}
                  disabled={loading}
                  title="Swap languages"
                >
                  ⇄
                </button>
              </div>
            )}

            {result && (
              <button
                className="copy-button"
                onClick={handleCopy}
              >
                {copied ? "Copied" : "Copy"}
              </button>
            )}
          </div>

          <div className="editor-container">
            <OutputPanel
              result={result}
              action={activeAction}
              targetLanguage={targetLanguage}
            />
          </div>
        </section>
      </div>
    </main>
  );
}

export default HomePage;