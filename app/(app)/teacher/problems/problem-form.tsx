"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Plus, X, Save, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createProblem, updateProblem, type ProblemInput } from "@/app/actions/problems";
import type { Difficulty } from "@/types/database";

export interface ProblemFormInitial {
  id?: string;
  slug: string;
  title_mn: string;
  title_en: string;
  statement_mn: string;
  statement_en: string;
  input_format_mn: string;
  input_format_en: string;
  output_format_mn: string;
  output_format_en: string;
  constraints_mn: string;
  constraints_en: string;
  difficulty: Difficulty;
  time_limit_ms: number;
  memory_limit_kb: number;
  xp_reward: number;
  tags: string[];
  is_public: boolean;
  tests: { stdin: string; expected_stdout: string; is_sample: boolean }[];
}

const empty: ProblemFormInitial = {
  slug: "",
  title_mn: "",
  title_en: "",
  statement_mn: "",
  statement_en: "",
  input_format_mn: "",
  input_format_en: "",
  output_format_mn: "",
  output_format_en: "",
  constraints_mn: "",
  constraints_en: "",
  difficulty: "easy",
  time_limit_ms: 1000,
  memory_limit_kb: 65536,
  xp_reward: 10,
  tags: [],
  is_public: true,
  tests: [{ stdin: "", expected_stdout: "", is_sample: true }],
};

