"use client";

import { Suspense, useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Play, Trash2, Terminal } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { CodeEditor } from "@/components/code-editor";
import { LanguagePicker } from "@/components/language-picker";
import { LANGUAGES, toLanguage, type LanguageId } from "@/lib/languages";

interface RunResult {
  statusId: number;
  statusDescription: string;
  stdout: string;
  stderr: string;
  compile_output: string;
  runtime_ms: number | null;
  memory_kb: number | null;
  exit_code: number | null;
}

export default function IdePage() {
  // useSearchParams needs a Suspense boundary in the app router.
  return (
    <Suspense fallback={null}>
      <Ide />
    </Suspense>
  );
}

function Ide() {
  const t = useTranslations("ide");
  const tCommon = useTranslations("common");
  const params = useSearchParams();
  // Lessons link here with ?code=… and ?lang=… so the example opens ready to run.
  const initialLanguage = toLanguage(params.get("lang"));
  const [language, setLanguage] = useState<LanguageId>(initialLanguage);
  const initialCode = params.get("code") || LANGUAGES[initialLanguage].starter;
  const [code, setCode] = useState(initialCode);

  // Switching language swaps in that language's starter, unless the student
  // has written something of their own.
  const changeLanguage = (next: LanguageId) => {
    setCode((current) =>
      current.trim() === "" ||
      current === LANGUAGES[language].starter ||
      current === initialCode
        ? LANGUAGES[next].starter
        : current,
    );
    setLanguage(next);
    setResult(null);
  };
  const [stdin, setStdin] = useState("");
  const [result, setResult] = useState<RunResult | null>(null);
  const [pending, startTransition] = useTransition();

  const handleRun = () => {
    startTransition(async () => {
      const res = await fetch("/api/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, stdin, language }),
      });
      if (!res.ok) {
        if (res.status === 429) {
          toast.error("Rate limited. Try again in a minute.");
        } else {
          toast.error(tCommon("error"));
        }
        return;
      }
      const data = (await res.json()) as RunResult;
      setResult(data);
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between">
        <div>
          <div className="hud-label flex items-center gap-2">
            <span className="text-primary">//</span>
            SANDBOX
          </div>
          <h1 className="text-2xl font-bold">{t("title")}</h1>
          <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <LanguagePicker
            value={language}
            onChange={changeLanguage}
            disabled={pending}
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setCode(LANGUAGES[language].starter);
              setStdin("");
              setResult(null);
            }}
          >
            <Trash2 className="mr-1.5 h-4 w-4" />
            {t("clear")}
          </Button>
          <Button
            onClick={handleRun}
            disabled={pending}
            className="font-code"
            size="sm"
          >
            <Play className="mr-1.5 h-4 w-4" />
            {pending ? t("running") : t("run")}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 overflow-hidden">
          <div className="h-[500px]">
            <CodeEditor value={code} onChange={setCode} language={language} />
          </div>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">{t("stdin")}</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={stdin}
                onChange={(e) => setStdin(e.target.value)}
                placeholder=""
                className="font-mono text-sm min-h-[140px]"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Terminal className="h-4 w-4" />
                {t("stdout")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="min-h-[80px] whitespace-pre-wrap break-all rounded border border-primary/15 bg-[var(--surface-code)] p-2.5 font-mono text-sm text-neon-lime">
                {result?.compile_output && (
                  <span className="text-neon-violet">
                    {result.compile_output}
                  </span>
                )}
                {result?.stdout}
                {result?.stderr && (
                  <span className="text-destructive">
                    {"\n" + result.stderr}
                  </span>
                )}
                {!result && (
                  <span className="text-muted-foreground/60">
                    {LANGUAGES[language].comment + " " + (pending ? t("running") : t("run"))}
                  </span>
                )}
              </pre>
              {result && (
                <p className="text-xs text-muted-foreground mt-2 tabular-nums">
                  {result.statusDescription}
                  {result.runtime_ms !== null && ` · ${result.runtime_ms}ms`}
                  {result.memory_kb !== null && ` · ${result.memory_kb}KB`}
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
