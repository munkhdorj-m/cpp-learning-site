import { getTranslations, getLocale } from "next-intl/server";
import { BookOpen, Code2, Lightbulb, ArrowRight } from "lucide-react";
import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { isLocale, DEFAULT_LOCALE } from "@/i18n/config";

// Learn page is static content — no need for force-dynamic

interface Lesson {
  id: string;
  title_mn: string;
  title_en: string;
  desc_mn: string;
  desc_en: string;
  code: string;
  output: string;
  tip_mn: string;
  tip_en: string;
}

const LESSONS: Lesson[] = [
  {
    id: "hello",
    title_mn: "1. Hello, World!",
    title_en: "1. Hello, World!",
    desc_mn:
      "C++ хамгийн анхны програм. `cout` ашиглаж дэлгэц рүү бичвэр хэвлэх.",
    desc_en:
      "Your very first C++ program. Use `cout` to print text to the screen.",
    code: `#include <iostream>
using namespace std;

int main() {
    cout << "Hello, World!" << endl;
    return 0;
}`,
    output: "Hello, World!",
    tip_mn:
      "`#include <iostream>` нь оролт/гаралтын санг холбоно. `endl` нь шинэ мөр гаргана.",
    tip_en:
      "`#include <iostream>` links the input/output library. `endl` creates a new line.",
  },
  {
    id: "variables",
    title_mn: "2. Хувьсагчид",
    title_en: "2. Variables",
    desc_mn: "Тоон хувьсагч зарлаж, утга өгч, хэвлэх.",
    desc_en: "Declare number variables, assign values, and print them.",
    code: `#include <iostream>
using namespace std;

int main() {
    int a = 5;
    int b = 3;
    cout << "a = " << a << endl;
    cout << "b = " << b << endl;
    cout << "a + b = " << a + b << endl;
    return 0;
}`,
    output: "a = 5\nb = 3\na + b = 8",
    tip_mn:
      "`int` нь бүхэл тооны төрөл. `+`, `-`, `*`, `/` үйлдлүүдийг ашиглаж болно.",
    tip_en:
      "`int` is an integer type. You can use `+`, `-`, `*`, `/` operators.",
  },
  {
    id: "input",
    title_mn: "3. Оролт унших",
    title_en: "3. Reading Input",
    desc_mn: "`cin` ашиглаж хэрэглэгчийн оруулсан тоог унших.",
    desc_en: "Use `cin` to read numbers entered by the user.",
    code: `#include <iostream>
using namespace std;

int main() {
    int n;
    cin >> n;
    cout << "You entered: " << n << endl;
    return 0;
}`,
    output: "(input: 42)\nYou entered: 42",
    tip_mn:
      "`cin >> x` нь оролтыг уншиж `x`-д хадгална. Оролт 42 гэвэл `n` 42 болно.",
    tip_en:
      "`cin >> x` reads input and stores it in `x`. If input is 42, `n` becomes 42.",
  },
  {
    id: "if-else",
    title_mn: "4. Нөхцөл шалгах (if-else)",
    title_en: "4. Conditionals (if-else)",
    desc_mn: "Тоо эерэг сөрөг эсэхийг шалгах.",
    desc_en: "Check if a number is positive or negative.",
    code: `#include <iostream>
using namespace std;

int main() {
    int n;
    cin >> n;
    if (n > 0) {
        cout << "Positive" << endl;
    } else if (n < 0) {
        cout << "Negative" << endl;
    } else {
        cout << "Zero" << endl;
    }
    return 0;
}`,
    output: "(input: -5)\nNegative",
    tip_mn: "`if`, `else if`, `else` нь нөхцөл шалгана. `{}` дотор код бичнэ.",
    tip_en: "`if`, `else if`, `else` check conditions. Code goes inside `{}`.",
  },
  {
    id: "for-loop",
    title_mn: "5. Давталт (for)",
    title_en: "5. Loops (for)",
    desc_mn: "1-ээс N хүртэлх тоог хэвлэх.",
    desc_en: "Print numbers from 1 to N.",
    code: `#include <iostream>
using namespace std;

int main() {
    int n;
    cin >> n;
    for (int i = 1; i <= n; i++) {
        cout << i << " ";
    }
    cout << endl;
    return 0;
}`,
    output: "(input: 5)\n1 2 3 4 5",
    tip_mn: "`for (int i = 1; i <= n; i++)` нь i-г 1-ээс n хүртэл нэмэгдүүлнэ.",
    tip_en: "`for (int i = 1; i <= n; i++)` increments i from 1 to n.",
  },
  {
    id: "while-loop",
    title_mn: "6. Давталт (while)",
    title_en: "6. Loops (while)",
    desc_mn: "Тоог 0 хүртэл хасаж хэвлэх.",
    desc_en: "Count down from a number to 0.",
    code: `#include <iostream>
using namespace std;

int main() {
    int n;
    cin >> n;
    while (n > 0) {
        cout << n << " ";
        n--;
    }
    cout << "0" << endl;
    return 0;
}`,
    output: "(input: 3)\n3 2 1 0",
    tip_mn:
      "`while (нөхцөл)` нь нөхцөл үнэн байх хүртэл давтана. `n--` нь n-г 1-ээр хасна.",
    tip_en:
      "`while (condition)` repeats while the condition is true. `n--` decreases n by 1.",
  },
];