export function ProblemForm({ initial }: { initial?: Partial<ProblemFormInitial> }) {
  const t = useTranslations("teacher.problems");
  const tField = useTranslations("teacher.problems.field");
  const tTest = useTranslations("teacher.problems.test_cases");
  const tDiff = useTranslations("problems.difficulty");

  const [form, setForm] = useState<ProblemFormInitial>({ ...empty, ...initial });
  const [tagsText, setTagsText] = useState((initial?.tags ?? []).join(", "));
  const [pending, startTransition] = useTransition();

  const isEdit = !!initial?.id;

  const update = <K extends keyof ProblemFormInitial>(
    key: K,
    value: ProblemFormInitial[K],
  ) => setForm((f) => ({ ...f, [key]: value }));

  const updateTest = (idx: number, patch: Partial<ProblemFormInitial["tests"][0]>) => {
    setForm((f) => ({
      ...f,
      tests: f.tests.map((t, i) => (i === idx ? { ...t, ...patch } : t)),
    }));
  };

  const addTest = () => {
    setForm((f) => ({
      ...f,
      tests: [...f.tests, { stdin: "", expected_stdout: "", is_sample: false }],
    }));
  };

  const removeTest = (idx: number) => {
    setForm((f) => ({ ...f, tests: f.tests.filter((_, i) => i !== idx) }));
  };

  const handleSubmit = () => {
    const tags = tagsText
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const payload: ProblemInput = { ...form, tags };

    startTransition(async () => {
      const res = isEdit && initial?.id
        ? await updateProblem(initial.id, payload)
        : await createProblem(payload);
      if (res && "error" in res) toast.error(res.error);
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Link
            href="/teacher/problems"
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-2xl font-bold">
            {isEdit ? t("edit_title") : t("create_title")}
          </h1>
        </div>
        <Button
          onClick={handleSubmit}
          disabled={pending}
          className="bg-violet-600 text-white hover:bg-violet-700"
        >
          <Save className="h-4 w-4 mr-1.5" />
          {pending ? t("saving") : t("save")}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Basic</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Field label={tField("slug")} hint={tField("slug_hint")}>
            <Input
              value={form.slug}
              onChange={(e) => update("slug", e.target.value.toLowerCase())}
              pattern="[a-z0-9-]+"
              required
            />
          </Field>
          <Field label={tField("difficulty")}>
            <Select
              value={form.difficulty}
              onValueChange={(v) => update("difficulty", v as Difficulty)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="easy">{tDiff("easy")}</SelectItem>
                <SelectItem value="medium">{tDiff("medium")}</SelectItem>
                <SelectItem value="hard">{tDiff("hard")}</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label={tField("time_limit_ms")}>
            <Input
              type="number"
              min={100}
              max={10000}
              step={100}
              value={form.time_limit_ms}
              onChange={(e) => update("time_limit_ms", Number(e.target.value))}
            />
          </Field>
          <Field label={tField("memory_limit_kb")}>
            <Input
              type="number"
              min={16384}
              max={524288}
              step={1024}
              value={form.memory_limit_kb}
              onChange={(e) => update("memory_limit_kb", Number(e.target.value))}
            />
          </Field>
          <Field label={tField("xp_reward")}>
            <Input
              type="number"
              min={1}
              max={1000}
              value={form.xp_reward}
              onChange={(e) => update("xp_reward", Number(e.target.value))}
            />
          </Field>
          <Field label={tField("tags")}>
            <Input
              value={tagsText}
              onChange={(e) => setTagsText(e.target.value)}
              placeholder="loops, arrays, math"
            />
          </Field>
          <label className="flex items-center gap-2 cursor-pointer md:col-span-2 select-none">
            <input
              type="checkbox"
              checked={form.is_public}
              onChange={(e) => update("is_public", e.target.checked)}
              className="h-4 w-4"
            />
            <span className="text-sm font-medium">{tField("is_public")}</span>
          </label>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Монгол</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Field label={tField("title_mn")}>
            <Input
              value={form.title_mn}
              onChange={(e) => update("title_mn", e.target.value)}
              required
            />
          </Field>
          <Field label={tField("statement_mn")}>
            <Textarea
              value={form.statement_mn}
              onChange={(e) => update("statement_mn", e.target.value)}
              rows={6}
              required
            />
          </Field>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Field label={tField("input_format_mn")}>
              <Textarea
                value={form.input_format_mn}
                onChange={(e) => update("input_format_mn", e.target.value)}
                rows={3}
              />
            </Field>
            <Field label={tField("output_format_mn")}>
              <Textarea
                value={form.output_format_mn}
                onChange={(e) => update("output_format_mn", e.target.value)}
                rows={3}
              />
            </Field>
            <Field label={tField("constraints_mn")}>
              <Textarea
                value={form.constraints_mn}
                onChange={(e) => update("constraints_mn", e.target.value)}
                rows={3}
              />
            </Field>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">English</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Field label={tField("title_en")}>
            <Input
              value={form.title_en}
              onChange={(e) => update("title_en", e.target.value)}
            />
          </Field>
          <Field label={tField("statement_en")}>
            <Textarea
              value={form.statement_en}
              onChange={(e) => update("statement_en", e.target.value)}
              rows={6}
            />
          </Field>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Field label={tField("input_format_en")}>
              <Textarea
                value={form.input_format_en}
                onChange={(e) => update("input_format_en", e.target.value)}
                rows={3}
              />
            </Field>
            <Field label={tField("output_format_en")}>
              <Textarea
                value={form.output_format_en}
                onChange={(e) => update("output_format_en", e.target.value)}
                rows={3}
              />
            </Field>
            <Field label={tField("constraints_en")}>
              <Textarea
                value={form.constraints_en}
                onChange={(e) => update("constraints_en", e.target.value)}
                rows={3}
              />
            </Field>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-base">{tTest("title")}</CardTitle>
          <Button onClick={addTest} variant="outline" size="sm">
            <Plus className="h-3.5 w-3.5 mr-1" />
            {tTest("add")}
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {form.tests.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              {tTest("empty")}
            </p>
          )}
          {form.tests.map((test, idx) => (
            <Card key={idx} className="border-dashed">
              <CardContent className="p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-muted-foreground">
                    #{idx + 1}
                  </span>
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-1.5 text-xs cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={test.is_sample}
                        onChange={(e) =>
                          updateTest(idx, { is_sample: e.target.checked })
                        }
                      />
                      <span>{tTest("is_sample")}</span>
                      <span className="text-muted-foreground">
                        ({tTest("is_sample_hint")})
                      </span>
                    </label>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => removeTest(idx)}
                      aria-label="Remove"
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <div className="text-xs font-medium text-muted-foreground">
                      {tTest("input")}
                    </div>
                    <Textarea
                      value={test.stdin}
                      onChange={(e) => updateTest(idx, { stdin: e.target.value })}
                      rows={4}
                      className="font-mono text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs font-medium text-muted-foreground">
                      {tTest("expected")}
                    </div>
                    <Textarea
                      value={test.expected_stdout}
                      onChange={(e) =>
                        updateTest(idx, { expected_stdout: e.target.value })
                      }
                      rows={4}
                      className="font-mono text-xs"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}
