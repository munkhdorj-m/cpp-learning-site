"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Play, Trash2, Terminal } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { CodeEditor, STARTER_CPP } from "@/components/code-editor";

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
  const t = useTranslations("ide");
  const tCommon = useTranslations("common");
  const [code, setCode] = useState(STARTER_CPP);
  const [stdin, setStdin] = useState("");
  const [result, setResult] = useState<RunResult | null>(null);
  const [pending, startTransition] = useTransition();

  const handleRun = () => {
    startTransition(async () => {
      const res = await fetch("/api/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, stdin }),
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
          <h1 className="text-2xl font-bold">{t("title")}</h1>
          <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setCode(STARTER_CPP);
              setStdin("");
              setResult(null);
            }}
          >
            <Trash2 className="h-4 w-4 mr-1.5" />
            {t("clear")}
          </Button>
          <Button
            onClick={handleRun}
            disabled={pending}
            className="bg-violet-600 hover:bg-violet-700"
            size="sm"
          >
            <Play className="h-4 w-4 mr-1.5" />
            {pending ? t("running") : t("run")}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 overflow-hidden">
          <div className="h-[500px]">
            <CodeEditor value={code} onChange={setCode} />
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
              <pre className="font-mono text-sm bg-muted rounded p-2 min-h-[80px] whitespace-pre-wrap break-all">
                {result?.compile_output && (
                  <span className="text-purple-700 dark:text-purple-300">
                    {result.compile_output}
                  </span>
                )}
                {result?.stdout}
                {result?.stderr && (
                  <span className="text-rose-700 dark:text-rose-300">
                    {"\n" + result.stderr}
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
