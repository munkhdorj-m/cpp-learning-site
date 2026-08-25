"use client";

import {
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
  useTransition,
} from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Play, Trash2, Terminal, Save, FilePlus2, Folder } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CodeEditor } from "@/components/code-editor";
import { LanguagePicker } from "@/components/language-picker";
import { LANGUAGES, toLanguage, type LanguageId } from "@/lib/languages";
import { MAX_IDE_PROJECTS } from "@/lib/ide-projects";
import { useAuthGate } from "@/lib/auth-gate";

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

interface ProjectSummary {
  id: string;
  name: string;
  language: string;
  updated_at: string;
}

/** Long enough not to write on every keystroke, short enough to feel safe. */
const AUTOSAVE_MS = 2500;

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
  const [stdin, setStdin] = useState("");
  const [result, setResult] = useState<RunResult | null>(null);
  const [pending, startTransition] = useTransition();
  const { handleUnauthorized } = useAuthGate();

  // --- saved work -------------------------------------------------------
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  // Loading a file writes code/stdin/language, which would otherwise look like
  // the student typing and trip the autosave straight back at the server.
  const loadingRef = useRef(false);

  const refreshList = useCallback(async () => {
    const res = await fetch("/api/ide/projects");
    if (!res.ok) return;
    const data = (await res.json()) as { projects: ProjectSummary[] };
    setProjects(data.projects ?? []);
  }, []);

  useEffect(() => {
    void refreshList();
  }, [refreshList]);

  const markDirty = () => {
    if (!loadingRef.current) setDirty(true);
  };

  const saveNow = useCallback(async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      toast.error(t("name_needed"));
      return;
    }
    setSaving(true);
    try {
      if (currentId) {
        const res = await fetch(`/api/ide/projects/${currentId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: trimmed, language, code, stdin }),
        });
        // Writing code needs no account; keeping it does.
        if (handleUnauthorized(res)) return;
        if (!res.ok) throw new Error();
      } else {
        const res = await fetch("/api/ide/projects", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: trimmed, language, code, stdin }),
        });
        if (handleUnauthorized(res)) return;
        if (res.status === 409) {
          toast.error(t("limit_reached"));
          return;
        }
        if (!res.ok) throw new Error();
        const created = (await res.json()) as { id: string };
        setCurrentId(created.id);
      }
      setDirty(false);
      await refreshList();
    } catch {
      toast.error(t("save_failed"));
    } finally {
      setSaving(false);
    }
  }, [name, currentId, language, code, stdin, refreshList, t, handleUnauthorized]);

  // Autosave only ever UPDATES a file the student already named. Creating one
  // silently would litter the list with "untitled" rows they never asked for.
  useEffect(() => {
    if (!currentId || !dirty) return;
    const id = setTimeout(() => void saveNow(), AUTOSAVE_MS);
    return () => clearTimeout(id);
  }, [currentId, dirty, saveNow]);

  const openProject = async (projectId: string) => {
    const res = await fetch(`/api/ide/projects/${projectId}`);
    if (!res.ok) {
      toast.error(tCommon("error"));
      return;
    }
    const p = (await res.json()) as {
      id: string;
      name: string;
      language: string;
      code: string;
      stdin: string | null;
    };
    loadingRef.current = true;
    setCurrentId(p.id);
    setName(p.name);
    setLanguage(toLanguage(p.language));
    setCode(p.code);
    setStdin(p.stdin ?? "");
    setResult(null);
    setDirty(false);
    // Let the state writes above flush before autosave watches again.
    setTimeout(() => {
      loadingRef.current = false;
    }, 0);
  };

  const newProject = () => {
    loadingRef.current = true;
    setCurrentId(null);
    setName("");
    setCode(LANGUAGES[language].starter);
    setStdin("");
    setResult(null);
    setDirty(false);
    setTimeout(() => {
      loadingRef.current = false;
    }, 0);
  };

  const deleteProject = async (projectId: string) => {
    if (!window.confirm(t("delete_confirm"))) return;
    const res = await fetch(`/api/ide/projects/${projectId}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      toast.error(tCommon("error"));
      return;
    }
    if (projectId === currentId) newProject();
    await refreshList();
  };

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
    markDirty();
  };

  const handleRun = () => {
    startTransition(async () => {
      const res = await fetch("/api/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, stdin, language }),
      });
      if (!res.ok) {
        // Running code burns judge time, so /api/run needs an account even
        // though reading and typing here do not.
        if (handleUnauthorized(res)) return;
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
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="hud-label flex items-center gap-2">
            <span className="text-primary">{"//"}</span>
            SANDBOX
          </div>
          <h1 className="text-2xl font-bold">{t("title")}</h1>
          <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Input
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              markDirty();
            }}
            placeholder={t("name_placeholder")}
            className="h-9 w-44 font-code text-sm"
            maxLength={80}
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => void saveNow()}
            disabled={saving}
          >
            <Save className="mr-1.5 h-4 w-4" />
            {saving ? t("saving") : dirty ? t("save") : t("saved")}
          </Button>
          <Button variant="outline" size="sm" onClick={newProject}>
            <FilePlus2 className="mr-1.5 h-4 w-4" />
            {t("new_project")}
          </Button>
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
              markDirty();
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
            <CodeEditor
              value={code}
              onChange={(v) => {
                setCode(v);
                markDirty();
              }}
              language={language}
            />
          </div>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Folder className="h-4 w-4" />
                {t("projects")}
                {/* Shown always, not just when full: five is tight enough
                    that a student should see it coming. */}
                <span
                  className={`ml-auto font-code text-xs tabular-nums ${
                    projects.length >= MAX_IDE_PROJECTS
                      ? "text-destructive"
                      : "text-muted-foreground"
                  }`}
                >
                  {projects.length}/{MAX_IDE_PROJECTS}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {projects.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  {t("no_projects")}
                </p>
              ) : (
                <ul className="max-h-[150px] space-y-1 overflow-y-auto">
                  {projects.map((p) => (
                    <li key={p.id} className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => void openProject(p.id)}
                        className={`hud-hover min-w-0 flex-1 truncate border border-transparent px-2 py-1 text-left font-code text-xs ${
                          p.id === currentId
                            ? "border-primary text-primary"
                            : "text-muted-foreground"
                        }`}
                      >
                        {p.name}
                        <span className="ml-1.5 opacity-60">
                          {LANGUAGES[toLanguage(p.language)].label}
                        </span>
                      </button>
                      <button
                        type="button"
                        aria-label={t("delete")}
                        onClick={() => void deleteProject(p.id)}
                        className="shrink-0 p-1 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">{t("stdin")}</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={stdin}
                onChange={(e) => {
                  setStdin(e.target.value);
                  markDirty();
                }}
                placeholder=""
                className="font-mono text-sm min-h-[110px]"
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
                    {LANGUAGES[language].comment +
                      " " +
                      (pending ? t("running") : t("run"))}
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