export default async function LearnPage() {
  const localeRaw = await getLocale();
  const locale = isLocale(localeRaw) ? localeRaw : DEFAULT_LOCALE;
  const en = locale === "en";

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="space-y-2">
        <div className="hud-label flex items-center gap-2">
          <span className="text-primary">//</span>
          {en ? "LEARN.INIT" : "СУРГАЛТ.ЭХЛЭЛ"}
        </div>
        <div className="flex items-center gap-3">
          <div
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-primary/35 bg-primary/10 text-primary"
            style={{ boxShadow: "0 0 22px -8px var(--color-primary)" }}
          >
            <BookOpen className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">
              {en ? "Learn C++" : "C++ сурах"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {en
                ? "Start from zero — 6 beginner lessons with code examples"
                : "Тэгээс эхэл — 6 хялбар хичээл, кодын жишээтэй"}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {LESSONS.map((lesson, i) => (
          <Card key={lesson.id} className="hud-hover">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <span className="hud-chip">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <Code2 className="h-4 w-4 text-primary" />
                {en ? lesson.title_en : lesson.title_mn}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                {en ? lesson.desc_en : lesson.desc_mn}
              </p>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <div className="overflow-hidden rounded-lg border border-primary/15">
                  <div className="flex items-center gap-1.5 border-b border-primary/15 bg-black/25 px-3 py-1.5">
                    <span className="h-2 w-2 rounded-full bg-neon-pink/70" />
                    <span className="h-2 w-2 rounded-full bg-neon-amber/70" />
                    <span className="h-2 w-2 rounded-full bg-neon-lime/70" />
                    <span className="ml-1 font-code text-[10px] tracking-widest text-muted-foreground">
                      {en ? "code" : "код"}
                    </span>
                  </div>
                  <pre className="overflow-x-auto whitespace-pre bg-[oklch(0.16_0.02_264)] p-3 font-mono text-xs text-primary">
                    {lesson.code}
                  </pre>
                </div>
                <div className="overflow-hidden rounded-lg border border-neon-lime/25">
                  <div className="flex items-center gap-1.5 border-b border-neon-lime/20 bg-neon-lime/[0.08] px-3 py-1.5">
                    <span className="font-code text-[10px] tracking-widest text-neon-lime">
                      {en ? "> output" : "> гаралт"}
                    </span>
                  </div>
                  <pre className="whitespace-pre-wrap bg-[oklch(0.16_0.02_264)] p-3 font-mono text-xs text-neon-lime">
                    {lesson.output}
                  </pre>
                </div>
              </div>
              <div className="flex items-start gap-2 rounded-lg border border-neon-amber/25 bg-neon-amber/[0.08] p-2.5 text-xs text-neon-amber">
                <Lightbulb className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <p>{en ? lesson.tip_en : lesson.tip_mn}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="hud-panel">
        <CardContent className="space-y-3 p-6 text-center">
          <h2 className="text-lg font-bold">
            {en ? "Ready to practice?" : "Дасгал хийх үү?"}
          </h2>
          <p className="text-sm text-muted-foreground">
            {en
              ? "Try solving your first problem with the online code editor"
              : "Онлайн код засварлагчтай эхний бодлогоо бодоорой"}
          </p>
          <Link href="/problems" className={cn(buttonVariants(), "font-code")}>
            {en ? "Go to Problems" : "Бодлогууд руу очих"}
            <ArrowRight className="ml-1.5 h-4 w-4" />
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
