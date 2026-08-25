// The reference half of each lesson.
//
// A lesson's worked example teaches one idea. These sections are everything
// else a beginner needs on that topic — the alternatives, the rules, the
// small print — written so a student can look one up later without rereading
// the whole lesson. Keyed by lesson slug; attached to LESSONS in lessons.ts.
//
// Text may use `backticks` for inline code and **stars** for emphasis.

import type { Section } from "./lessons";

export const LESSON_SECTIONS: Record<string, Section[]> = {
  // ── Unit 1 · First Steps ──────────────────────────────────────────────
  "hello-world": [
    {
      id: "anatomy",
      title_mn: "Програм бүрт байдаг хэсгүүд",
      title_en: "The parts every program has",
      cppOnly: true,
      blocks: [
        {
          kind: "text",
          mn: "C++ програм бүр ижил ясны бүтэцтэй. Эхлээд хэрэгтэй хэрэгслээ оруулж ирнэ, дараа нь `main` гэдэг эхлэх цэгийг бичнэ.",
          en: "Every C++ program has the same skeleton. First you bring in the tools you need, then you write `main`, which is where the program starts.",
        },
        {
          kind: "list",
          mn: [
            "`#include <iostream>` — дэлгэц рүү бичих хэрэгслийг оруулж ирнэ.",
            "`using namespace std;` — `std::cout` гэж бичихийн оронд `cout` гэж богино бичих боломж өгнө.",
            "`int main() { … }` — програм үргэлж эндээс эхэлнэ. Заавал байх ёстой.",
            "`return 0;` — «бүх зүйл амжилттай дууслаа» гэж үйлдлийн системд хэлнэ.",
          ],
          en: [
            "`#include <iostream>` — brings in the tools for printing to the screen.",
            "`using namespace std;` — lets you write `cout` instead of the longer `std::cout`.",
            "`int main() { … }` — the program always starts here. It must exist.",
            "`return 0;` — tells the operating system everything finished correctly.",
          ],
        },
        {
          kind: "note",
          tone: "tip",
          mn: "`main` гэдэг нэрийг өөрчилж болохгүй. Компьютер яг энэ нэрийг хайдаг.",
          en: "You cannot rename `main`. The computer looks for that exact name.",
        },
      ],
    },
    {
      id: "semicolons",
      title_mn: "Цэг таслал ба хаалт",
      title_en: "Semicolons and braces",
      blocks: [
        {
          kind: "text",
          only: "py",
          mn: "Python-д цэг таслал хэрэггүй. Мөр дуусахад илэрхийлэл дуусах бөгөөд блокийг хаалт биш ЦЭГ АВАЛТ тодорхойлно.",
          en: "Python needs no semicolons. A line ends the statement, and INDENTATION marks a block instead of braces.",
        },
        {
          kind: "text",
          only: "cpp",
          mn: "C++ хэлэнд **тушаал бүр цэгтэй таслалаар (`;`) төгсдөг**. Энэ нь өгүүлбэрийн цэг шиг: «энэ тушаал дууслаа» гэсэн үг.",
          en: "In C++ **every statement ends with a semicolon (`;`)**. It works like a full stop: it says \"this instruction is finished\".",
        },
        {
          kind: "text",
          only: "cpp",
          mn: "Буржгар хаалт `{ }` нь тушаалуудыг нэг бүлэг болгож нэгтгэнэ. `main`-ий бие бол ийм бүлэг юм.",
          en: "Curly braces `{ }` group statements together into one block. The body of `main` is such a block.",
        },
        {
          kind: "code",
          cpp: `int main() {
    cout << "one";   // ← ; хэрэгтэй
    cout << "two";   // ← ; хэрэгтэй
}                    // ← хаалтын дараа ; хэрэггүй`,
          py: `def main():
    print("one")     # Python-д ; хэрэггүй
    print("two")     # мөр дуусахад л хангалттай`,
        },
        {
          kind: "note",
          only: "cpp",
          tone: "warn",
          mn: "Цэг таслал мартах бол хамгийн түгээмэл алдаа. Компилятор ихэвчлэн **дараагийн** мөрөнд алдаа заадаг тул нэг мөр дээш харах хэрэгтэй.",
          en: "A missing semicolon is the most common beginner error. The compiler usually points at the **next** line, so look one line above where it complains.",
        },
      ],
    },
    {
      id: "compile-run",
      title_mn: "Код яаж програм болдог вэ",
      title_en: "How code becomes a program",
      cppOnly: true,
      blocks: [
        {
          kind: "text",
          mn: "Чиний бичсэн текстийг компьютер шууд ойлгодоггүй. **Компилятор** гэдэг хөтөлбөр текстийг машины хэл рүү хөрвүүлж, дараа нь тэр үр дүнг ажиллуулна.",
          en: "The computer does not understand your text directly. A program called a **compiler** translates it into machine code, and then that result is run.",
        },
        {
          kind: "list",
          ordered: true,
          mn: [
            "Бичих — `main.cpp` файлд кодоо бичнэ.",
            "Компиляц — компилятор алдаа шалгаад машин код үүсгэнэ.",
            "Ажиллуулах — үүссэн програм ажиллаж, хариу гарна.",
          ],
          en: [
            "Write — you type your code into `main.cpp`.",
            "Compile — the compiler checks for errors and produces machine code.",
            "Run — the resulting program executes and prints its output.",
          ],
        },
        {
          kind: "note",
          tone: "tip",
          mn: "Тиймээс C++ хэлэнд алдааны хоёр төрөл байдаг: **компиляцын алдаа** (ажиллах ч үгүй) ба **ажиллах үеийн алдаа** (ажиллаж байгаад буруу хариу өгөх).",
          en: "This is why C++ has two kinds of error: **compile errors** (it never runs) and **run-time errors** (it runs but behaves wrongly).",
        },
      ],
    },
  ],

  printing: [
    {
      id: "chaining",
      title_mn: "Хэд хэдэн зүйлийг нэг мөрөнд",
      title_en: "Printing several things at once",
      blocks: [
        {
          kind: "text",
          only: "py",
          mn: "Python-д `print` олон зүйлийг таслалаар аваад хооронд нь зай тавьж хэвлэнэ. `<<` гэж залгах шаардлагагүй.",
          en: "In Python `print` takes several things separated by commas and puts a space between them. There is no `<<` chaining.",
        },
        {
          kind: "text",
          only: "cpp",
          mn: "`<<` тэмдгийг дараалуулан бичээд текст, тоо, хувьсагчийг хольж хэвлэж болно. Тэмдэг бүр «дараагийнхыг нь ч гарга» гэсэн үг.",
          en: "You can chain `<<` to mix text, numbers and variables in one line. Each `<<` means \"and then send this too\".",
        },
        {
          kind: "code",
          cpp: `int age = 14;
cout << "I am " << age << " years old" << endl;`,
          py: `age = 14
print("I am", age, "years old")`,
          output: "I am 14 years old",
        },
        {
          kind: "note",
          only: "cpp",
          tone: "warn",
          mn: "Хашилт доторх зүйл яг байгаагаараа гарна. `cout << \"age\";` гэвэл 14 биш, **age** гэсэн үг гарна.",
          en: "Anything inside quotes is printed exactly. `cout << \"age\";` prints the word **age**, not 14.",
        },
      ],
    },
    {
      id: "endl-vs-n",
      title_mn: "`endl` ба `\\n`",
      title_en: "`endl` and `\\n`",
      blocks: [
        {
          kind: "text",
          only: "py",
          mn: "`print` нь мөрийг өөрөө таслана. Таслахгүй байхыг хүсвэл `end=\"\"` гэж зааж өгнө.",
          en: "`print` ends the line for you. To stop it, pass `end=\"\"`.",
        },
        {
          kind: "text",
          only: "cpp",
          mn: "Хоёулаа шинэ мөр рүү шилжүүлнэ. `\\n` бол зүгээр нэг тэмдэгт, `endl` нь нэмээд буферээ шууд цэвэрлэдэг — тиймээс арай удаан.",
          en: "Both move to a new line. `\\n` is just a character; `endl` also flushes the output buffer, which makes it a little slower.",
        },
        {
          kind: "code",
          cpp: `cout << "line one" << endl;
cout << "line two\\n";        // ижил үр дүн
cout << "a\\nb\\nc\\n";          // гурван мөр`,
          py: `print("line one")
print("line two")
print("a\\nb\\nc")`,
          output: "line one\nline two\na\nb\nc",
        },
        {
          kind: "note",
          only: "cpp",
          tone: "tip",
          mn: "Их хэмжээний хэвлэлт хийж байвал `\\n` ашиглавал хурдан. Энгийн бодлогод ялгаа мэдэгдэхгүй.",
          en: "If you print a lot, `\\n` is faster. For ordinary exercises the difference does not matter.",
        },
      ],
    },
    {
      id: "escapes",
      title_mn: "Тусгай тэмдэгтүүд",
      title_en: "Escape characters",
      blocks: [
        {
          kind: "text",
          mn: "Зарим тэмдэгтийг шууд бичиж болохгүй — жишээ нь хашилтыг. Тэдгээрийг ташуу зураасаар «зугтаана».",
          en: "Some characters cannot be typed directly inside a string — a quote, for example. You escape them with a backslash.",
        },
        {
          kind: "table",
          head_mn: ["Бичих нь", "Гарах нь"],
          head_en: ["You write", "You get"],
          rows: [
            ["\\n", "шинэ мөр / new line"],
            ["\\t", "таб зай / a tab"],
            ['\\"', 'хашилт " / a quote'],
            ["\\\\", "ташуу зураас \\ / a backslash"],
          ],
        },
        {
          kind: "code",
          cpp: `cout << "She said \\"hi\\"\\n";
cout << "a\\tb\\tc\\n";`,
          py: `print('She said "hi"')
print("a\\tb\\tc")`,
          output: 'She said "hi"\na\tb\tc',
        },
      ],
    },
  ],

  comments: [
    {
      id: "styles",
      title_mn: "Тайлбарын хоёр хэлбэр",
      title_en: "Two kinds of comment",
      blocks: [
        {
          kind: "text",
          mn: "Тайлбарыг компьютер бүрэн үл тоомсорлоно. Тэдгээр нь зөвхөн хүнд зориулагдсан — маргааш өөрөө уншихдаа ойлгохын тулд.",
          en: "The computer ignores comments completely. They exist only for people — including you, reading your own code tomorrow.",
        },
        {
          kind: "code",
          cpp: `// Нэг мөрийн тайлбар: мөрийн төгсгөл хүртэл

/* Олон мөрийн тайлбар:
   энд хэдэн ч мөр бичиж болно */

int x = 5;   // мөрийн ард ч бичиж болно`,
          py: `# Нэг мөрийн тайлбар

"""
Олон мөрийн тайлбар
Python-д ингэж бичдэг
"""

x = 5   # мөрийн ард ч бичиж болно`,
        },
        {
          kind: "note",
          tone: "tip",
          only: "cpp",
          mn: "Кодоо түр «унтраахад» тайлбар маш тохиромжтой: мөрийн урд `//` тавихад тэр мөр ажиллахаа болино.",
          en: "Comments are handy for switching code off temporarily: put `//` in front of a line and it stops running.",
        },
        {
          kind: "note",
          tone: "tip",
          only: "py",
          mn: "Кодоо түр «унтраахад» тайлбар маш тохиромжтой: мөрийн урд `#` тавихад тэр мөр ажиллахаа болино.",
          en: "Comments are handy for switching code off temporarily: put `#` in front of a line and it stops running.",
        },
      ],
    },
    {
      id: "white-space",
      title_mn: "Хоосон зай ба догол мөр",
      title_en: "White space and indentation",
      cppOnly: true,
      blocks: [
        {
          kind: "text",
          mn: "C++ хоосон зай, шинэ мөрийг үл тоомсорлодог. Доорх хоёр код компьютерийн хувьд **яг адилхан** — гэхдээ хүний хувьд огт өөр.",
          en: "C++ ignores spaces and line breaks. The two programs below are **identical** to the computer — but not to a human.",
        },
        {
          kind: "code",
          cpp: `int main(){int x=5;if(x>3){cout<<"big";}return 0;}`,
          caption_mn: "Ажиллана, гэхдээ уншихад хэцүү:",
          caption_en: "This works, but it is painful to read:",
        },
        {
          kind: "code",
          cpp: `int main() {
    int x = 5;

    if (x > 3) {
        cout << "big";
    }

    return 0;
}`,
          caption_mn: "Ижил програм, зөв бичиглэлтэйгээр:",
          caption_en: "The same program, written properly:",
        },
        {
          kind: "list",
          mn: [
            "Хаалт `{` нээх бүрд дотогшоо **4 зай** ухраа.",
            "Утга учиртай хэсгүүдийн хооронд хоосон мөр орхи.",
            "Оператор бүрийн хоёр талд нэг зай тавь: `x = a + b` нь `x=a+b`-ээс уншихад хялбар.",
          ],
          en: [
            "Indent by **4 spaces** every time you open a `{`.",
            "Leave a blank line between parts that do different things.",
            "Put a space around operators: `x = a + b` reads better than `x=a+b`.",
          ],
        },
      ],
    },
    {
      id: "naming",
      title_mn: "Сайн нэр өгөх",
      title_en: "Naming things well",
      blocks: [
        {
          kind: "text",
          only: "cpp",
          mn: "Сайн нэр бол хамгийн сайн тайлбар. `int d;` гэхээр юу ч ойлгохгүй, `int daysLeft;` гэвэл тайлбар хэрэггүй.",
          en: "A good name is the best comment. `int d;` tells you nothing; `int daysLeft;` needs no explanation.",
        },
        {
          kind: "text",
          only: "py",
          mn: "Сайн нэр бол хамгийн сайн тайлбар. `d = 7` гэхээр юу ч ойлгохгүй, `days_left = 7` гэвэл тайлбар хэрэггүй.",
          en: "A good name is the best comment. `d = 7` tells you nothing; `days_left = 7` needs no explanation.",
        },
        {
          kind: "table",
          only: "cpp",
          head_mn: ["Муу", "Сайн"],
          head_en: ["Poor", "Better"],
          rows: [
            ["`int a;`", "`int score;`"],
            ["`int x2;`", "`int studentCount;`"],
            ["`double t;`", "`double totalPrice;`"],
          ],
        },
        {
          kind: "table",
          only: "py",
          head_mn: ["Муу", "Сайн"],
          head_en: ["Poor", "Better"],
          rows: [
            ["`a = 0`", "`score = 0`"],
            ["`x2 = 0`", "`student_count = 0`"],
            ["`t = 0.0`", "`total_price = 0.0`"],
          ],
        },
        {
          kind: "list",
          mn: [
            "Нэр үсэг эсвэл `_`-ээр эхэлнэ, тоогоор эхэлж болохгүй.",
            "Зай байж болохгүй: `myAge` эсвэл `my_age`.",
            "Том жижиг үсэг ялгаатай: `age` ба `Age` бол өөр хоёр хувьсагч.",
          ],
          en: [
            "A name starts with a letter or `_`, never a digit.",
            "No spaces: use `myAge` or `my_age`.",
            "Case matters: `age` and `Age` are two different variables.",
          ],
        },
      ],
    },
  ],

  // ── Unit 2 · Storing Information ──────────────────────────────────────
  variables: [
    {
      id: "initialisation",
      title_mn: "Эхний утга өгөх гурван арга",
      title_en: "Three ways to give a starting value",
      cppOnly: true,
      blocks: [
        {
          kind: "text",
          mn: "C++ хэлэнд хувьсагчид эхний утга өгөх хэдэн бичиглэл бий. Гурвуулаа ижил үр дүнтэй боловч буржгар хаалттай хэлбэр хамгийн аюулгүй.",
          en: "C++ has more than one spelling for giving a variable its first value. All three do the same thing here, but the brace form is the safest.",
        },
        {
          kind: "code",
          cpp: `int a = 5;      // тэнцүүгээр
int b (5);      // хаалтаар
int b2 { 5 };   // буржгар хаалтаар — хамгийн найдвартай`,
        },
        {
          kind: "text",
          mn: "Яагаад буржгар хаалт найдвартай вэ? Учир нь мэдээлэл алдагдвал компилятор шууд алдаа заана.",
          en: "Why is the brace form safest? Because if information would be lost, the compiler refuses instead of quietly rounding.",
        },
        {
          kind: "code",
          cpp: `int x = 3.9;      // чимээгүй 3 болно — алдаа мэдэгдэхгүй
int y { 3.9 };    // компилятор алдаа заана — сайн!`,
        },
        {
          kind: "note",
          tone: "warn",
          mn: "Эхний утга **өгөөгүй** хувьсагч дотор ямар нэг хог тоо байна. `int n;` гэж зарлаад шууд хэвлэвэл санамсаргүй тоо гарч магадгүй.",
          en: "A variable you never initialise holds whatever junk was in that memory. Declaring `int n;` and printing it straight away can show any number at all.",
        },
      ],
    },
    {
      id: "const",
      title_mn: "Өөрчлөгдөж болохгүй утга (`const`)",
      title_en: "Values that must not change (`const`)",
      cppOnly: true,
      blocks: [
        {
          kind: "text",
          mn: "Хэрэв утга хэзээ ч өөрчлөгдөх ёсгүй бол `const` гэж тэмдэглэ. Дараа нь санамсаргүй өөрчлөх гэвэл компилятор зогсооно.",
          en: "If a value must never change, mark it `const`. If you later try to change it by accident, the compiler stops you.",
        },
        {
          kind: "code",
          cpp: `const double PI = 3.14159;
const int MAX_STUDENTS = 30;

PI = 3;   // ✗ компиляцын алдаа — сайн хэрэг`,
        },
        {
          kind: "note",
          tone: "tip",
          mn: "Кодод шууд бичсэн «шидэт тоо» (`30`, `3.14`) -г `const` хувьсагч болгож нэрлэвэл код уншихад хялбар, засахад ч амар болно.",
          en: "Turning \"magic numbers\" (`30`, `3.14`) into named `const` values makes code easier to read and to change later.",
        },
      ],
    },
    {
      id: "scope",
      title_mn: "Хувьсагч хаана амьдардаг вэ",
      title_en: "Where a variable lives",
      blocks: [
        {
          kind: "text",
          only: "py",
          mn: "Python-д блокийн хүрээ БАЙХГҮЙ: `if` дотор үүсгэсэн хувьсагч гадна нь ч амьд хэвээр байна. Хүрээг функц тодорхойлно.",
          en: "Python has no block scope: a variable made inside an `if` is still alive outside it. Scope is set by the function, not the block.",
        },
        {
          kind: "text",
          only: "cpp",
          mn: "Хувьсагч нь зарлагдсан буржгар хаалтныхаа дотор л амьдарна. Хаалт хаагдмагц устана — үүнийг **хамрах хүрээ** гэнэ.",
          en: "A variable lives inside the braces where it was declared. When those braces close, it is gone. This is called its **scope**.",
        },
        {
          kind: "code",
          cpp: `int main() {
    int outside = 1;

    {
        int inside = 2;
        cout << outside;   // ✓ харагдана
    }

    cout << inside;        // ✗ алдаа — inside аль хэдийн устсан
}`,
          py: `def main():
    outside = 1

    if True:
        inside = 2
        print(outside)     # ✓ харагдана

    print(inside)          # Python-д ажиллана —
                           # энэ дүрэм C++-д илүү хатуу`,
        },
      ],
    },
  ],

  types: [
    {
      id: "whole-numbers",
      title_mn: "Бүхэл тоо",
      title_en: "Whole numbers",
      blocks: [
        {
          kind: "text",
          only: "py",
          mn: "Python-ы бүхэл тоонд ХЯЗГААР БАЙХГҮЙ — өөрөө өсөөд явна. `int`, `long long` гэж сонгох, хэтрэхээс болгоомжлох шаардлагагүй.",
          en: "Python integers have NO limit — they simply grow. There is no choosing between `int` and `long long`, and no overflow to fear.",
        },
        {
          kind: "text",
          only: "cpp",
          mn: "`int` нь ойролцоогоор ±2 тэрбумын хооронд тоо хадгална. Түүнээс том тоонд `long long` хэрэглэнэ.",
          en: "An `int` holds numbers between about ±2 billion. For anything bigger use `long long`.",
        },
        {
          kind: "table",
          only: "cpp",
          head_mn: ["Төрөл", "Багтаамж"],
          head_en: ["Type", "Range"],
          rows: [
            ["`int`", "≈ −2 000 000 000 … 2 000 000 000"],
            ["`long long`", "≈ ±9 000 000 000 000 000 000"],
            ["`unsigned int`", "0 … ≈4 000 000 000 (сөрөг үгүй / no negatives)"],
          ],
        },
        {
          kind: "note",
          only: "cpp",
          tone: "warn",
          mn: "Хязгаараас хэтэрвэл тоо **эргэж** сөрөг болно. Үржвэр том болох бодлогод `long long` ашигла.",
          en: "Going past the limit makes the number **wrap around** to a negative. Use `long long` when products get large.",
        },
        {
          kind: "code",
          cpp: `int big = 2000000000;
big = big + big;              // хэтэрлээ — хог утга

long long safe = 2000000000;
safe = safe + safe;           // ✓ 4000000000`,
          py: `big = 2000000000
big = big + big     # Python-д хязгаар байхгүй — 4000000000`,
        },
      ],
    },
    {
      id: "real-numbers",
      title_mn: "Аравтын бутархайтай тоо",
      title_en: "Numbers with a decimal point",
      blocks: [
        {
          kind: "text",
          only: "py",
          mn: "Python-д `float` ганцхан төрөл. Гэхдээ нарийвчлалын асуудал ижилхэн: `0.1 + 0.2 == 0.3` энд бас худал.",
          en: "Python has one `float` type. The precision trap is identical though: `0.1 + 0.2 == 0.3` is false here too.",
        },
        {
          kind: "text",
          only: "cpp",
          mn: "`double` нь бутархайтай тоо хадгална: `3.14`, `-0.5`, `2.0`. `float` бас байдаг ч нарийвчлал багатай тул `double` хэрэглэ.",
          en: "A `double` holds numbers with a decimal point: `3.14`, `-0.5`, `2.0`. There is also `float`, but it is less precise — prefer `double`.",
        },
        {
          kind: "code",
          cpp: `double price = 19.99;
double half = 7 / 2.0;        // 3.5
cout << half << endl;`,
          py: `price = 19.99
half = 7 / 2                  # 3.5 — Python өөрөө бутархай болгоно
print(half)`,
          output: "3.5",
        },
        {
          kind: "note",
          only: "cpp",
          tone: "warn",
          mn: "Бутархай тоо **яг таг** биш ойролцоо хадгалагддаг. Тиймээс `0.1 + 0.2 == 0.3` шалгахад худал гарч болно. Бутархай тоог `==`-ээр бүү харьцуул.",
          en: "Decimals are stored approximately, not exactly. So `0.1 + 0.2 == 0.3` can be false. Never compare decimals with `==`.",
        },
      ],
    },
    {
      id: "booleans",
      title_mn: "Үнэн/худал (`bool`)",
      title_en: "Booleans (`bool`)",
      blocks: [
        {
          kind: "text",
          only: "py",
          mn: "Python-д `True` ба `False` нь ТОМ үсгээр эхэлнэ. Хэвлэхэд 1, 0 биш `True`, `False` гэж гарна.",
          en: "Python writes `True` and `False` with a capital letter, and prints them as words, not as 1 and 0.",
        },
        {
          kind: "text",
          only: "cpp",
          mn: "`bool` төрөл ердөө хоёр утгатай: `true` (үнэн) ба `false` (худал). Харьцуулалт бүрийн хариу нь `bool` байдаг.",
          en: "A `bool` has just two values: `true` and `false`. Every comparison you write produces a `bool`.",
        },
        {
          kind: "code",
          cpp: `bool isRaining = true;
bool passed = (score >= 60);   // харьцуулалтын хариу

cout << isRaining << endl;     // 1 гэж хэвлэнэ
cout << boolalpha << isRaining;// true гэж хэвлэнэ`,
          py: `is_raining = True
passed = score >= 60

print(is_raining)              # True`,
        },
        {
          kind: "note",
          only: "cpp",
          tone: "tip",
          mn: "C++ `bool`-ыг тоогоор хэвлэдэг: `true` = 1, `false` = 0. Үг болгож харуулах бол `boolalpha` ашигла.",
          en: "C++ prints a `bool` as a number: `true` is 1, `false` is 0. Use `boolalpha` if you want the words.",
        },
      ],
    },
    {
      id: "characters",
      title_mn: "Ганц тэмдэгт (`char`)",
      title_en: "Single characters (`char`)",
      blocks: [
        {
          kind: "text",
          only: "py",
          mn: "Python-д тусдаа тэмдэгтийн төрөл байхгүй. `s[0]` нь нэг үсэгтэй МӨР буцаана.",
          en: "Python has no separate character type. `s[0]` gives back a STRING one letter long.",
        },
        {
          kind: "text",
          only: "cpp",
          mn: "`char` нь **нэг** тэмдэгт хадгална. Ганц хашилт хэрэглэнэ: `'A'`. Хос хашилт `\"A\"` бол мөр болохоос тэмдэгт биш.",
          en: "A `char` holds **one** character. It uses single quotes: `'A'`. Double quotes `\"A\"` make a string, not a character.",
        },
        {
          kind: "code",
          cpp: `char grade = 'A';
char digit = '7';

cout << grade << endl;        // A
cout << (int)grade << endl;   // 65 — ASCII дугаар`,
          py: `grade = 'A'          # Python-д тусдаа char төрөл байхгүй
print(grade)         # A
print(ord(grade))    # 65`,
          output: "A\n65",
        },
        {
          kind: "text",
          only: "cpp",
          mn: "Тэмдэгт бүр дотроо тоо байдаг (ASCII код). Тиймээс `'a' + 1` нь `'b'` болно, `'5' - '0'` нь `5` тоог өгнө.",
          en: "Every character is really a number underneath (its ASCII code). So `'a' + 1` gives `'b'`, and `'5' - '0'` gives the number `5`.",
        },
      ],
    },
    {
      id: "choosing",
      title_mn: "Аль төрлийг сонгох вэ",
      title_en: "Which type should I use?",
      cppOnly: true,
      blocks: [
        {
          kind: "table",
          head_mn: ["Юу хадгалах", "Төрөл"],
          head_en: ["What you are storing", "Type"],
          rows: [
            ["Хүний нас, тоо ширхэг / a count or age", "`int`"],
            ["Маш том тоо / a very large number", "`long long`"],
            ["Үнэ, дундаж, хэмжээ / a price or average", "`double`"],
            ["Тийм/үгүй / yes or no", "`bool`"],
            ["Нэг үсэг / one letter", "`char`"],
            ["Үг, өгүүлбэр / a word or sentence", "`string`"],
          ],
        },
      ],
    },
  ],

  input: [
    {
      id: "several-values",
      title_mn: "Хэд хэдэн утга унших",
      title_en: "Reading several values",
      blocks: [
        {
          kind: "text",
          only: "py",
          mn: "Нэг мөрөнд хэд хэдэн тоо ирвэл `map(int, input().split())` хэрэглэнэ. `int(input())`-ийг дахин дахин бичвэл алдаа гарна.",
          en: "When several numbers arrive on one line, use `map(int, input().split())`. Repeating `int(input())` will fail.",
        },
        {
          kind: "text",
          only: "cpp",
          mn: "`>>` тэмдгийг дараалуулан бичээд нэг мөрөнд хэд хэдэн утга уншиж болно. `cin` нь зай болон шинэ мөрийг тусгаарлагч гэж үзнэ.",
          en: "Chain `>>` to read several values at once. `cin` treats spaces and new lines as separators.",
        },
        {
          kind: "code",
          cpp: `int a, b;
cin >> a >> b;          // "3 4" эсвэл дараалсан хоёр мөр
cout << a + b << endl;`,
          py: `a, b = map(int, input().split())
print(a + b)`,
        },
        {
          kind: "note",
          only: "cpp",
          tone: "tip",
          mn: "Хэдэн ч тоо, ямар ч байдлаар (нэг мөрөнд эсвэл тус тусад нь) орж ирсэн `cin >>` адилхан ажиллана.",
          en: "`cin >>` works the same whether the numbers arrive on one line or on separate lines.",
        },
      ],
    },
    {
      id: "bad-input",
      title_mn: "Буруу өгөгдөл ирвэл",
      title_en: "When the input does not match",
      blocks: [
        {
          kind: "text",
          only: "py",
          mn: "Python оролт буруу бол чимээгүй өнгөрөхгүй — `ValueError` шидэж зогсоно. Хүсвэл `try` / `except`-ээр барьж болно.",
          en: "Python does not fail quietly on bad input — it raises `ValueError` and stops. You can catch it with `try` / `except`.",
        },
        {
          kind: "text",
          only: "cpp",
          mn: "`int` хүлээж байхад үсэг ирвэл `cin` **бүтэлгүйтэж**, хувьсагч 0 болоод цаашид бүх уншилт ажиллахаа болино.",
          en: "If you ask for an `int` and a letter arrives, `cin` **fails**: the variable becomes 0 and every later read stops working.",
        },
        {
          kind: "code",
          cpp: `int n;
if (cin >> n) {
    cout << "Got " << n;
} else {
    cout << "That was not a number";
}`,
          py: `try:
    n = int(input())
    print("Got", n)
except ValueError:
    print("That was not a number")`,
        },
      ],
    },
  ],

  math: [
    {
      id: "integer-division",
      title_mn: "Бүхэл тоон хуваалт ба `%`",
      title_en: "Integer division and `%`",
      blocks: [
        {
          kind: "text",
          only: "py",
          mn: "Python-д `/` нь ҮРГЭЛЖ бутархай өгнө: `7 / 2` бол 3.5. Бүхэл хуваалт хэрэгтэй бол `//` гэж бич.",
          en: "In Python `/` ALWAYS gives a fraction: `7 / 2` is 3.5. For whole-number division write `//`.",
        },
        {
          kind: "text",
          only: "cpp",
          mn: "Хоёр **бүхэл** тоог хуваахад C++ бутархай хэсгийг хаяна. `7 / 2` нь 3.5 биш **3** болно.",
          en: "Dividing two **whole** numbers throws the fraction away. `7 / 2` is **3**, not 3.5.",
        },
        {
          kind: "code",
          cpp: `cout << 7 / 2 << endl;      // 3   ← бутархай хаягдав
cout << 7 % 2 << endl;      // 1   ← үлдэгдэл
cout << 7 / 2.0 << endl;    // 3.5 ← нэг нь бутархай бол зөв гарна`,
          py: `print(7 // 2)    # 3   ← бүхэл хуваалт
print(7 % 2)     # 1   ← үлдэгдэл
print(7 / 2)     # 3.5 ← Python-д / үргэлж бутархай`,
          output: "3\n1\n3.5",
        },
        {
          kind: "text",
          only: "cpp",
          mn: "`%` (модуль) нь хуваасны **үлдэгдэл** өгнө. Тоо тэгш эсэхийг шалгахад маш их хэрэглэдэг.",
          en: "`%` (modulo) gives the **remainder**. It is used constantly — checking whether a number is even, for instance.",
        },
        {
          kind: "code",
          cpp: `if (n % 2 == 0) cout << "тэгш / even";
else            cout << "сондгой / odd";

int last = n % 10;      // сүүлийн орон
int rest = n / 10;      // сүүлийн орныг хассан нь`,
          py: `if n % 2 == 0:
    print("even")
else:
    print("odd")

last = n % 10
rest = n // 10`,
        },
      ],
    },
    {
      id: "precedence",
      title_mn: "Аль үйлдэл эхэлж бодогдох вэ",
      title_en: "Which operation happens first",
      blocks: [
        {
          kind: "text",
          mn: "Математиктай ижил дараалал: эхлээд `*`, `/`, `%`, дараа нь `+`, `-`. Хаалт бүхнээс түрүүнд.",
          en: "The same order as in maths: `*`, `/`, `%` first, then `+` and `-`. Brackets beat everything.",
        },
        {
          kind: "code",
          cpp: `cout << 2 + 3 * 4 << endl;      // 14  (3*4 эхэлнэ)
cout << (2 + 3) * 4 << endl;    // 20  (хаалт эхэлнэ)`,
          py: `print(2 + 3 * 4)      # 14
print((2 + 3) * 4)    # 20`,
          output: "14\n20",
        },
        {
          kind: "note",
          tone: "tip",
          mn: "Эргэлзвэл хаалт тавь. Илүү хаалтанд хэн ч гомдохгүй, буруу хариунд бүгд гомдоно.",
          en: "When in doubt, add brackets. Nobody was ever hurt by an extra pair; wrong answers hurt everybody.",
        },
      ],
    },
    {
      id: "cmath",
      title_mn: "Бэлэн математик функцууд",
      title_en: "Ready-made maths functions",
      blocks: [
        {
          kind: "text",
          only: "py",
          mn: "Python-д `import math` гээд `math.sqrt`, `math.floor` гэх мэтээр хэрэглэнэ. `abs` ба `round` нь импортгүйгээр ажиллана.",
          en: "In Python you `import math` and use `math.sqrt`, `math.floor` and so on. `abs` and `round` work with no import.",
        },
        {
          kind: "text",
          only: "cpp",
          mn: "`#include <cmath>` бичвэл олон бэлэн функц ашиглаж болно.",
          en: "Add `#include <cmath>` and you get a set of ready-made functions.",
        },
        {
          kind: "table",
          only: "cpp",
          head_mn: ["Функц", "Утга"],
          head_en: ["Function", "What it does"],
          rows: [
            ["`sqrt(x)`", "квадрат язгуур / square root"],
            ["`pow(x, y)`", "x-ийн y зэрэг / x to the power y"],
            ["`abs(x)`", "үнэмлэхүй утга / absolute value"],
            ["`round(x)`", "хамгийн ойрын бүхэл / nearest whole number"],
            ["`min(a, b)` · `max(a, b)`", "бага/их нь / the smaller or larger"],
          ],
        },
        {
          kind: "code",
          cpp: `#include <cmath>

cout << sqrt(16) << endl;     // 4
cout << pow(2, 10) << endl;   // 1024
cout << max(3, 9) << endl;    // 9`,
          py: `import math

print(math.sqrt(16))   # 4.0
print(2 ** 10)         # 1024
print(max(3, 9))       # 9`,
          output: "4\n1024\n9",
        },
      ],
    },
  ],

  // ── Unit 3 · Making Decisions ─────────────────────────────────────────
  "if-else": [
    {
      id: "else-if",
      title_mn: "Гурав ба түүнээс олон сонголт",
      title_en: "Three or more choices",
      blocks: [
        {
          kind: "text",
          mn: "`else if` -ийг гинжлэн бичээд хэдэн ч сонголт хийж болно. Компьютер дээрээс доош шалгаж, **эхний таарсан** дээрээ зогсоно.",
          en: "Chain `else if` for as many choices as you like. The computer checks top to bottom and stops at the **first** one that matches.",
        },
        {
          kind: "code",
          cpp: `if (score >= 90) {
    cout << "A";
} else if (score >= 80) {
    cout << "B";
} else if (score >= 70) {
    cout << "C";
} else {
    cout << "F";
}`,
          py: `if score >= 90:
    print("A")
elif score >= 80:
    print("B")
elif score >= 70:
    print("C")
else:
    print("F")`,
        },
        {
          kind: "note",
          tone: "warn",
          mn: "Дараалал чухал! Хэрэв `score >= 70` -ийг эхэнд нь бичвэл 95 оноотой хүүхэд ч «C» авна.",
          en: "The order matters. If `score >= 70` came first, a student with 95 would get a \"C\".",
        },
      ],
    },
    {
      id: "braces",
      title_mn: "Хаалтаа үргэлж бич",
      title_en: "Always write the braces",
      cppOnly: true,
      blocks: [
        {
          kind: "text",
          mn: "Ганц мөр бол хаалтгүй бичиж болдог — гэхдээ бүү бич. Дараа нь мөр нэмэхэд алдаа гарна.",
          en: "For a single line you may leave the braces out — but don't. It breaks as soon as you add a second line.",
        },
        {
          kind: "code",
          cpp: `if (x > 0)
    cout << "positive";
    cout << " number";   // ✗ энэ мөр if-ээс ГАДНА байна!`,
          caption_mn: "Хаалтгүй бичсэний урхи:",
          caption_en: "The trap of leaving braces out:",
        },
        {
          kind: "code",
          cpp: `if (x > 0) {
    cout << "positive";
    cout << " number";   // ✓ хоёулаа if дотор
}`,
          caption_mn: "Хаалттай — үргэлж зөв:",
          caption_en: "With braces — always correct:",
        },
      ],
    },
  ],

  conditions: [
    {
      id: "comparison-ops",
      title_mn: "Харьцуулах операторууд",
      title_en: "Comparison operators",
      blocks: [
        {
          kind: "table",
          head_mn: ["Оператор", "Утга"],
          head_en: ["Operator", "Meaning"],
          rows: [
            ["`==`", "тэнцүү юу? / is equal to?"],
            ["`!=`", "тэнцүү биш юү? / is not equal to?"],
            ["`<` · `>`", "бага / их"],
            ["`<=` · `>=`", "бага буюу тэнцүү / их буюу тэнцүү"],
          ],
        },
        {
          kind: "note",
          tone: "warn",
          mn: "`=` бол **оноох**, `==` бол **харьцуулах**. `if (x = 5)` гэвэл шалгахын оронд x-д 5 оноогоод үргэлж үнэн болно.",
          en: "`=` **assigns**, `==` **compares**. `if (x = 5)` puts 5 into x instead of testing it, and is always true.",
        },
      ],
    },
    {
      id: "logical-ops",
      title_mn: "Нөхцөл нэгтгэх: `&&`, `||`, `!`",
      title_en: "Combining conditions: `&&`, `||`, `!`",
      blocks: [
        {
          kind: "text",
          only: "py",
          mn: "Python-д тэмдэг биш ҮГ хэрэглэнэ: `and`, `or`, `not`. `&&` гэж бичвэл алдаа гарна.",
          en: "Python uses WORDS, not symbols: `and`, `or`, `not`. Writing `&&` is an error.",
        },
        {
          kind: "table",
          only: "cpp",
          head_mn: ["Оператор", "Хэзээ үнэн болох"],
          head_en: ["Operator", "True when"],
          rows: [
            ["`a && b`", "хоёулаа үнэн / both are true"],
            ["`a || b`", "ядаж нэг нь үнэн / at least one is true"],
            ["`!a`", "`a` худал бол / `a` is false"],
          ],
        },
        {
          kind: "code",
          cpp: `if (age >= 13 && age <= 19)  cout << "teenager";
if (day == 6 || day == 7)    cout << "weekend";
if (!finished)               cout << "still working";`,
          py: `if 13 <= age <= 19:      print("teenager")
if day == 6 or day == 7: print("weekend")
if not finished:         print("still working")`,
        },
        {
          kind: "note",
          only: "cpp",
          tone: "warn",
          mn: "Математик шиг `if (13 <= age <= 19)` гэж C++ хэлэнд бичиж **болохгүй**. `&&` ашиглан хоёр нөхцөл болгож бич.",
          en: "You cannot write `if (13 <= age <= 19)` in C++ the way you would in maths. Split it into two tests joined by `&&`.",
        },
      ],
    },
    {
      id: "short-circuit",
      title_mn: "Богино холболт",
      title_en: "Short-circuiting",
      blocks: [
        {
          kind: "text",
          only: "py",
          mn: "Богино холболт Python-д ч ижилхэн ажиллана: `and`-ийн зүүн тал худал бол баруун талыг огт шалгахгүй.",
          en: "Short-circuiting works the same in Python: if the left side of `and` is false, the right side is never looked at.",
        },
        {
          kind: "text",
          only: "cpp",
          mn: "`&&` -ийн зүүн тал худал бол баруун талыг **огт шалгахгүй**. `||` -ийн зүүн тал үнэн бол мөн адил. Энэ нь аюулгүй байдалд тустай.",
          en: "If the left side of `&&` is false, the right side is **never checked**. Same for `||` when the left side is true. This can protect you.",
        },
        {
          kind: "code",
          cpp: `if (n != 0 && total / n > 5) { … }
//   ↑ n тэг бол хуваалт хийгдэхгүй — 0-д хуваахаас сэргийллээ`,
          py: `if n != 0 and total / n > 5:
    ...`,
        },
      ],
    },
  ],

  // ── Unit 4 · Repeating Things ─────────────────────────────────────────
  "for-loop": [
    {
      id: "three-parts",
      title_mn: "Гурван хэсэг",
      title_en: "The three parts",
      blocks: [
        {
          kind: "text",
          only: "py",
          mn: "Python-д гурван хэсэгтэй `for` байхгүй. `for i in range(n)` гэж бичих бөгөөд `range` нь эхлэл, төгсгөл, алхамыг авна.",
          en: "Python has no three-part `for`. You write `for i in range(n)`, and `range` takes a start, an end and a step.",
        },
        {
          kind: "text",
          only: "cpp",
          mn: "`for` хаалт дотор цэг таслалаар тусгаарлагдсан гурван хэсэг байна.",
          en: "Inside the brackets of a `for` there are three parts, separated by semicolons.",
        },
        {
          kind: "code",
          cpp: `for (int i = 0; i < 5; i++) {
//   ─────────  ─────  ───
//   1 эхлэл    2 нөхцөл 3 алхам
    cout << i << " ";
}`,
          py: `for i in range(5):
    print(i, end=" ")`,
          output: "0 1 2 3 4",
        },
        {
          kind: "list",
          only: "cpp",
          ordered: true,
          mn: [
            "**Эхлэл** — нэг л удаа, давталт эхлэхээс өмнө ажиллана.",
            "**Нөхцөл** — эргэлт бүрийн өмнө шалгана. Худал болмогц давталт зогсоно.",
            "**Алхам** — эргэлт бүрийн төгсгөлд ажиллана.",
          ],
          en: [
            "**Start** — runs once, before the loop begins.",
            "**Condition** — checked before each turn; the loop stops when it becomes false.",
            "**Step** — runs at the end of every turn.",
          ],
        },
      ],
    },
    {
      id: "counting-down",
      title_mn: "Буурах ба алгасах",
      title_en: "Counting down, and skipping",
      blocks: [
        {
          kind: "code",
          cpp: `for (int i = 5; i >= 1; i--)  cout << i << " ";   // 5 4 3 2 1
for (int i = 0; i <= 10; i += 2) cout << i << " ";  // 0 2 4 6 8 10`,
          py: `for i in range(5, 0, -1):  print(i, end=" ")   # 5 4 3 2 1
for i in range(0, 11, 2):  print(i, end=" ")   # 0 2 4 6 8 10`,
        },
        {
          kind: "note",
          tone: "warn",
          mn: "`i < 5` бол **5 удаа** (0,1,2,3,4), `i <= 5` бол **6 удаа** (0…5) эргэнэ. Нэг зөрөх алдаа хамгийн түгээмэл.",
          en: "`i < 5` runs **5 times** (0–4); `i <= 5` runs **6 times** (0–5). Off-by-one is the classic loop bug.",
        },
      ],
    },
    {
      id: "range-for",
      title_mn: "Жагсаалт дээгүүр давтах",
      title_en: "Looping over a whole collection",
      blocks: [
        {
          kind: "text",
          mn: "Индекс хэрэггүй, зөвхөн утгууд хэрэгтэй бол богино хэлбэр бий.",
          en: "When you do not need the index — only the values — there is a shorter form.",
        },
        {
          kind: "code",
          cpp: `int marks[5] = {5, 3, 9, 1, 7};

for (int m : marks) {
    cout << m << " ";
}`,
          py: `marks = [5, 3, 9, 1, 7]

for m in marks:
    print(m, end=" ")`,
          output: "5 3 9 1 7",
        },
      ],
    },
  ],

  "while-loop": [
    {
      id: "which-loop",
      title_mn: "`for` эсвэл `while` — алийг нь?",
      title_en: "`for` or `while` — which one?",
      blocks: [
        {
          kind: "list",
          mn: [
            "Хэдэн удаа эргэхийг **урьдчилан мэдэж байвал** → `for`.",
            "Ямар нэг зүйл болтол эргэх бол → `while`.",
          ],
          en: [
            "You **know in advance** how many turns → `for`.",
            "You loop until something happens → `while`.",
          ],
        },
        {
          kind: "code",
          cpp: `int n;
while (cin >> n) {          // өгөгдөл дуустал
    cout << n * n << " ";
}`,
          py: `for line in sys.stdin:
    n = int(line)
    print(n * n, end=" ")`,
        },
      ],
    },
    {
      id: "infinite",
      title_mn: "Төгсгөлгүй давталт",
      title_en: "Infinite loops",
      blocks: [
        {
          kind: "text",
          mn: "Нөхцөл хэзээ ч худал болохгүй бол програм үүрд эргэнэ. Ихэвчлэн тоолуураа өөрчлөхөө мартсанаас болдог.",
          en: "If the condition never becomes false, the program loops forever. Usually it is because you forgot to change the counter.",
        },
        {
          kind: "code",
          cpp: `int i = 0;
while (i < 5) {
    cout << i;
    // i++;  ← мартсан! үүрд эргэнэ
}`,
          py: `i = 0
while i < 5:
    print(i)
    # i += 1  ← мартсан!`,
        },
      ],
    },
  ],

  "putting-it-together": [
    {
      id: "how-to-start",
      title_mn: "Бодлого хэрхэн эхлэх вэ",
      title_en: "How to start a problem",
      blocks: [
        {
          kind: "text",
          mn: "Шинэ бодлого хараад юунаас эхлэхээ мэдэхгүй байх нь хэвийн. Дараах дараалал бараг үргэлж ажилладаг.",
          en: "Staring at a new problem and not knowing where to begin is normal. This order almost always works.",
        },
        {
          kind: "list",
          ordered: true,
          mn: [
            "**Оролт, гаралтыг бич.** Юу орж ирэх вэ? Юу гарах ёстой вэ?",
            "**Гараар нэг жишээ бод.** Компьютергүйгээр цаасан дээр.",
            "**Алхмуудаа монголоор бич.** Кодоор биш, үгээр.",
            "**Алхам бүрийг код болго.** Нэг нэгээр нь.",
            "**Турш.** Хамгийн жижиг, хамгийн том, тэг, сөрөг утгаар.",
          ],
          en: [
            "**Write down the input and output.** What comes in? What must go out?",
            "**Work one example by hand.** On paper, without a computer.",
            "**Write the steps in plain words.** Not code — words.",
            "**Turn each step into code.** One at a time.",
            "**Test it.** Smallest case, largest case, zero, negatives.",
          ],
        },
      ],
    },
    {
      id: "debugging",
      title_mn: "Ажиллахгүй байвал",
      title_en: "When it does not work",
      cppOnly: true,
      blocks: [
        {
          kind: "list",
          mn: [
            "Хувьсагчаа хэвлэ: `cout << \"i=\" << i << endl;` — юу болж байгааг нүдээр хар.",
            "Компиляторын **эхний** алдааг л зас. Бусад нь ихэвчлэн түүний үр дагавар.",
            "Алдаа заасан мөрөөс **нэг мөр дээш** хар — цэг таслал ихэвчлэн тэнд мартагдсан байдаг.",
            "Хариу буруу гарвал давталтын хил (`<` эсвэл `<=`) -ээ шалга.",
          ],
          en: [
            "Print your variables: `cout << \"i=\" << i << endl;` — see what is actually happening.",
            "Fix only the compiler's **first** error. The rest are usually knock-on effects.",
            "Look **one line above** where it complains — that is where the semicolon is missing.",
            "If the answer is close but wrong, check your loop bounds (`<` versus `<=`).",
          ],
        },
      ],
    },
  ],

  // ── Unit 5 · Text and Lists ───────────────────────────────────────────
  strings: [
    {
      id: "concatenation",
      title_mn: "Мөр залгах",
      title_en: "Joining strings",
      blocks: [
        {
          kind: "text",
          mn: "`+` тэмдгээр хоёр мөрийг залгана. Тоог шууд залгаж болохгүй — эхлээд мөр болгох хэрэгтэй.",
          en: "Use `+` to join two strings. You cannot join a number directly — convert it first.",
        },
        {
          kind: "code",
          cpp: `string first = "Bat";
string last  = "Erdene";
string full  = first + " " + last;

cout << full << endl;`,
          py: `first = "Bat"
last  = "Erdene"
full  = first + " " + last

print(full)`,
          output: "Bat Erdene",
        },
      ],
    },
    {
      id: "indexing",
      title_mn: "Тэмдэгт тус бүрд хүрэх",
      title_en: "Reaching each character",
      blocks: [
        {
          kind: "text",
          only: "cpp",
          mn: "Мөрийн тэмдэгтүүд **0-оос** дугаарлагдана. `s[0]` бол эхний тэмдэгт, `s.size()` бол урт.",
          en: "Characters are numbered from **0**. `s[0]` is the first character and `s.size()` is the length.",
        },
        {
          kind: "text",
          only: "py",
          mn: "Мөрийн тэмдэгтүүд **0-оос** дугаарлагдана. `s[0]` бол эхний тэмдэгт, `len(s)` бол урт. Сөрөг индекс ч бий: `s[-1]` бол сүүлийн тэмдэгт.",
          en: "Characters are numbered from **0**. `s[0]` is the first character and `len(s)` is the length. Negative indexes work too: `s[-1]` is the last character.",
        },
        {
          kind: "code",
          cpp: `string s = "hello";

cout << s[0] << endl;         // h
cout << s.size() << endl;     // 5

for (int i = 0; i < s.size(); i++) {
    cout << s[i] << "-";
}`,
          py: `s = "hello"

print(s[0])       # h
print(len(s))     # 5

for ch in s:
    print(ch, end="-")`,
          output: "h\n5\nh-e-l-l-o-",
        },
      ],
    },
  ],

  getline: [
    {
      id: "mixing",
      title_mn: "`cin >>` ба `getline`-ыг хольж хэрэглэх",
      title_en: "Mixing `cin >>` and `getline`",
      cppOnly: true,
      blocks: [
        {
          kind: "text",
          mn: "Энэ бол хамгийн олон хүнийг гацаадаг урхи. `cin >> n` нь тоог уншаад мөрийн төгсгөлийн **шинэ мөрийг үлдээдэг**. Дараагийн `getline` тэр хоосон мөрийг л уншчихна.",
          en: "This is the trap that catches everyone. `cin >> n` reads the number but **leaves the new-line behind**. The next `getline` then reads that empty line.",
        },
        {
          kind: "code",
          cpp: `int n;
cin >> n;
string name;
getline(cin, name);   // ✗ хоосон мөр уншина!`,
          caption_mn: "Буруу:",
          caption_en: "Wrong:",
        },
        {
          kind: "code",
          cpp: `int n;
cin >> n;
cin.ignore();         // ← үлдсэн шинэ мөрийг хая
string name;
getline(cin, name);   // ✓ одоо зөв ажиллана`,
          caption_mn: "Зөв — `cin.ignore()` нэмнэ:",
          caption_en: "Right — add `cin.ignore()`:",
        },
      ],
    },
  ],

  arrays: [
    {
      id: "from-zero",
      title_mn: "Дугаарлалт 0-оос эхэлнэ",
      title_en: "Counting starts at zero",
      blocks: [
        {
          kind: "text",
          mn: "5 элементтэй массивын индексүүд нь **0, 1, 2, 3, 4** — 5 гэсэн индекс байхгүй.",
          en: "An array of 5 elements has indexes **0, 1, 2, 3, 4** — there is no index 5.",
        },
        {
          kind: "code",
          cpp: `int a[5] = {10, 20, 30, 40, 50};
//          ↑0  ↑1  ↑2  ↑3  ↑4

cout << a[0] << endl;   // 10 — эхний
cout << a[4] << endl;   // 50 — сүүлийн`,
          py: `a = [10, 20, 30, 40, 50]

print(a[0])    # 10
print(a[-1])   # 50 — Python-д сөрөг индекс бий`,
          output: "10\n50",
        },
        {
          kind: "note",
          tone: "warn",
          only: "cpp",
          mn: "`a[5]` гэж хандвал C++ алдаа заахгүй — санах ойн хогийг өгнө, эсвэл програм сүйрнэ. Хилээ өөрөө хянах ёстой.",
          en: "Reading `a[5]` gives no error in C++ — you get junk memory, or a crash. Staying inside the bounds is your job.",
        },
        {
          kind: "note",
          tone: "warn",
          only: "py",
          mn: "`a[5]` гэж хандвал Python шууд `IndexError` алдаа өгч зогсоно. C++-ээс ялгаатай нь чимээгүй өнгөрөхгүй — тиймээс алдаагаа тэр дороо олно.",
          en: "Reading `a[5]` stops the program with an `IndexError`. Unlike C++ it never passes silently, so you find the mistake straight away.",
        },
      ],
    },
    {
      id: "initialising",
      title_mn: "Массив дүүргэх аргууд",
      title_en: "Ways to fill an array",
      cppOnly: true,
      blocks: [
        {
          kind: "code",
          cpp: `int a[5] = {1, 2, 3, 4, 5};   // бүгдийг нь шууд
int b[5] = {0};               // бүгд тэг
int c[5];                     // хоосон — дотор нь хог
int d[] = {1, 2, 3};          // хэмжээг өөрөө тоолно (3)`,
        },
        {
          kind: "note",
          tone: "warn",
          mn: "Массивын хэмжээ нь **тогтмол** байх ёстой. `int n; cin >> n; int a[n];` гэдэг нь стандарт C++ дээр зөвшөөрөгдөхгүй — `vector` ашигла.",
          en: "An array's size must be a **constant**. `int n; cin >> n; int a[n];` is not standard C++ — use a `vector` instead.",
        },
      ],
    },
  ],

  "array-loops": [
    {
      id: "common-jobs",
      title_mn: "Байнга хийдэг дөрвөн ажил",
      title_en: "The four jobs you will do again and again",
      blocks: [
        {
          kind: "code",
          cpp: `int sum = 0;
for (int i = 0; i < n; i++) sum += a[i];        // нийлбэр

double avg = (double)sum / n;                   // дундаж`,
          py: `total = sum(a)
avg = total / len(a)`,
          caption_mn: "Нийлбэр ба дундаж:",
          caption_en: "Sum and average:",
        },
        {
          kind: "code",
          cpp: `int best = a[0];
for (int i = 1; i < n; i++) {
    if (a[i] > best) best = a[i];
}`,
          py: `best = max(a)`,
          caption_mn: "Хамгийн их утга — эхний элементээс эхэл:",
          caption_en: "The largest value — start from the first element:",
        },
        {
          kind: "code",
          cpp: `bool found = false;
for (int i = 0; i < n; i++) {
    if (a[i] == target) { found = true; break; }
}`,
          py: `found = target in a`,
          caption_mn: "Хайх — олмогц `break`:",
          caption_en: "Searching — `break` as soon as you find it:",
        },
        {
          kind: "note",
          tone: "warn",
          mn: "Хамгийн ихийг хайхдаа `int best = 0;` гэж бүү эхлүүл — бүх тоо сөрөг байвал буруу хариу гарна. Эхний элементээс эхэл.",
          en: "Do not start a maximum search from `int best = 0;` — if every value is negative you get the wrong answer. Start from the first element.",
        },
      ],
    },
  ],

  // ── Unit 6 · Bigger Programs ──────────────────────────────────────────
  "nested-loops": [
    {
      id: "how-it-runs",
      title_mn: "Хэрхэн ажилладаг вэ",
      title_en: "How it actually runs",
      blocks: [
        {
          kind: "text",
          mn: "Гадна давталтын **нэг** эргэлт бүрд дотоод давталт **бүхэлдээ** ажиллана. Тиймээс нийт эргэлт нь үржвэр болно.",
          en: "For **each** turn of the outer loop, the inner loop runs **all the way through**. So the total number of turns is the product.",
        },
        {
          kind: "code",
          cpp: `for (int i = 1; i <= 2; i++) {
    for (int j = 1; j <= 3; j++) {
        cout << i << j << " ";
    }
}`,
          py: `for i in range(1, 3):
    for j in range(1, 4):
        print(f"{i}{j}", end=" ")`,
          output: "11 12 13 21 22 23 ",
        },
      ],
    },
    {
      id: "two-d",
      title_mn: "Хоёр хэмжээст массив",
      title_en: "Two-dimensional arrays",
      blocks: [
        {
          kind: "text",
          only: "py",
          mn: "Python-д хүснэгтийг жагсаалтын жагсаалтаар үүсгэнэ. `[[0]*cols]*rows` гэвэл бүх мөр НЭГ жагсаалт болох тул болгоомжил.",
          en: "In Python a grid is a list of lists. Beware `[[0]*cols]*rows` — it makes every row the SAME list.",
        },
        {
          kind: "text",
          only: "cpp",
          mn: "Хүснэгт хэлбэрийн өгөгдөлд хоёр индекс хэрэгтэй: эхнийх нь **мөр**, хоёр дахь нь **багана**.",
          en: "Table-shaped data needs two indexes: the first is the **row**, the second is the **column**.",
        },
        {
          kind: "code",
          cpp: `int grid[3][4];          // 3 мөр, 4 багана

for (int r = 0; r < 3; r++) {
    for (int c = 0; c < 4; c++) {
        cin >> grid[r][c];
    }
}`,
          py: `grid = [[0] * 4 for _ in range(3)]

for r in range(3):
    row = list(map(int, input().split()))
    for c in range(4):
        grid[r][c] = row[c]`,
        },
      ],
    },
  ],

  functions: [
    {
      id: "why",
      title_mn: "Функц юунд хэрэгтэй вэ",
      title_en: "Why functions exist",
      blocks: [
        {
          kind: "list",
          mn: [
            "Нэг ажлыг олон газар давтахгүйгээр ашиглах.",
            "Урт програмыг нэр бүхий жижиг хэсгүүдэд хуваах.",
            "Алдаа гарвал нэг л газар засах.",
          ],
          en: [
            "Use one piece of work in many places without repeating it.",
            "Break a long program into small, named pieces.",
            "Fix a bug in one place instead of five.",
          ],
        },
      ],
    },
    {
      id: "anatomy-fn",
      title_mn: "Функцийн хэсгүүд",
      title_en: "The parts of a function",
      blocks: [
        {
          kind: "code",
          cpp: `int square(int x) {
//  ↑     ↑      ↑
//  |     |      └── параметр: юу авах вэ
//  |     └───────── нэр
//  └─────────────── буцаах төрөл

    return x * x;
}`,
          py: `def square(x):
    return x * x`,
        },
        {
          kind: "text",
          mn: "Юу ч буцаахгүй функцийн буцаах төрөл нь `void` болно.",
          en: "A function that returns nothing has the return type `void`.",
        },
        {
          kind: "code",
          cpp: `void greet(string name) {
    cout << "Hello, " << name << endl;
    // return хэрэггүй
}`,
          py: `def greet(name):
    print("Hello,", name)`,
        },
        {
          kind: "note",
          tone: "warn",
          mn: "Функцийг **ашиглахаасаа өмнө** зарлах ёстой. Тиймээс функцүүдээ `main`-ээс дээр бич.",
          en: "A function must be declared **before** it is used, so write your functions above `main`.",
        },
      ],
    },
  ],

  vectors: [
    {
      id: "growing",
      title_mn: "Ажиллаж байхдаа өсдөг",
      title_en: "It grows while the program runs",
      blocks: [
        {
          kind: "text",
          only: "py",
          mn: "Python-ы жагсаалт анхнаасаа уян хатан. `append` нэмнэ, `pop` хасна — тусдаа төрөл сонгох шаардлагагүй.",
          en: "A Python list is stretchy from the start. `append` adds and `pop` removes — there is no separate type to choose.",
        },
        {
          kind: "text",
          only: "cpp",
          mn: "Массиваас ялгаатай нь векторын хэмжээ урьдчилан мэдэгдэх шаардлагагүй. `push_back` нь төгсгөлд нь нэмнэ.",
          en: "Unlike an array, a vector's size does not have to be known in advance. `push_back` adds one to the end.",
        },
        {
          kind: "code",
          cpp: `#include <vector>

vector<int> v;              // хоосон
v.push_back(10);
v.push_back(20);

cout << v.size() << endl;   // 2
cout << v[0] << endl;       // 10`,
          py: `v = []
v.append(10)
v.append(20)

print(len(v))   # 2
print(v[0])     # 10`,
          output: "2\n10",
        },
      ],
    },
    {
      id: "useful",
      title_mn: "Хэрэгтэй үйлдлүүд",
      title_en: "Useful operations",
      blocks: [
        {
          kind: "table",
          head_mn: ["Бичих", "Утга"],
          head_en: ["You write", "What it does"],
          rows: [
            ["`v.push_back(x)`", "төгсгөлд нэмэх / add to the end"],
            ["`v.size()`", "хэдэн элемент байгаа / how many elements"],
            ["`v.empty()`", "хоосон эсэх / is it empty?"],
            ["`v.clear()`", "бүгдийг арилгах / remove everything"],
            ["`sort(v.begin(), v.end())`", "эрэмбэлэх / sort it"],
          ],
        },
        {
          kind: "code",
          cpp: `#include <algorithm>

vector<int> v = {5, 1, 4};
sort(v.begin(), v.end());     // 1 4 5

for (int x : v) cout << x << " ";`,
          py: `v = [5, 1, 4]
v.sort()          # 1 4 5

for x in v:
    print(x, end=" ")`,
          output: "1 4 5 ",
        },
      ],
    },
  ],

  // ── Lessons added to close the gaps ───────────────────────────────────
  operators: [
    {
      id: "arithmetic",
      title_mn: "Арифметик операторууд",
      title_en: "Arithmetic operators",
      cppOnly: true,
      blocks: [
        {
          kind: "table",
          head_mn: ["Оператор", "Утга", "Жишээ"],
          head_en: ["Operator", "Meaning", "Example"],
          rows: [
            ["`+`", "нэмэх / add", "`5 + 2` → 7"],
            ["`-`", "хасах / subtract", "`5 - 2` → 3"],
            ["`*`", "үржих / multiply", "`5 * 2` → 10"],
            ["`/`", "хуваах / divide", "`5 / 2` → 2"],
            ["`%`", "үлдэгдэл / remainder", "`5 % 2` → 1"],
          ],
        },
        {
          kind: "note",
          tone: "warn",
          mn: "`%` -ийг зөвхөн **бүхэл** тоонд хэрэглэнэ. `5.0 % 2` гэж бичвэл компиляцын алдаа гарна.",
          en: "`%` works only on **whole** numbers. Writing `5.0 % 2` is a compile error.",
        },
      ],
    },
    {
      id: "compound",
      title_mn: "Нэгтгэсэн оноолт",
      title_en: "Compound assignment",
      blocks: [
        {
          kind: "text",
          mn: "Хувьсагчийг **өөрөөр нь дамжуулан** өөрчлөх бүрд богино хэлбэр бий.",
          en: "Every time you change a variable **using its own value**, there is a short form.",
        },
        {
          kind: "table",
          head_mn: ["Богино", "Бүтэн"],
          head_en: ["Short form", "Full form"],
          rows: [
            ["`x += 5`", "`x = x + 5`"],
            ["`x -= 5`", "`x = x - 5`"],
            ["`x *= 2`", "`x = x * 2`"],
            ["`x /= 2`", "`x = x / 2`"],
            ["`x %= 3`", "`x = x % 3`"],
          ],
        },
        {
          kind: "code",
          cpp: `int total = 0;
for (int i = 1; i <= 5; i++) {
    total += i;      // total = total + i
}
cout << total;       // 15`,
          py: `total = 0
for i in range(1, 6):
    total += i
print(total)         # 15`,
          output: "15",
        },
      ],
    },
    {
      id: "increment",
      title_mn: "Нэмэгдүүлэх ба хорогдуулах",
      title_en: "Increment and decrement",
      cppOnly: true,
      blocks: [
        {
          kind: "text",
          mn: "`++` нь 1 нэмнэ, `--` нь 1 хасна. Хувьсагчийн **урд** (угтвар) эсвэл **ард** (дагавар) нь бичиж болно.",
          en: "`++` adds one and `--` subtracts one. It can go **before** the variable (prefix) or **after** it (postfix).",
        },
        {
          kind: "text",
          mn: "Хоёулаа хувьсагчийг ижилхэн өөрчилнө. Ялгаа нь **юу буцаахад** байна: угтвар нь **шинэ** утгыг, дагавар нь **хуучин** утгыг буцаана.",
          en: "Both change the variable in the same way. The difference is **what they hand back**: prefix gives the **new** value, postfix gives the **previous** one.",
        },
        {
          kind: "code",
          cpp: `int x { 1 };
int y;

y = ++x;   // x ба y хоёулаа одоо 2
y = x++;   // x нь 3 боллоо, харин y хэвээрээ 2`,
        },
        {
          kind: "code",
          cpp: `int x { 1 };
int y;

y = --x;   // x ба y хоёулаа одоо 0
y = x--;   // x нь -1 боллоо, харин y хэвээрээ 0`,
        },
        {
          kind: "note",
          tone: "tip",
          mn: "Давталтын `for (int i = 0; i < n; i++)` дотор ялгаа огт байхгүй — буцаасан утгыг ашиглахгүй тул `i++` ба `++i` адилхан.",
          en: "Inside `for (int i = 0; i < n; i++)` it makes no difference — the returned value is not used, so `i++` and `++i` behave identically.",
        },
      ],
    },
  ],

  "type-conversion": [
    {
      id: "implicit",
      title_mn: "Автоматаар хөрвөх",
      title_en: "Conversions that happen by themselves",
      cppOnly: true,
      blocks: [
        {
          kind: "text",
          mn: "Хоёр өөр төрөл уулзвал C++ өөрөө нэгийг нь хөрвүүлнэ. Ихэвчлэн **илүү багтаамжтай** төрөл рүү хөрвүүлнэ.",
          en: "When two different types meet, C++ converts one of them for you — usually towards the type that can hold more.",
        },
        {
          kind: "code",
          cpp: `int    a = 3;
double b = 2.5;

double c = a + b;    // a нь 3.0 болж хөрвөнө → 5.5
int    d = a + b;    // 5.5 гарч ирээд таслагдана → 5`,
        },
        {
          kind: "note",
          tone: "warn",
          mn: "Багтаамж багатай төрөл рүү хөрвөхөд мэдээлэл **чимээгүй** алдагдана. Компилятор ихэвчлэн зөвхөн сануулга өгнө.",
          en: "Converting towards a smaller type loses information **silently**. The compiler usually only warns.",
        },
      ],
    },
    {
      id: "explicit-cast",
      title_mn: "Гараар хөрвүүлэх",
      title_en: "Converting on purpose",
      blocks: [
        {
          kind: "text",
          only: "py",
          mn: "Python-д `int(x)`, `float(x)`, `str(x)` гэж хөрвүүлнэ. `int(\"abc\")` бол алдаа шидэнэ, чимээгүй хог өгөхгүй.",
          en: "Python converts with `int(x)`, `float(x)`, `str(x)`. `int(\"abc\")` raises an error rather than quietly giving rubbish.",
        },
        {
          kind: "text",
          only: "cpp",
          mn: "Хөрвүүлэлтийг өөрөө шаардах хоёр бичиглэл бий. Хоёулаа ажиллана; `static_cast` нь орчин үеийн, хайхад амархан хэлбэр.",
          en: "There are two spellings for demanding a conversion. Both work; `static_cast` is the modern one and is easier to search for.",
        },
        {
          kind: "code",
          cpp: `int sum = 7, n = 2;

double avg1 = (double)sum / n;               // 3.5
double avg2 = static_cast<double>(sum) / n;  // 3.5`,
          py: `total, n = 7, 2
avg = total / n      # Python-д хөрвүүлэх шаардлагагүй → 3.5`,
        },
      ],
    },
    {
      id: "auto",
      title_mn: "Төрлийг автоматаар тодорхойлох (`auto`)",
      title_en: "Automatic type deduction (`auto`)",
      cppOnly: true,
      blocks: [
        {
          kind: "text",
          mn: "Эхний утгаас нь төрөл нь илэрхий байвал `auto` гэж бичээд компиляторыг өөрөө таамаглуулж болно.",
          en: "When the type is obvious from the starting value, you can write `auto` and let the compiler work it out.",
        },
        {
          kind: "code",
          cpp: `auto count = 5;        // int
auto price = 19.99;    // double
auto letter = 'A';     // char
auto name = string("Bat");   // string`,
        },
        {
          kind: "note",
          tone: "warn",
          mn: "`auto` нь **эхний утга заавал шаардана**. `auto x;` гэж бичиж болохгүй — компилятор юу гэж таах вэ?",
          en: "`auto` **requires** a starting value. `auto x;` is an error — there would be nothing to deduce from.",
        },
        {
          kind: "note",
          tone: "tip",
          mn: "Урт төрлийн нэрэнд `auto` маш их тустай. Гэхдээ энгийн `int`-д `auto` бичих нь кодыг ойлгомжгүй болгож магадгүй.",
          en: "`auto` shines with long type names. For a plain `int` it can actually make code harder to read.",
        },
      ],
    },
  ],

  switch: [
    {
      id: "when-switch",
      title_mn: "Хэзээ `switch` хэрэглэх вэ",
      title_en: "When to reach for `switch`",
      cppOnly: true,
      blocks: [
        {
          kind: "list",
          mn: [
            "**Тохиромжтой:** нэг хувьсагчийг олон **тодорхой** утгатай тулгах (цэс, гарагийн дугаар, үсгэн үнэлгээ).",
            "**Тохиромжгүй:** муж шалгах (`score > 90`), бутархай тоо, мөр харьцуулах.",
          ],
          en: [
            "**Good fit:** one variable compared against many **exact** values (a menu, a day number, a letter grade).",
            "**Poor fit:** ranges (`score > 90`), decimals, or comparing strings.",
          ],
        },
      ],
    },
    {
      id: "ternary",
      title_mn: "Гурвалсан оператор `? :`",
      title_en: "The ternary operator `? :`",
      blocks: [
        {
          kind: "text",
          only: "py",
          mn: "Python-д `? :` байхгүй. `a if нөхцөл else b` гэж бичих бөгөөд уншихад ойлгомжтой.",
          en: "Python has no `? :`. You write `a if condition else b`, which reads closer to a sentence.",
        },
        {
          kind: "text",
          only: "cpp",
          mn: "Хоёрхон сонголттой, богинохон бол нэг мөрөнд багтааж болно.",
          en: "When there are only two outcomes and both are short, they fit on one line.",
        },
        {
          kind: "code",
          cpp: `string label = (age >= 18) ? "adult" : "child";

// ижил утгатай:
string label2;
if (age >= 18) label2 = "adult";
else           label2 = "child";`,
          py: `label = "adult" if age >= 18 else "child"`,
        },
        {
          kind: "note",
          only: "cpp",
          tone: "warn",
          mn: "Гурвалсан операторыг үүрлүүлж бүү бич. Хоёроос олон сонголт бол `if/else if` илүү уншигдана.",
          en: "Do not nest ternaries. Past two outcomes, `if/else if` reads far better.",
        },
      ],
    },
  ],

  "loop-control": [
    {
      id: "three-loops",
      title_mn: "Гурван давталтын харьцуулалт",
      title_en: "The three loops side by side",
      blocks: [
        {
          kind: "table",
          head_mn: ["Давталт", "Нөхцөлөө хэзээ шалгах", "Хэзээ хэрэглэх"],
          head_en: ["Loop", "Checks its condition", "Use it when"],
          rows: [
            [
              "`for`",
              "эхэнд / at the start",
              "эргэлтийн тоо мэдэгдэж байгаа / you know the count",
            ],
            [
              "`while`",
              "эхэнд / at the start",
              "ямар нэг зүйл болтол / you loop until something happens",
            ],
            [
              "`do…while`",
              "төгсгөлд / at the end",
              "ядаж нэг удаа ажиллах ёстой / it must run at least once",
            ],
          ],
        },
        {
          kind: "code",
          cpp: `// Хэрэглэгчээс зөв утга авах — do…while яг тохирно
int n;
do {
    cout << "Enter 1-10: ";
    cin >> n;
} while (n < 1 || n > 10);`,
          py: `while True:
    n = int(input("Enter 1-10: "))
    if 1 <= n <= 10:
        break`,
        },
      ],
    },
    {
      id: "break-in-nested",
      title_mn: "`break` үүрлэсэн давталтад",
      title_en: "`break` inside nested loops",
      blocks: [
        {
          kind: "text",
          mn: "`break` нь зөвхөн **өөрийнхөө** давталтаас гарна. Гадна давталт үргэлжилсээр байна.",
          en: "`break` leaves only **its own** loop. The outer loop carries on.",
        },
        {
          kind: "code",
          cpp: `for (int r = 0; r < 3; r++) {
    for (int c = 0; c < 3; c++) {
        if (c == 1) break;   // зөвхөн дотоод давталт зогсоно
        cout << r << c << " ";
    }
}`,
          py: `for r in range(3):
    for c in range(3):
        if c == 1:
            break
        print(f"{r}{c}", end=" ")`,
          output: "00 10 20 ",
        },
        {
          kind: "note",
          tone: "tip",
          mn: "Хоёуланг нь зогсоох бол тугийн хувьсагч ашигла, эсвэл тэр хэсгийг функц болгоод `return` хий.",
          en: "To stop both, use a flag variable — or move the code into a function and `return`.",
        },
      ],
    },
  ],

  "string-tools": [
    {
      id: "toolbox",
      title_mn: "Хэрэгслийн жагсаалт",
      title_en: "The toolbox",
      cppOnly: true,
      blocks: [
        {
          kind: "table",
          head_mn: ["Бичих", "Утга"],
          head_en: ["You write", "What it does"],
          rows: [
            ["`s.size()`", "урт / the length"],
            ["`s.empty()`", "хоосон эсэх / is it empty?"],
            ["`s[i]`", "`i` дугаарт тэмдэгт / the character at `i`"],
            ["`s.substr(a, n)`", "хэсэг таслах / take a piece"],
            ["`s.find(t)`", "`t` хаана байгаа / where `t` starts"],
            ["`s + t`", "залгах / join them"],
            ["`stoi(s)` · `to_string(n)`", "тоо ↔ мөр / number ↔ text"],
          ],
        },
      ],
    },
    {
      id: "case",
      title_mn: "Том жижиг үсэг",
      title_en: "Upper and lower case",
      blocks: [
        {
          kind: "text",
          only: "py",
          mn: "Python-д бүтэн мөрийг нэг дуудалтаар хөрвүүлнэ: `s.upper()`, `s.lower()`. Давталт хэрэггүй.",
          en: "Python converts a whole string in one call: `s.upper()`, `s.lower()`. No loop needed.",
        },
        {
          kind: "text",
          only: "cpp",
          mn: "`toupper` ба `tolower` нь **нэг** тэмдэгт дээр ажиллана. Бүтэн мөрийг хөрвүүлэхийн тулд давталт хэрэгтэй.",
          en: "`toupper` and `tolower` work on **one** character. Converting a whole string needs a loop.",
        },
        {
          kind: "code",
          cpp: `#include <cctype>

string s = "hello";
for (int i = 0; i < s.size(); i++) {
    s[i] = toupper(s[i]);
}
cout << s;      // HELLO`,
          py: `s = "hello"
print(s.upper())    # HELLO`,
          output: "HELLO",
        },
      ],
    },
    {
      id: "compare",
      title_mn: "Мөр харьцуулах",
      title_en: "Comparing strings",
      blocks: [
        {
          kind: "text",
          mn: "`string` төрлийг `==`, `<`, `>` -ээр шууд харьцуулж болно. Харьцуулалт нь толь бичгийн дараалалаар явагдана.",
          en: "You can compare a `string` directly with `==`, `<` and `>`. The order used is dictionary order.",
        },
        {
          kind: "code",
          cpp: `string a = "apple", b = "banana";

cout << (a == b) << endl;   // 0 (худал)
cout << (a < b)  << endl;   // 1 (үнэн — a эхэлж ирнэ)`,
          py: `a, b = "apple", "banana"
print(a == b)   # False
print(a < b)    # True`,
          output: "0\n1",
        },
        {
          kind: "note",
          tone: "warn",
          mn: "Том жижиг үсэг ялгаатай: `\"Apple\" == \"apple\"` бол **худал**.",
          en: "Case matters: `\"Apple\" == \"apple\"` is **false**.",
        },
      ],
    },
  ],

  "function-details": [
    {
      id: "value-vs-reference",
      title_mn: "Хуулбар уу, эх хувьсагч уу",
      title_en: "A copy, or the original?",
      cppOnly: true,
      blocks: [
        {
          kind: "table",
          head_mn: ["Бичиглэл", "Функц юу авах", "Эх хувьсагч өөрчлөгдөх үү"],
          head_en: ["You write", "The function gets", "Original changes?"],
          rows: [
            ["`void f(int x)`", "хуулбар / a copy", "Үгүй / No"],
            ["`void f(int& x)`", "эх хувьсагч / the original", "Тийм / Yes"],
            [
              "`void f(const int& x)`",
              "эх хувьсагч / the original",
              "Үгүй — хамгаалагдсан / No — protected",
            ],
          ],
        },
        {
          kind: "note",
          tone: "tip",
          mn: "`const &` нь том өгөгдөл (мөр, вектор) дамжуулахад тохиромжтой: хуулах зардалгүй, гэхдээ санамсаргүй өөрчлөхөөс хамгаална.",
          en: "`const &` is ideal for large data (strings, vectors): no copying cost, but still safe from accidental changes.",
        },
      ],
    },
    {
      id: "overloading",
      title_mn: "Ижил нэртэй функцууд",
      title_en: "Functions that share a name",
      cppOnly: true,
      blocks: [
        {
          kind: "text",
          mn: "Параметр нь өөр байвал хэдэн ч функц ижил нэртэй байж болно. Компилятор аргументаас чинь алийг нь дуудахаа мэднэ.",
          en: "Several functions may share a name as long as their parameters differ. The compiler picks the right one from your arguments.",
        },
        {
          kind: "code",
          cpp: `int    add(int a, int b)       { return a + b; }
double add(double a, double b) { return a + b; }

cout << add(2, 3) << endl;       // 5    — эхнийхийг дуудна
cout << add(2.5, 3.5) << endl;   // 6    — хоёрдахийг дуудна`,
        },
      ],
    },
    {
      id: "locals",
      title_mn: "Дотоод хувьсагч",
      title_en: "Local variables",
      blocks: [
        {
          kind: "text",
          mn: "Функц доторх хувьсагч зөвхөн тэр функцэд харагдана. Хоёр функц ижил нэр хэрэглэсэн ч огт өөр хувьсагчид байна.",
          en: "A variable declared inside a function is visible only there. Two functions may use the same name and still be completely separate.",
        },
        {
          kind: "code",
          cpp: `void a() { int count = 1; }
void b() { int count = 99; }   // огт өөр хувьсагч

int main() {
    // cout << count;   ✗ энд count гэж байхгүй
}`,
          py: `def a():
    count = 1

def b():
    count = 99   # огт өөр хувьсагч`,
        },
      ],
    },
  ],

  structs: [
    {
      id: "why-struct",
      title_mn: "Яагаад хэрэгтэй вэ",
      title_en: "Why bother",
      cppOnly: true,
      blocks: [
        {
          kind: "code",
          cpp: `string name1, name2, name3;
int    grade1, grade2, grade3;
double avg1, avg2, avg3;        // 30 сурагч болбол яах вэ?`,
          caption_mn: "Бүтэцгүйгээр — хурдан замбараагүй болно:",
          caption_en: "Without a struct — this falls apart quickly:",
        },
        {
          kind: "code",
          cpp: `struct Student {
    string name;
    int    grade;
    double average;
};

Student cls[30];      // 30 сурагч, нэг л мөр`,
          caption_mn: "Бүтэцтэйгээр:",
          caption_en: "With a struct:",
        },
      ],
    },
    {
      id: "array-of-structs",
      title_mn: "Бүтцийн массив",
      title_en: "An array of structs",
      blocks: [
        {
          kind: "text",
          only: "py",
          mn: "Python-д ижил зүйлийг толь бичиг (`dict`) эсвэл класс ашиглан жагсаалтад хийж илэрхийлнэ.",
          en: "In Python you hold the same thing as a list of dictionaries, or a list of small classes.",
        },
        {
          kind: "text",
          only: "cpp",
          mn: "Хамгийн түгээмэл хэрэглээ: олон бичлэг хадгалаад давталтаар боловсруулах.",
          en: "The most common use: store many records and walk through them with a loop.",
        },
        {
          kind: "code",
          cpp: `Student cls[3];
cls[0].name = "Bat";   cls[0].average = 92.5;
cls[1].name = "Saraa"; cls[1].average = 88.0;
cls[2].name = "Tuya";  cls[2].average = 95.5;

// Хамгийн өндөр дунджтайг олох
int best = 0;
for (int i = 1; i < 3; i++) {
    if (cls[i].average > cls[best].average) best = i;
}
cout << cls[best].name;   // Tuya`,
          py: `cls = [
    {"name": "Bat",   "average": 92.5},
    {"name": "Saraa", "average": 88.0},
    {"name": "Tuya",  "average": 95.5},
]

best = max(cls, key=lambda s: s["average"])
print(best["name"])   # Tuya`,
          output: "Tuya",
        },
      ],
    },
    {
      id: "struct-functions",
      title_mn: "Функцэд дамжуулах",
      title_en: "Passing a struct to a function",
      cppOnly: true,
      blocks: [
        {
          kind: "text",
          mn: "Бүтэц том байж болох тул хуулбарлахаас зайлсхийж `const &`-ээр дамжуулах нь зүйтэй.",
          en: "A struct can be large, so pass it by `const &` to avoid copying it.",
        },
        {
          kind: "code",
          cpp: `void show(const Student& s) {
    cout << s.name << ": " << s.average << endl;
}

show(cls[0]);`,
        },
      ],
    },
  ],
  // ── Unit 7 · Algorithm Foundations ────────────────────────────────────
  recursion: [
    {
      id: "watch-it-run",
      title_mn: "Алхам алхмаар харах",
      title_en: "Watch it run",
      blocks: [{ kind: "slides", deck: "recursion" }],
    },
    {
      id: "call-stack",
      title_mn: "Дуудалтууд хаана хадгалагддаг вэ",
      title_en: "Where the calls are kept",
      blocks: [
        {
          kind: "text",
          mn: "Функц өөрийгөө дуудахад хуучин дуудалт алга болдоггүй — хүлээж байдаг. Компьютер тэдгээрийг овоолго дээр хураана: сүүлд эхэлсэн нь эхэлж дуусна.",
          en: "When a function calls itself the older call does not vanish — it waits. The computer stacks them up: the one that started last finishes first.",
        },
        {
          kind: "code",
          cpp: `factorial(3)
  factorial(2)
    factorial(1)  ->  1
  2 * 1           ->  2
6`,
          caption_mn: "factorial(3) хэрхэн задарч, дараа нь буцаж эвхэгддэг вэ",
          caption_en: "How factorial(3) unfolds, then folds back up",
        },
        {
          kind: "text",
          mn: "Хамгийн доод дуудалт хариугаа буцаамагц дээд талынхаа хүлээж байсан үржүүлгүүд дараалан бодогдоно. Тийм учраас рекурсийг «доош яваад дараа нь буцаж ирдэг» гэж боддог.",
          en: "As soon as the deepest call answers, the multiplications waiting above it happen one by one. That is why recursion is described as going down and then coming back up.",
        },
        {
          kind: "note",
          tone: "warn",
          mn: "Дуудалт хэт олон давхарлавал энэ овоолго дүүрнэ. C++-д програм сүйрч, Python-д `RecursionError` гарна — анхдагчаар ойролцоогоор 1000 дуудалтын дараа.",
          en: "Too many layers and this stack fills up. C++ crashes; Python raises `RecursionError`, by default after about 1000 calls.",
        },
      ],
    },
    {
      id: "recursion-vs-loop",
      title_mn: "Рекурс үү, давталт уу",
      title_en: "Recursion or a loop?",
      blocks: [
        {
          kind: "text",
          mn: "Рекурсээр бичиж болох бүхнийг давталтаар бас бичиж болно. Сонголт нь аль нь ОЙЛГОМЖТОЙ бэ гэдгээс шалтгаална.",
          en: "Anything you can write with recursion you can also write with a loop. The choice is about which one READS more clearly.",
        },
        {
          kind: "table",
          head_mn: ["Бодлого", "Аль нь тохиромжтой"],
          head_en: ["Problem", "Which fits"],
          rows: [
            ["1-ээс n хүртэл нэмэх / Add 1 to n", "Давталт / A loop"],
            ["Массиваас хамгийн их утгыг олох / Largest in an array", "Давталт / A loop"],
            ["Модны мөчрүүдийг тойрох / Walking a tree", "Рекурс / Recursion"],
            ["Бүх боломжийг туршиж үзэх / Trying every possibility", "Рекурс / Recursion"],
          ],
        },
        {
          kind: "note",
          tone: "tip",
          mn: "Дүрэм: бодлого өөрөө «жижиг хувилбар нь дотроо байгаа» бүтэцтэй бол рекурс. Дараалсан алхмууд бол давталт.",
          en: "A rule of thumb: if the problem contains a smaller copy of itself, reach for recursion. If it is a sequence of steps, reach for a loop.",
        },
      ],
    },
  ],
  complexity: [
    {
      id: "watch-it-run",
      title_mn: "Алхам алхмаар харах",
      title_en: "Watch it run",
      blocks: [{ kind: "slides", deck: "complexity" }],
    },
    {
      id: "reading-limits",
      title_mn: "Хязгаараас аргаа сонгох",
      title_en: "Choosing from the limits",
      blocks: [
        {
          kind: "text",
          mn: "Бодлогын хязгаар нь санамсаргүй биш — аль арга багтахыг чамд хэлж өгч байгаа юм. Код бичихээсээ ӨМНӨ үүнийг хараарай.",
          en: "The limits in a problem are not arbitrary — they are telling you which approach will fit. Read them BEFORE you write any code.",
        },
        {
          kind: "table",
          head_mn: ["n хамгийн ихдээ", "Багтах арга"],
          head_en: ["n at most", "What fits"],
          rows: [
            ["10", "Бүх сэлгэмж, ухран буцах / Anything, even all permutations"],
            ["1 000", "O(n²) — хоёр давхар давталт / a double loop"],
            ["100 000", "O(n log n) — эрэмбэлэлт, хоёртын хайлт / sorting, binary search"],
            ["1 000 000", "O(n) — нэг л удаа явах / a single pass"],
          ],
        },
        {
          kind: "note",
          tone: "tip",
          mn: "Ойролцоогоор нэг секундэд 100 сая энгийн үйлдэл гэж тооц. Python бол үүнээс 10-50 дахин удаан — тиймээс C++ дээр багтдаг арга Python дээр багтахгүй байж болно.",
          en: "Reckon on about 100 million simple operations a second. Python is 10 to 50 times slower, so an approach that fits in C++ may not fit in Python.",
        },
      ],
    },
    {
      id: "what-counts",
      title_mn: "Юуг тоолох вэ",
      title_en: "What actually counts",
      blocks: [
        {
          kind: "text",
          mn: "Тогтмол тоо ач холбогдолгүй. O(2n) ба O(n) хоёрыг ижил гэж үздэг, учир нь n томрох тусам хоёулаа ижил хурдтай өснө. Чухал нь ӨСӨЛТИЙН ХЭЛБЭР.",
          en: "Constants do not matter. O(2n) and O(n) count as the same, because as n grows they grow at the same rate. What matters is the SHAPE of the growth.",
        },
        {
          kind: "list",
          mn: [
            "Дараалсан хоёр давталт — O(n) + O(n) = O(n).",
            "Давталт дотор давталт — O(n) × O(n) = O(n²).",
            "Хагасаар нь тасалж байвал — O(log n).",
            "Эрэмбэлэлт — O(n log n).",
          ],
          en: [
            "Two loops one after the other — O(n) + O(n) is still O(n).",
            "A loop inside a loop — O(n) × O(n) is O(n²).",
            "Halving the work each time — O(log n).",
            "Sorting — O(n log n).",
          ],
        },
      ],
    },
  ],
  grids: [
    {
      id: "watch-it-run",
      title_mn: "Алхам алхмаар харах",
      title_en: "Watch it run",
      blocks: [{ kind: "slides", deck: "grids" }],
    },
    {
      id: "grid-loops",
      title_mn: "Хүснэгтийг тойрох хэлбэрүүд",
      title_en: "Ways to walk a grid",
      blocks: [
        {
          kind: "text",
          mn: "Мөр гадна, багана дотор — энэ бол хэвшсэн хэлбэр. Солибол хүснэгтийг баганаар нь уншина, энэ нь заримдаа яг хэрэгтэй зүйл байдаг.",
          en: "Rows outside, columns inside — that is the usual shape. Swap them and you read the grid column by column, which is sometimes exactly what you want.",
        },
        {
          kind: "code",
          cpp: `// row by row
for (int r = 0; r < rows; r++)
    for (int c = 0; c < cols; c++)
        cout << g[r][c];

// column by column
for (int c = 0; c < cols; c++)
    for (int r = 0; r < rows; r++)
        cout << g[r][c];`,
          py: `# row by row
for r in range(rows):
    for c in range(cols):
        print(g[r][c], end="")

# column by column
for c in range(cols):
    for r in range(rows):
        print(g[r][c], end="")`,
        },
        {
          kind: "note",
          tone: "tip",
          mn: "Диагональ дээрх нүднүүд нь `r == c` байх нүднүүд. Эсрэг диагональ нь `r + c == n - 1`.",
          en: "The main diagonal is every cell where `r == c`. The other diagonal is where `r + c == n - 1`.",
        },
      ],
    },
    {
      id: "neighbours",
      title_mn: "Хөрш нүднүүд",
      title_en: "The neighbouring cells",
      blocks: [
        {
          kind: "text",
          mn: "Хүснэгтийн бодлогуудын ихэнх нь «энэ нүдний хажуугийнхыг хар» гэж шаарддаг. Дөрвөн чиглэлийг хоёр жижиг массивт хадгалбал код цэвэрхэн болно.",
          en: "Most grid problems ask you to look at the cells next to this one. Keeping the four directions in two small arrays keeps the code clean.",
        },
        {
          kind: "code",
          cpp: `int dr[4] = {-1, 1, 0, 0};   // up, down, left, right
int dc[4] = {0, 0, -1, 1};

for (int k = 0; k < 4; k++) {
    int nr = r + dr[k];
    int nc = c + dc[k];
    if (nr < 0 || nr >= rows) continue;   // outside
    if (nc < 0 || nc >= cols) continue;
    // nr, nc is a real neighbour
}`,
          py: `dr = [-1, 1, 0, 0]   # up, down, left, right
dc = [0, 0, -1, 1]

for k in range(4):
    nr, nc = r + dr[k], c + dc[k]
    if nr < 0 or nr >= rows: continue
    if nc < 0 or nc >= cols: continue
    # nr, nc is a real neighbour`,
        },
        {
          kind: "note",
          tone: "warn",
          mn: "Хязгаарыг ЭХЛЭЭД шалга. Python-д сөрөг индекс алдаа заахгүй — `g[-1]` нь сүүлийн мөрийг өгч, хариу чимээгүйхэн буруу болно.",
          en: "Check the bounds FIRST. In Python a negative index does not error — `g[-1]` gives the last row and the answer goes quietly wrong.",
        },
      ],
    },
  ],
  "arrays-in-functions": [
    {
      id: "watch-it-run",
      title_mn: "Алхам алхмаар харах",
      title_en: "Watch it run",
      blocks: [{ kind: "slides", deck: "arrays-in-functions" }],
    },
    {
      id: "copy-or-original",
      title_mn: "Хуулбар уу, эх нь үү",
      title_en: "A copy, or the original?",
      blocks: [
        {
          kind: "text",
          only: "cpp",
          mn: "C++-д гурван сонголт бий. Аль нь болохыг «уншиж байна уу, өөрчилж байна уу» гэдгээр шийднэ.",
          en: "C++ gives you three choices. Which one you want depends on whether you are reading or changing.",
        },
        {
          kind: "table",
          only: "cpp",
          head_mn: ["Бичлэг", "Утга"],
          head_en: ["Written as", "Meaning"],
          rows: [
            ["`vector<int> v`", "Хуулбар. Удаан, өөрчлөлт үлдэхгүй / A copy. Slow, changes are lost"],
            ["`vector<int>& v`", "Эх нь. Өөрчилж болно / The original. You may change it"],
            ["`const vector<int>& v`", "Эх нь, гэхдээ өөрчлөхгүй / The original, but read-only"],
          ],
        },
        {
          kind: "text",
          only: "py",
          mn: "Python-д сонголт байхгүй — жагсаалт үргэлж хуулбаргүй дамждаг. Тиймээс функц дотроос нүдийг өөрчилвөл гадна нь үлдэнэ.",
          en: "Python gives you no choice — a list is always handed over without copying. So changing a cell inside a function is visible outside it.",
        },
        {
          kind: "code",
          only: "py",
          py: `def add_one(v):
    for i in range(len(v)):
        v[i] += 1

nums = [1, 2, 3]
add_one(nums)
print(nums)`,
          cpp: `void addOne(vector<int>& v) {
    for (int& x : v) x++;
}`,
          output: "[2, 3, 4]",
        },
        {
          kind: "note",
          tone: "tip",
          mn: "Зөвхөн уншиж байгаа бол C++-д `const&` хэрэглэ. Хурдан бөгөөд санамсаргүй өөрчлөхөөс хамгаална.",
          en: "If you are only reading, use `const&` in C++. It is fast and it stops you changing anything by accident.",
        },
      ],
    },
  ],
  "fast-io": [
    {
      id: "watch-it-run",
      title_mn: "Алхам алхмаар харах",
      title_en: "Watch it run",
      blocks: [{ kind: "slides", deck: "fast-io" }],
    },
    {
      id: "reading-shapes",
      title_mn: "Оролтын гурван хэлбэр",
      title_en: "The three shapes of input",
      blocks: [
        {
          kind: "text",
          mn: "Бодлого оролтоо гурван янзаар өгдөг. Аль нь болохыг бодлогын «Оролтын формат» хэсгээс уншина.",
          en: "A problem gives you its input in one of three shapes. The Input Format section tells you which.",
        },
        {
          kind: "code",
          cpp: `// 1. the count comes first
int n; cin >> n;
vector<int> v(n);
for (int i = 0; i < n; i++) cin >> v[i];

// 2. read until the input runs out
int x;
while (cin >> x) v.push_back(x);

// 3. a whole line, spaces and all
string line;
getline(cin, line);`,
          py: `# 1. the count comes first
n = int(input())
v = list(map(int, input().split()))

# 2. read until the input runs out
import sys
v = [int(w) for line in sys.stdin for w in line.split()]

# 3. a whole line, spaces and all
line = input()`,
        },
        {
          kind: "note",
          tone: "warn",
          mn: "Хамгийн түгээмэл алдаа: тоонууд НЭГ мөрөнд байхад мөр бүрээс нэгийг уншихыг оролдох. Python-д `ValueError`, C++-д чимээгүй буруу хариу.",
          en: "The most common mistake: the numbers are on ONE line and you try to read one per line. Python raises `ValueError`; C++ just gives a wrong answer quietly.",
        },
      ],
    },
    {
      id: "why-sync",
      title_mn: "sync_with_stdio яагаад хурдасгадаг вэ",
      title_en: "Why sync_with_stdio helps",
      cppOnly: true,
      blocks: [
        {
          kind: "text",
          mn: "Анхдагчаар C++ нь `cin` бүрийг C хэлний `scanf`-тай тааруулж явдаг — хоёуланг нь хольж хэрэглэсэн ч дараалал зөв байхын тулд. Энэ баталгааг өгсөн нь уншилтыг удаашруулдаг.",
          en: "By default C++ keeps every `cin` in step with C's own `scanf`, so that mixing the two still comes out in order. Providing that guarantee is what makes reading slow.",
        },
        {
          kind: "text",
          mn: "Хольж хэрэглэхгүй бол баталгаа хэрэггүй. Тэр хоёр мөр нь «би зөвхөн cin/cout хэрэглэнэ» гэж хэлж байгаа хэрэг — 100 000 тоо уншихад ялгаа нь маш мэдэгдэхүйц.",
          en: "If you never mix them, you do not need the guarantee. Those two lines say \"I will only use cin and cout\" — and on a hundred thousand numbers the difference is dramatic.",
        },
        {
          kind: "code",
          cpp: `int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    // from here on: cin and cout only, never printf or scanf
}`,
        },
        {
          kind: "note",
          tone: "warn",
          mn: "Эдгээр мөрийг бичсэний дараа `printf`/`scanf` хэрэглэвэл гаралтын дараалал будлиантана. Нэгийг нь сонго.",
          en: "After those lines, using `printf` or `scanf` scrambles the order of your output. Pick one family and stay in it.",
        },
      ],
    },
  ],
  // ── Unit 8 · Searching and Sorting ────────────────────────────────────
  "linear-search": [
    {
      id: "watch-it-run",
      title_mn: "Алхам алхмаар харах",
      title_en: "Watch it run",
      blocks: [{ kind: "slides", deck: "linear-search" }],
    },
    {
      id: "first-or-all",
      title_mn: "Эхнийх үү, бүгд үү",
      title_en: "The first one, or all of them?",
      blocks: [
        {
          kind: "text",
          mn: "«Ол» гэсэн бодлого гурван өөр зүйл асууж болно. Аль нь болохыг мэдэхгүй бол код чинь бараг зөв, гэхдээ буруу байна.",
          en: "A problem that says \"find\" can be asking three different things. Get it wrong and your code is almost right, which is still wrong.",
        },
        {
          kind: "table",
          head_mn: ["Асуулт", "Юу хийх вэ"],
          head_en: ["The question", "What to do"],
          rows: [
            ["Байна уу? / Is it there?", "Олонгуут `true` буцаа / return `true` on the first hit"],
            ["Хаана байна? / Where is it?", "Олонгуут индексийг буцаа / return the index on the first hit"],
            ["Хэдэн ширхэг вэ? / How many?", "БҮГДИЙГ шалга, тоол / check them ALL and count"],
          ],
        },
        {
          kind: "note",
          tone: "warn",
          mn: "Тоолох бодлогод эрт зогсвол хариу үргэлж 1 болно. Хайх ба тоолох хоёр өөр давталт.",
          en: "Stopping early in a counting problem makes the answer always 1. Searching and counting are different loops.",
        },
      ],
    },
    {
      id: "sentinel",
      title_mn: "«Олдсонгүй»-г хэрхэн илэрхийлэх вэ",
      title_en: "Saying \"not found\"",
      blocks: [
        {
          kind: "text",
          mn: "Функц индекс буцаадаг бол «олдсонгүй» гэдгийг ямар нэг байдлаар хэлэх ёстой. Индекс хэзээ ч сөрөг байдаггүй тул -1 нь тохиромжтой тэмдэг.",
          en: "If a function returns an index it still has to be able to say \"not found\". An index is never negative, so -1 makes a safe marker.",
        },
        {
          kind: "code",
          cpp: `int pos = find(v, 42);
if (pos == -1) {
    cout << "not in the list" << endl;
} else {
    cout << "at index " << pos << endl;
}`,
          py: `pos = find(v, 42)
if pos == -1:
    print("not in the list")
else:
    print("at index", pos)`,
        },
        {
          kind: "note",
          tone: "warn",
          mn: "0-ийг «олдсонгүй» гэж бүү ашигла — 0 бол хүчинтэй индекс. Энэ алдаа зөвхөн эхний элемент дээр илэрдэг тул олоход хэцүү.",
          en: "Never use 0 for \"not found\" — 0 is a real index. The bug only shows up on the first element, which makes it hard to spot.",
        },
      ],
    },
  ],
  "sorting-tools": [
    {
      id: "watch-it-run",
      title_mn: "Алхам алхмаар харах",
      title_en: "Watch it run",
      blocks: [{ kind: "slides", deck: "sorting-tools" }],
    },
    {
      id: "stable-and-partial",
      title_mn: "Тэнцүү элементүүд ба хэсэгчилсэн эрэмбэ",
      title_en: "Ties, and sorting only part of it",
      blocks: [
        {
          kind: "text",
          mn: "Оноо тэнцвэл аль нь түрүүлэх вэ? `sort` энэ талаар ямар ч амлалт өгдөггүй. Дараалал чухал бол comparator дотроо хоёр дахь шалгуур нэм.",
          en: "When two scores tie, which comes first? `sort` makes no promise. If the order matters, add a second test inside the comparator.",
        },
        {
          kind: "code",
          cpp: `bool byScoreThenName(const Student& a, const Student& b) {
    if (a.score != b.score) return a.score > b.score;
    return a.name < b.name;      // tie-break
}`,
          py: `students.sort(key=lambda s: (-s.score, s.name))`,
        },
        {
          kind: "text",
          only: "py",
          mn: "Python-д хосыг түлхүүр болгож өгвөл эхнийхээр, тэнцвэл хоёр дахиар нь эрэмбэлнэ. Хасах тэмдэг тухайн талбарыг буурахаар болгоно.",
          en: "In Python a tuple key sorts by the first item, then by the second when they tie. A minus sign flips that one field to descending.",
        },
        {
          kind: "note",
          tone: "tip",
          only: "cpp",
          mn: "Хамгийн том 3-ыг л хэрэгтэй бол бүгдийг эрэмбэлэх шаардлагагүй: `partial_sort` эсвэл `nth_element` хурдан.",
          en: "If you only need the top 3, you do not have to sort everything: `partial_sort` or `nth_element` are faster.",
        },
      ],
    },
  ],
  "binary-search": [
    {
      id: "watch-it-run",
      title_mn: "Алхам алхмаар харах",
      title_en: "Watch it run",
      blocks: [{ kind: "slides", deck: "binary-search" }],
    },
    {
      id: "off-by-one",
      title_mn: "Нэгээр алдах гурван байрлал",
      title_en: "The three places it goes wrong",
      blocks: [
        {
          kind: "text",
          mn: "Хоёртын хайлт богинохон боловч алдах гурван цэгтэй. Ажиллахгүй байвал эхлээд эдгээрийг шалга.",
          en: "Binary search is short but it has three places to get wrong. When it misbehaves, check these first.",
        },
        {
          kind: "table",
          head_mn: ["Алдаа", "Үр дагавар"],
          head_en: ["Mistake", "What happens"],
          rows: [
            ["`hi = v.size()`", "Массиваас хэтэрнэ / reads past the end"],
            ["`while (lo < hi)`", "Сүүлийн элементийг алдана / misses the last element"],
            ["`lo = mid`", "Хэзээ ч дуусахгүй / loops forever"],
          ],
        },
        {
          kind: "note",
          tone: "tip",
          mn: "Шалгах хамгийн хурдан арга: 1 болон 2 элементтэй массив дээр гараар туршиж үз. Гурван алдаа бүгд тэнд илэрнэ.",
          en: "The quickest test: run it by hand on an array of one element, then two. All three mistakes show up there.",
        },
      ],
    },
    {
      id: "already-written",
      title_mn: "Бэлэн хувилбарууд",
      title_en: "The ones already written for you",
      blocks: [
        {
          kind: "text",
          mn: "Тэмцээнд өөрөө бичих шаардлагагүй — стандарт сан дотор бий. Гэхдээ юу хийж байгааг нь ойлгосон байх ёстой.",
          en: "In a contest you rarely write it yourself — the standard library has it. You still have to know what it does.",
        },
        {
          kind: "code",
          cpp: `// first position where v[i] >= x
int i = lower_bound(v.begin(), v.end(), x) - v.begin();

// is x present at all?
bool here = binary_search(v.begin(), v.end(), x);`,
          py: `import bisect

# first position where v[i] >= x
i = bisect.bisect_left(v, x)

# is x present at all?
here = i < len(v) and v[i] == x`,
        },
        {
          kind: "note",
          tone: "warn",
          mn: "Хоёулаа өгөгдөл ЭРЭМБЭЛЭГДСЭН гэж үзнэ. Эрэмбэлээгүй бол алдаа заахгүй, зүгээр л буруу хариу өгнө.",
          en: "Both assume the data is SORTED. On unsorted data they do not complain — they just answer wrongly.",
        },
      ],
    },
  ],
  "binary-search-answer": [
    {
      id: "watch-it-run",
      title_mn: "Алхам алхмаар харах",
      title_en: "Watch it run",
      blocks: [{ kind: "slides", deck: "binary-search-answer" }],
    },
    {
      id: "spotting-it",
      title_mn: "Энэ арга хэрэгтэйг хэрхэн таних вэ",
      title_en: "Recognising when to use it",
      blocks: [
        {
          kind: "text",
          mn: "Бодлого «хамгийн их», «хамгийн бага» гэж асууж, чи хариуг шууд бодож чадахгүй ч «энэ утга болох уу?» гэдгийг амархан шалгаж чадаж байвал энэ арга тохирно.",
          en: "The pattern: the problem asks for a largest or smallest value, you cannot compute it directly, but you CAN easily check whether a given value works.",
        },
        {
          kind: "list",
          mn: [
            "«Хамгийн урт нь хэд байж болох вэ?»",
            "«Хамгийн бага хугацаа хэд вэ?»",
            "«Хамгийн ихдээ хэдийг авч чадах вэ?»",
          ],
          en: [
            "\"What is the longest length possible?\"",
            "\"What is the smallest time needed?\"",
            "\"What is the most we can take?\"",
          ],
        },
        {
          kind: "note",
          tone: "warn",
          mn: "Заавал шалгах зүйл: хариу нэг чигт өөрчлөгдөж байна уу? Хэрэв 5 болж байгаа бол 4 ч бас болох ёстой. Үгүй бол энэ арга ажиллахгүй.",
          en: "Always check first: does the answer change in one direction only? If 5 works, 4 must also work. If not, this method does not apply.",
        },
      ],
    },
  ],
  "prefix-sums": [
    {
      id: "watch-it-run",
      title_mn: "Алхам алхмаар харах",
      title_en: "Watch it run",
      blocks: [{ kind: "slides", deck: "prefix-sums" }],
    },
    {
      id: "when-worth-it",
      title_mn: "Хэзээ ашигтай вэ",
      title_en: "When it is worth building",
      blocks: [
        {
          kind: "text",
          mn: "Угтвар нийлбэр бэлдэхэд нэг удаагийн O(n) зардал гарна. Ганц асуултад хариулах бол шууд давталт нь хямд. Ашиг нь ОЛОН асуулт ирэхэд гарна.",
          en: "Building the table costs one O(n) pass. For a single question a plain loop is cheaper. The gain arrives when there are MANY questions.",
        },
        {
          kind: "table",
          head_mn: ["Асуултын тоо", "Давталтаар", "Угтвар нийлбэрээр"],
          head_en: ["Queries", "With a loop", "With prefix sums"],
          rows: [
            ["1", "n", "n"],
            ["1 000", "1 000 × n", "n + 1 000"],
            ["100 000", "100 000 × n", "n + 100 000"],
          ],
        },
      ],
    },
    {
      id: "two-d-prefix",
      title_mn: "Хүснэгт дээрх угтвар нийлбэр",
      title_en: "Prefix sums on a grid",
      blocks: [
        {
          kind: "text",
          mn: "Ижил санаа хоёр хэмжээст хүснэгт дээр ч ажиллана. Тэгш өнцөгтийн нийлбэрийг дөрвөн утгаар гаргана — давхар тоологдсон хэсгийг буцааж нэмнэ.",
          en: "The same idea works on a grid. A rectangle's total comes from four values — with the doubly-subtracted corner added back.",
        },
        {
          kind: "code",
          cpp: `// build
p[r][c] = g[r][c] + p[r-1][c] + p[r][c-1] - p[r-1][c-1];

// sum of the rectangle (r1,c1) to (r2,c2)
total = p[r2][c2] - p[r1-1][c2] - p[r2][c1-1] + p[r1-1][c1-1];`,
        },
        {
          kind: "note",
          tone: "tip",
          mn: "Сүүлийн `+` нь алдаа биш. Зүүн дээд булангийн хэсгийг хоёр удаа хассан тул нэг удаа буцааж нэмж байна.",
          en: "That last `+` is not a mistake. The top-left region was subtracted twice, so it is added back once.",
        },
      ],
    },
  ],
  // ── Unit 9 · Ready-made Containers ────────────────────────────────────
  "stl-map-set": [
    {
      id: "watch-it-run",
      title_mn: "Алхам алхмаар харах",
      title_en: "Watch it run",
      blocks: [{ kind: "slides", deck: "stl-map-set" }],
    },
    {
      id: "which-container",
      title_mn: "Аль савыг сонгох вэ",
      title_en: "Which container to reach for",
      blocks: [
        {
          kind: "text",
          mn: "Гурван асуулт л шийдвэрлэнэ: дараалал чухал уу, давхардал байж болох уу, түлхүүрээр хайх уу.",
          en: "Three questions decide it: does order matter, are duplicates allowed, and are you looking things up by a key?",
        },
        {
          kind: "table",
          head_mn: ["Хэрэгцээ", "Сав"],
          head_en: ["What you need", "Container"],
          rows: [
            ["Дараалал хэвээр, давхардал зөвшөөрнө / Keep the order, allow duplicates", "`vector`"],
            ["Давхардалгүй, эрэмбэтэй / No duplicates, kept sorted", "`set`"],
            ["Түлхүүр → утга / Key to value", "`map`"],
            ["Зөвхөн байгаа эсэхийг мэдэх / Only membership", "`set`"],
          ],
        },
        {
          kind: "note",
          tone: "tip",
          mn: "`vector` дотор хайх нь O(n), `set` дотор O(log n). Гэхдээ жижиг өгөгдөл дээр `vector` илүү хурдан байдаг — 20 элемент дээр ялгаа мэдэгдэхгүй.",
          en: "Searching a `vector` is O(n), a `set` is O(log n). But on small data a `vector` is actually faster — at 20 elements you will not notice.",
        },
      ],
    },
    {
      id: "counting-idiom",
      title_mn: "Тоолох хэв маяг",
      title_en: "The counting idiom",
      blocks: [
        {
          kind: "text",
          mn: "«Юу хэдэн удаа гарсан бэ» гэдэг нь маш түгээмэл бодлого. Хоёр хэлэнд хоёулаа нэг мөр, гэхдээ өөр өөр.",
          en: "\"How many times did each thing appear?\" is a very common problem. One line in both languages — but not the same line.",
        },
        {
          kind: "code",
          cpp: `map<string, int> count;
for (const string& w : words) {
    count[w]++;          // missing keys start at 0
}`,
          py: `count = {}
for w in words:
    count[w] = count.get(w, 0) + 1
# or: from collections import Counter; count = Counter(words)`,
        },
        {
          kind: "note",
          tone: "warn",
          only: "cpp",
          mn: "`count[\"x\"]` гэж УНШИХАД ч бичлэг үүснэ. Зөвхөн шалгах бол `count.count(\"x\")` эсвэл `count.find(\"x\")` хэрэглэ.",
          en: "Even READING `count[\"x\"]` creates the entry. To test without creating, use `count.count(\"x\")` or `count.find(\"x\")`.",
        },
        {
          kind: "note",
          tone: "warn",
          only: "py",
          mn: "Python-ы `dict` нь C++-ийн `map`-аас ялгаатай нь өөрөө үүсгэдэггүй — байхгүй түлхүүр рүү хандвал `KeyError`. Тийм учраас `get(w, 0)` хэрэглэдэг.",
          en: "Unlike a C++ `map`, a Python `dict` does not auto-create — a missing key raises `KeyError`. That is why `get(w, 0)` is used.",
        },
      ],
    },
  ],
  "stack-queue": [
    {
      id: "watch-it-run",
      title_mn: "Алхам алхмаар харах",
      title_en: "Watch it run",
      blocks: [{ kind: "slides", deck: "stack-queue" }],
    },
    {
      id: "which-one",
      title_mn: "Аль нь хэрэгтэйг таних",
      title_en: "Telling which one you need",
      blocks: [
        {
          kind: "text",
          mn: "Бодлогын үг өөрөө хэлж өгдөг. «Хамгийн сүүлийнх», «буцах», «эвхэх» гэвэл стек. «Ээлж», «дараалал», «хамгийн эртнийх» гэвэл дараалал.",
          en: "The wording usually tells you. \"Most recent\", \"undo\", \"go back\" means a stack. \"Queue\", \"in turn\", \"oldest first\" means a queue.",
        },
        {
          kind: "list",
          mn: [
            "Хаалт тохирч байгаа эсэх — стек.",
            "Товчлуурын буцаах түүх — стек.",
            "Хэвлэх ажлын дараалал — дараалал.",
            "Хүснэгт дээрх өргөн хайлт — дараалал.",
          ],
          en: [
            "Checking that brackets match — a stack.",
            "The undo history of a button — a stack.",
            "A printer's job list — a queue.",
            "Breadth-first search on a grid — a queue.",
          ],
        },
      ],
    },
    {
      id: "pop-differences",
      title_mn: "pop нь хоёр хэлэнд өөр",
      title_en: "pop does not mean the same thing",
      blocks: [
        {
          kind: "text",
          mn: "Энэ бол хэл сольсон сурагчийн хамгийн түгээмэл бүдрэл: `pop` C++-д юу ч буцаадаггүй, Python-д буцаадаг.",
          en: "This is the most common stumble for a student switching languages: `pop` returns nothing in C++, and returns the value in Python.",
        },
        {
          kind: "code",
          cpp: `int x = st.top();   // read it
st.pop();           // then remove it`,
          py: `x = st.pop()        # reads AND removes`,
        },
        {
          kind: "note",
          tone: "warn",
          mn: "C++-д хоосон стект `top()` эсвэл `pop()` дуудвал програм ажиллах үедээ сүйрнэ — компилятор анхааруулахгүй. Үргэлж `empty()` шалга.",
          en: "In C++, calling `top()` or `pop()` on an empty stack crashes at run time with no compiler warning. Always test `empty()` first.",
        },
      ],
    },
  ],
  "priority-queue": [
    {
      id: "watch-it-run",
      title_mn: "Алхам алхмаар харах",
      title_en: "Watch it run",
      blocks: [{ kind: "slides", deck: "priority-queue" }],
    },
    {
      id: "opposite-defaults",
      title_mn: "Хоёр хэл эсрэг талдаа",
      title_en: "The two languages default opposite ways",
      blocks: [
        {
          kind: "text",
          mn: "Энэ ялгааг мэдэхгүй бол алгоритм чинь эсрэгээрээ ажиллана — алдаа заахгүй, зүгээр л буруу хариу гарна.",
          en: "Miss this difference and your algorithm runs backwards — no error, just a wrong answer.",
        },
        {
          kind: "table",
          head_mn: ["Хэл", "Анхдагчаар дээрээ", "Эсрэгээр болгох"],
          head_en: ["Language", "On top by default", "How to flip it"],
          rows: [
            ["C++ `priority_queue`", "Хамгийн ИХ / the LARGEST", "`greater<int>`"],
            ["Python `heapq`", "Хамгийн БАГА / the SMALLEST", "Сөрөг утга хийх / push negatives"],
          ],
        },
        {
          kind: "code",
          cpp: `priority_queue<int> big;                                  // largest on top
priority_queue<int, vector<int>, greater<int>> small;     // smallest on top`,
          py: `import heapq
small = []                    # smallest on top, by default
heapq.heappush(small, x)
heapq.heappush(big, -x)       # negate for a max-heap`,
        },
      ],
    },
    {
      id: "custom-order",
      title_mn: "Өөрийн бүтцийг дараалалд хийх",
      title_en: "Putting your own struct in the queue",
      blocks: [
        {
          kind: "text",
          mn: "Дейкстрад «зай, цэг» гэсэн хос хэрэгтэй болно. Хамгийн бага зайг дээр гаргахын тулд юугаар харьцуулахыг хэлж өгөх ёстой.",
          en: "Dijkstra needs a pair of \"distance, node\". To get the smallest distance on top you have to say what to compare by.",
        },
        {
          kind: "code",
          cpp: `// pair compares by .first, so put the distance there
priority_queue<pair<int,int>, vector<pair<int,int>>, greater<>> pq;
pq.push({0, start});          // {distance, node}`,
          py: `import heapq
pq = []
heapq.heappush(pq, (0, start))   # (distance, node) - tuples compare by [0]`,
        },
        {
          kind: "note",
          tone: "warn",
          mn: "Дараалал нь ЭХНИЙ талбараар харьцуулна. Цэгээ түрүүлж бичвэл дараалал зайгаар биш дугаараар эрэмбэлэгдэж, алгоритм чинь чимээгүйхэн буруу болно.",
          en: "The queue compares by the FIRST field. Put the node first and it orders by node number instead of distance — and your algorithm is quietly wrong.",
        },
      ],
    },
  ],
  "two-pointers": [
    {
      id: "watch-it-run",
      title_mn: "Алхам алхмаар харах",
      title_en: "Watch it run",
      blocks: [{ kind: "slides", deck: "two-pointers" }],
    },
    {
      id: "other-shapes",
      title_mn: "Хоёр заагчийн бусад хэлбэр",
      title_en: "The other shapes this takes",
      blocks: [
        {
          kind: "text",
          mn: "Хоёр захаас дөхөх нь ганц хэлбэр биш. Хоёр заагч нэг чигт хамт хөдөлж, хөдлөх цонх үүсгэж бас болно.",
          en: "Closing in from both ends is only one shape. Two pointers can also move the same way together, making a sliding window.",
        },
        {
          kind: "table",
          head_mn: ["Хэлбэр", "Ямар бодлогод"],
          head_en: ["Shape", "Used for"],
          rows: [
            ["Хоёр захаас дунд руу / Both ends inwards", "Нийлбэр нь S болох хос / a pair adding to S"],
            ["Хоёулаа урагш / Both moving forward", "Хамгийн урт хэсэг / longest run with a property"],
            ["Нэг нь хурдан, нэг нь удаан / One fast, one slow", "Дундажийг олох, мөчлөг илрүүлэх / finding the middle, detecting a cycle"],
          ],
        },
        {
          kind: "note",
          tone: "tip",
          mn: "Хоёр заагчийн гол ашиг: заагч бүр массивыг НЭГ л удаа гатална. Тийм учраас O(n²) биш O(n) болдог.",
          en: "The gain is always the same: each pointer crosses the array ONCE. That is what turns O(n²) into O(n).",
        },
      ],
    },
    {
      id: "needs-sorted",
      title_mn: "Эрэмбэлсэн байх шаардлага",
      title_en: "When it needs sorted data",
      blocks: [
        {
          kind: "text",
          mn: "Хоёр захаас дөхөх хэлбэр нь өгөгдөл ЭРЭМБЭЛЭГДСЭН гэдэгт найддаг: «нийлбэр их байна» гэдэг нь баруун заагчийг зөөх ёстой гэсэн үг байхын тулд эрэмбэ хэрэгтэй.",
          en: "The closing-in shape leans on the data being SORTED: \"the sum is too big\" only tells you to move the right pointer if the values are in order.",
        },
        {
          kind: "table",
          head_mn: ["Хэлбэр", "Эрэмбэ хэрэгтэй юу"],
          head_en: ["Shape", "Needs sorting?"],
          rows: [
            ["Хоёр захаас дунд руу / Both ends inwards", "Тийм / yes"],
            ["Хөдлөх цонх / Sliding window", "Үгүй / no"],
            ["Хурдан ба удаан / Fast and slow", "Үгүй / no"],
          ],
        },
        {
          kind: "note",
          tone: "tip",
          mn: "Эрэмбэлэх нь O(n log n) — хоёр заагчийн O(n)-ээс удаан. Гэхдээ O(n²)-аас хамаагүй хурдан хэвээр байна.",
          en: "Sorting costs O(n log n), slower than the O(n) walk itself. It is still far faster than the O(n²) you replaced.",
        },
      ],
    },
  ],
  // ── Unit 10 · Algorithm Techniques ────────────────────────────────────
  greedy: [
    {
      id: "watch-it-run",
      title_mn: "Алхам алхмаар харах",
      title_en: "Watch it run",
      blocks: [{ kind: "slides", deck: "greedy" }],
    },
    {
      id: "proving-greedy",
      title_mn: "Шуналт арга зөв эсэхийг шалгах",
      title_en: "Checking whether greedy is right",
      blocks: [
        {
          kind: "text",
          mn: "Шуналт арга бол таамаг, баталгаа биш. Кодоо бичихээсээ өмнө жижиг эсрэг жишээ хайж 2 минут зарцуулах нь буруу шийдлээр хагас цаг зарцуулахаас хамаагүй хямд.",
          en: "Greedy is a guess, not a guarantee. Two minutes hunting for a small counterexample is far cheaper than half an hour on a wrong solution.",
        },
        {
          kind: "list",
          ordered: true,
          mn: [
            "Аргаа нэг өгүүлбэрээр бич: «Би үргэлж хамгийн … -г авна».",
            "Хамгийн жижиг жишээ 3-4 ширхэг гараар бод.",
            "Тэр аргаар БУРУУ гарах жишээ хайж үз.",
            "Олдохгүй бол үргэлжлүүл. Олдвол өөр арга хэрэгтэй.",
          ],
          en: [
            "Write your rule as one sentence: \"I always take the …\".",
            "Work three or four tiny cases by hand.",
            "Actively try to build a case where the rule gives the wrong answer.",
            "If you cannot find one, go ahead. If you can, you need another method.",
          ],
        },
        {
          kind: "note",
          tone: "tip",
          mn: "Шуналт арга бүтэлгүйтвэл ихэвчлэн дараагийн алхам нь динамик програмчлал байдаг — «одоо хамгийн сайн» биш «бүх боломжийг тооц» гэсэн шилжилт.",
          en: "When greedy fails, the next step is usually dynamic programming — moving from \"best right now\" to \"account for every possibility\".",
        },
      ],
    },
    {
      id: "sort-first",
      title_mn: "Ихэнх шуналт бодлого эрэмбэлэлтээр эхэлдэг",
      title_en: "Most greedy problems start with a sort",
      blocks: [
        {
          kind: "text",
          mn: "«Хамгийн сайныг ав» гэдэг нь «эрэмбэлээд эхнээс нь ав» гэсэн үг байдаг. Асуулт нь ЮУГААР эрэмбэлэх вэ гэдэг — тэр сонголт нь бодлогын гол цөм байдаг.",
          en: "\"Take the best\" usually means \"sort, then take from the front\". The question is what to sort BY — and that choice is the whole problem.",
        },
        {
          kind: "table",
          head_mn: ["Бодлого", "Юугаар эрэмбэлэх"],
          head_en: ["Problem", "Sort by"],
          rows: [
            ["Хамгийн олон арга хэмжээнд оролцох / Attend the most events", "Хамгийн эрт ДУУСАХААР / earliest FINISH time"],
            ["Хамгийн бага зоос / Fewest coins", "Хамгийн том дэвсгэртээр / largest coin first"],
            ["Хамгийн бага хүлээлт / Shortest total waiting", "Хамгийн богино ажлаар / shortest job first"],
          ],
        },
        {
          kind: "note",
          tone: "warn",
          mn: "Арга хэмжээний бодлогод ЭХЛЭХ цагаар эрэмбэлэх нь буруу хариу өгдөг. Дуусах цаг л зөв шалгуур.",
          en: "For the events problem, sorting by START time gives the wrong answer. Only the finish time works.",
        },
      ],
    },
  ],
  backtracking: [
    {
      id: "watch-it-run",
      title_mn: "Алхам алхмаар харах",
      title_en: "Watch it run",
      blocks: [{ kind: "slides", deck: "backtracking" }],
    },
    {
      id: "the-shape",
      title_mn: "Ухран буцахын хэв маяг",
      title_en: "The shape every backtracking solution has",
      blocks: [
        {
          kind: "text",
          mn: "Бодлого өөр байсан ч араг яс нь ижил. Үүнийг цээжилбэл шинэ бодлогод хэсгүүдийг нь л дүүргэнэ.",
          en: "The problems differ but the skeleton does not. Learn it once and a new problem is only a matter of filling in the parts.",
        },
        {
          kind: "code",
          cpp: `void solve(State& s) {
    if (isComplete(s)) { record(s); return; }

    for (each choice) {
        if (!allowed(choice, s)) continue;

        apply(choice, s);      // 1. choose
        solve(s);              // 2. go deeper
        undo(choice, s);       // 3. undo  <- the step people forget
    }
}`,
          py: `def solve(s):
    if is_complete(s):
        record(s)
        return

    for choice in choices:
        if not allowed(choice, s):
            continue

        apply(choice, s)       # 1. choose
        solve(s)               # 2. go deeper
        undo(choice, s)        # 3. undo  <- the step people forget`,
        },
        {
          kind: "note",
          tone: "tip",
          mn: "`allowed` шалгалт нь хурдны түлхүүр. Буруу салааг ЭРТ таслах тусам ажил экспоненциалаар багасна — үүнийг тайрах (pruning) гэдэг.",
          en: "The `allowed` test is where the speed comes from. Cutting a doomed branch EARLY removes exponentially much work — that is called pruning.",
        },
      ],
    },
    {
      id: "count-or-list",
      title_mn: "Тоолох уу, жагсаах уу",
      title_en: "Counting them, or listing them",
      blocks: [
        {
          kind: "text",
          mn: "Бодлого «хэдэн арга байна вэ» гэж асуувал бүх хариуг хадгалах шаардлагагүй — тоолуур л хангалттай. Санах ой хэмнэнэ.",
          en: "If the problem asks \"how many ways\", you do not need to keep the answers — a counter is enough, and it saves all that memory.",
        },
        {
          kind: "code",
          cpp: `int count = 0;

void solve(State& s) {
    if (isComplete(s)) { count++; return; }   // just count it
    ...
}`,
          py: `count = 0

def solve(s):
    global count
    if is_complete(s):
        count += 1        # just count it
        return`,
        },
        {
          kind: "note",
          tone: "warn",
          mn: "Бүх хариуг жагсаах бол хуулбарыг нь хадгал. Ажлын массивыг өөрийг нь хийвэл дараа нь өөрчлөгдөж, эцэст нь бүх мөр ижил болно.",
          en: "If you do have to list them, store a COPY. Push the working array itself and later steps change it — every saved answer ends up identical.",
        },
      ],
    },
  ],
  "dp-intro": [
    {
      id: "watch-it-run",
      title_mn: "Алхам алхмаар харах",
      title_en: "Watch it run",
      blocks: [{ kind: "slides", deck: "dp-intro" }],
    },
    {
      id: "two-directions",
      title_mn: "Дээрээс доош, доороос дээш",
      title_en: "Top-down and bottom-up",
      blocks: [
        {
          kind: "text",
          mn: "Динамик програмчлалыг хоёр янзаар бичдэг. Хоёулаа ижил ажил хийнэ — ялгаа нь бичих хэлбэрт л байна.",
          en: "Dynamic programming is written two ways. They do the same work; only the shape on the page differs.",
        },
        {
          kind: "table",
          head_mn: ["", "Дээрээс доош (memo)", "Доороос дээш (хүснэгт)"],
          head_en: ["", "Top-down (memo)", "Bottom-up (table)"],
          rows: [
            ["Хэлбэр / Looks like", "Рекурс + санах ой / recursion plus a cache", "Давталт + массив / a loop filling an array"],
            ["Бичихэд / To write", "Амархан / easier", "Бодох шаардлагатай / needs more thought"],
            ["Хурд / Speed", "Арай удаан / slightly slower", "Хурдан / faster"],
            ["Эрсдэл / Risk", "Стек дүүрэх / stack overflow", "Дараалал буруу / filling in the wrong order"],
          ],
        },
        {
          kind: "note",
          tone: "tip",
          mn: "Эхлээд рекурсээр бич, ажиллуулж үз, дараа нь memo нэм. Ажиллаж байгаа удаан шийдлийг хурдасгах нь хоосон хүснэгтээс эхлэхээс хамаагүй амархан.",
          en: "Write the plain recursion first, check it works, then add the memo. Speeding up something correct is much easier than starting from an empty table.",
        },
      ],
    },
    {
      id: "spotting-dp",
      title_mn: "DP хэрэгтэйг таних",
      title_en: "Recognising a DP problem",
      blocks: [
        {
          kind: "text",
          mn: "Хоёр шинж хоюулаа байвал DP тохирно. Ганц нь байхад хангалтгүй.",
          en: "Two properties have to hold together. One on its own is not enough.",
        },
        {
          kind: "list",
          ordered: true,
          mn: [
            "Давхцсан дэд бодлого: ижил жижиг бодлого олон дахин гарч ирнэ.",
            "Оновчтой дэд бүтэц: том бодлогын хариуг жижиг бодлогуудын хариунаас угсарч болно.",
          ],
          en: [
            "Overlapping subproblems: the same smaller problem comes up many times.",
            "Optimal substructure: the answer to the big problem is built from the answers to smaller ones.",
          ],
        },
        {
          kind: "note",
          tone: "warn",
          mn: "Эхний шинж байхгүй бол memo нь дэмий — санасан утга дахин хэрэггүй болно. Тэр тохиолдолд энгийн рекурс эсвэл ухран буцах арга л тохирно.",
          en: "Without the first property a memo is wasted — nothing is ever looked up twice. Then plain recursion or backtracking is what you want.",
        },
      ],
    },
  ],
  "dp-1d": [
    {
      id: "watch-it-run",
      title_mn: "Алхам алхмаар харах",
      title_en: "Watch it run",
      blocks: [{ kind: "slides", deck: "dp-1d" }],
    },
    {
      id: "writing-recurrence",
      title_mn: "Томьёог хэрхэн олох вэ",
      title_en: "Finding the rule",
      blocks: [
        {
          kind: "text",
          mn: "DP-ийн бүх хүнд ажил нэг өгүүлбэрт байдаг: «i-р байрлалд ирэхийн тулд хаанаас ирсэн байж болох вэ?» Хариултыг олвол код нь өөрөө бичигдэнэ.",
          en: "All the hard work in DP is in one question: \"to be at position i, where could I have come from?\" Answer that and the code writes itself.",
        },
        {
          kind: "list",
          ordered: true,
          mn: [
            "Хүснэгтийн нэг нүд ЮУГ илэрхийлэхийг үгээр бич.",
            "«Энд ирэхийн тулд хаанаас ирсэн байж болох вэ?» гэж асуу.",
            "Тэдгээрийг нэм (тоолох бодлого) эсвэл хамгийн сайныг нь ав (оновчлол).",
            "Хамгийн жижиг тохиолдлыг гараар бөглө.",
          ],
          en: [
            "Write in words what ONE cell of the table means.",
            "Ask: to reach here, where could I have come from?",
            "Add those up (a counting problem) or take the best (an optimisation).",
            "Fill in the smallest case by hand.",
          ],
        },
        {
          kind: "note",
          tone: "warn",
          mn: "Суурь утгууд бол хамгийн түгээмэл алдаа. `ways[0]` буруу бол хүснэгт бүхэлдээ буруу болох ба алдаа нь хамгийн сүүлд илэрнэ.",
          en: "The starting values are where this usually goes wrong. A wrong `ways[0]` poisons the whole table, and you only notice at the end.",
        },
      ],
    },
    {
      id: "space-saving",
      title_mn: "Хүснэгтийг богиносгох",
      title_en: "Shrinking the table",
      blocks: [
        {
          kind: "text",
          mn: "Томьёо чинь зөвхөн сүүлийн хэдэн утгаас хамаардаг бол бүх массивыг хадгалах шаардлагагүй. Хоёр хувьсагч хангалттай.",
          en: "When the rule looks back only a step or two, you do not need the whole array. Two variables will do.",
        },
        {
          kind: "code",
          cpp: `// ways[i] = ways[i-1] + ways[i-2]  — only two values matter
int a = 1, b = 1;
for (int i = 2; i <= n; i++) {
    int next = a + b;
    a = b;
    b = next;
}`,
          py: `# ways[i] = ways[i-1] + ways[i-2]  - only two values matter
a, b = 1, 1
for i in range(2, n + 1):
    a, b = b, a + b`,
        },
        {
          kind: "note",
          tone: "warn",
          mn: "Эхлээд бүтэн массиваар бич, ажиллуулж шалга, дараа нь богиносго. Мөн бодлого «яг ямар зам вэ» гэж асуувал бүтэн хүснэгт хэрэгтэй — буцаж мөшгих ёстой.",
          en: "Write the full array first, check it, then shrink. And if the problem asks WHICH route, keep the full table — you have to walk back through it.",
        },
      ],
    },
  ],
  "dp-grid": [
    {
      id: "watch-it-run",
      title_mn: "Алхам алхмаар харах",
      title_en: "Watch it run",
      blocks: [{ kind: "slides", deck: "dp-grid" }],
    },
    {
      id: "obstacles",
      title_mn: "Хана нэмэх",
      title_en: "Adding walls",
      blocks: [
        {
          kind: "text",
          mn: "Хүснэгт дээрх DP-ийн ихэнх хувилбар нь «зарим нүдэнд орж болохгүй» гэсэн нэмэлттэй байдаг. Кодын өөрчлөлт нь ганцхан мөр.",
          en: "Most variations of grid DP add \"some cells cannot be entered\". The change to the code is one line.",
        },
        {
          kind: "code",
          cpp: `if (blocked[r][c]) {
    paths[r][c] = 0;          // no route can pass through here
} else {
    paths[r][c] = fromUp + fromLeft;
}`,
          py: `if blocked[r][c]:
    paths[r][c] = 0           # no route can pass through here
else:
    paths[r][c] = from_up + from_left`,
        },
        {
          kind: "text",
          mn: "0 гэж тавих нь «энд хүрэх зам байхгүй» гэсэн үг. Дараагийн нүднүүд түүнийг нэмэх үед 0 нь өөрөө тархаж, хаалттай хэсэг бүхэлдээ 0 болно.",
          en: "Setting 0 means \"no route reaches here\". As later cells add it in, the zero spreads by itself and the whole blocked region becomes unreachable.",
        },
        {
          kind: "note",
          tone: "tip",
          mn: "Хамгийн бага зардлын бодлого бол нэмэхийн оронд `min` ав, эхлэлийг 0, боломжгүйг маш том тоогоор эхлүүл.",
          en: "For a cheapest-path variant, take the `min` instead of adding, start the first cell at 0 and unreachable cells at a very large number.",
        },
      ],
    },
    {
      id: "edges-first",
      title_mn: "Эхний мөр, эхний багана",
      title_en: "The first row and the first column",
      blocks: [
        {
          kind: "text",
          mn: "Хүснэгтийн эхний мөр, эхний баганад дээрээс эсвэл зүүнээс ирэх зам байхгүй. Тэднийг давталтын дотор биш, тусад нь бөглөх нь хамгийн ойлгомжтой.",
          en: "Cells in the first row have nothing above them, and the first column nothing to the left. Filling those separately, before the main loop, is the clearest way.",
        },
        {
          kind: "code",
          cpp: `for (int c = 0; c < w; c++) paths[0][c] = 1;   // only one way along the top
for (int r = 0; r < h; r++) paths[r][0] = 1;   // only one way down the side

for (int r = 1; r < h; r++)
    for (int c = 1; c < w; c++)
        paths[r][c] = paths[r-1][c] + paths[r][c-1];`,
          py: `for c in range(w):
    paths[0][c] = 1        # only one way along the top
for r in range(h):
    paths[r][0] = 1        # only one way down the side

for r in range(1, h):
    for c in range(1, w):
        paths[r][c] = paths[r-1][c] + paths[r][c-1]`,
        },
        {
          kind: "note",
          tone: "tip",
          mn: "Нөгөө арга нь хүснэгтийг нэг мөр, нэг баганаар том хийж, 0-р мөр, 0-р баганыг тэгээр дүүргэх. Тэгвэл `if` шалгалт огт хэрэггүй болно.",
          en: "The other trick is to make the table one row and one column bigger and leave that extra edge at zero. Then you need no `if` at all.",
        },
      ],
    },
  ],
  // ── Unit 11 · Graphs ──────────────────────────────────────────────────
  "graphs-intro": [
    {
      id: "watch-it-run",
      title_mn: "Алхам алхмаар харах",
      title_en: "Watch it run",
      blocks: [{ kind: "slides", deck: "graphs-intro" }],
    },
    {
      id: "two-ways-to-store",
      title_mn: "Графыг хадгалах хоёр арга",
      title_en: "Two ways to store a graph",
      blocks: [
        {
          kind: "text",
          mn: "Зэргэлдээх ЖАГСААЛТ бол тэмцээний стандарт. Зэргэлдээх МАТРИЦ нь бичихэд амархан ч цэг олон бол санах ойд багтахгүй.",
          en: "An adjacency LIST is the contest standard. An adjacency MATRIX is easier to write but will not fit in memory once there are many nodes.",
        },
        {
          kind: "table",
          head_mn: ["", "Жагсаалт", "Матриц"],
          head_en: ["", "List", "Matrix"],
          rows: [
            ["Санах ой / Memory", "цэг + холбоос / nodes + edges", "цэг² / nodes²"],
            ["«a–b холбоотой юу?» / \"is a joined to b?\"", "Удаан / slow", "Шууд / instant"],
            ["Хөршүүдээр явах / Walking neighbours", "Хурдан / fast", "Бүх цэгийг шалгана / checks every node"],
            ["10 000 цэг / 10 000 nodes", "Асуудалгүй / fine", "100 сая нүд — багтахгүй / 100 million cells — too big"],
          ],
        },
        {
          kind: "note",
          tone: "tip",
          mn: "Эргэлзвэл жагсаалт сонго. Бараг бүх граф алгоритм «энэ цэгийн хөршүүд» гэж асуудаг бөгөөд жагсаалт яг түүнд зориулагдсан.",
          en: "When in doubt, use the list. Nearly every graph algorithm asks \"the neighbours of this node\", which is exactly what a list is for.",
        },
      ],
    },
    {
      id: "graph-words",
      title_mn: "Бодлогод нуугдсан граф",
      title_en: "The graph hiding in the problem",
      blocks: [
        {
          kind: "text",
          mn: "Бодлого «граф» гэж хэлэхгүй байж болно. Хоёр зүйл ХООРОНДОО холбогдож байвал тэр бол граф.",
          en: "A problem may never use the word \"graph\". If two things are CONNECTED to each other, it is one.",
        },
        {
          kind: "table",
          head_mn: ["Бодлогод", "Цэг", "Холбоос"],
          head_en: ["In the problem", "Node", "Edge"],
          rows: [
            ["Хот, зам / Cities and roads", "Хот / a city", "Зам / a road"],
            ["Найзууд / Friendships", "Хүн / a person", "Найз байх / being friends"],
            ["Лабиринт / A maze", "Нүд / a cell", "Хажуугийн нүд рүү / a step to a neighbour"],
            ["Хичээлийн дараалал / Course order", "Хичээл / a course", "Урьдчилсан нөхцөл / a prerequisite"],
          ],
        },
        {
          kind: "note",
          tone: "tip",
          mn: "Хүснэгт дээрх бодлогууд бол далд граф. Нүд бүр цэг, хөрш бүр холбоос — тийм учраас BFS хүснэгт дээр яг ажилладаг.",
          en: "Grid problems are graphs in disguise. Every cell is a node and every neighbour an edge — which is why BFS works on a grid unchanged.",
        },
      ],
    },
  ],
  dfs: [
    {
      id: "watch-it-run",
      title_mn: "Алхам алхмаар харах",
      title_en: "Watch it run",
      blocks: [{ kind: "slides", deck: "dfs" }],
    },
    {
      id: "what-dfs-answers",
      title_mn: "DFS ямар асуултад хариулдаг вэ",
      title_en: "What DFS is good for",
      blocks: [
        {
          kind: "text",
          mn: "DFS хамгийн богино замыг ОЛОХГҮЙ. Түүнд гэж бүү ашигла. Харин холболтын тухай асуултад маш сайн хариулна.",
          en: "DFS does NOT find shortest paths. Do not use it for that. It is very good at questions about connection.",
        },
        {
          kind: "list",
          mn: [
            "Хоёр цэг хоорондоо холбогдож чадах уу?",
            "Хэдэн тусдаа бүлэг байна вэ?",
            "Мөчлөг байна уу?",
            "Бүх боломжит замыг тоолох.",
          ],
          en: [
            "Can these two nodes reach each other?",
            "How many separate groups are there?",
            "Is there a cycle?",
            "Counting every possible route.",
          ],
        },
        {
          kind: "note",
          tone: "warn",
          mn: "Хамгийн богино зам хэрэгтэй бол BFS. DFS-ээр олсон зам нь зам мөн боловч хамгийн богино нь байх баталгаагүй.",
          en: "For a shortest path, use BFS. A route found by DFS is a route, but nothing promises it is the shortest one.",
        },
      ],
    },
    {
      id: "recursion-depth",
      title_mn: "Рекурсийн гүн бол жинхэнэ хязгаар",
      title_en: "Recursion depth is a real limit",
      blocks: [
        {
          kind: "text",
          mn: "Рекурсив DFS маш богино бөгөөд уншихад амархан, гэхдээ гүн нь цэгийн тоотой тэнцүү болж болно. 100 000 цэгтэй шугаман граф дээр 100 000 давхар дуудалт үүснэ.",
          en: "Recursive DFS is short and readable, but its depth can equal the number of nodes. On a line-shaped graph of 100 000 nodes that is 100 000 nested calls.",
        },
        {
          kind: "code",
          only: "py",
          py: `import sys
sys.setrecursionlimit(300000)   # do this BEFORE the first dfs call`,
          cpp: `// C++ has no equivalent setting — rewrite it with an explicit stack`,
        },
        {
          kind: "text",
          only: "cpp",
          mn: "C++-д тохиргоо байхгүй. Гүн их байх магадлалтай бол рекурсийг гараар стек ашигласан давталт болгож бичих ёстой.",
          en: "C++ has no such setting. If the depth could be large you have to rewrite the recursion as a loop with your own stack.",
        },
      ],
    },
  ],
  bfs: [
    {
      id: "watch-it-run",
      title_mn: "Алхам алхмаар харах",
      title_en: "Watch it run",
      blocks: [{ kind: "slides", deck: "bfs" }],
    },
    {
      id: "why-shortest",
      title_mn: "Яагаад BFS хамгийн богиныг олдог вэ",
      title_en: "Why BFS finds the shortest path",
      blocks: [
        {
          kind: "text",
          mn: "BFS эхлэлээс 1 алхмын зайд байгаа БҮХ цэгийг үзээд дараа нь 2 алхмынхыг үзнэ. Тиймээс цэг рүү ПЕРВЫЙ удаа хүрэхэд тэр нь хамгийн богино зам байхаас өөр аргагүй — богино зам байсан бол өмнөх давалгаанд аль хэдийн олдох байсан.",
          en: "BFS looks at every node one step away, then everything two steps away. So the FIRST time it reaches a node, that must be the shortest route — a shorter one would have been found in an earlier wave.",
        },
        {
          kind: "note",
          tone: "warn",
          mn: "Энэ баталгаа зөвхөн алхам бүр ИЖИЛ зардалтай үед үйлчилнэ. Зам өөр өөр урттай бол давалгаа гэдэг ойлголт нурах ба Дейкстра хэрэгтэй болно.",
          en: "The guarantee holds only while every step costs the SAME. With different edge lengths the idea of a wave breaks down and you need Dijkstra.",
        },
      ],
    },
    {
      id: "mark-when-queued",
      title_mn: "Хэзээ тэмдэглэх вэ",
      title_en: "When to mark a cell",
      blocks: [
        {
          kind: "text",
          mn: "Энэ бол BFS-ийн хамгийн түгээмэл гүйцэтгэлийн алдаа. Дараалалд ХИЙХ үедээ тэмдэглэ, ГАРГАХ үед биш.",
          en: "This is the most common performance bug in BFS. Mark a cell when you PUSH it, not when you pop it.",
        },
        {
          kind: "code",
          cpp: `// wrong — the same cell enters the queue many times
while (!q.empty()) {
    auto cur = q.front(); q.pop();
    if (seen[cur]) continue;
    seen[cur] = true;
    ...
}

// right — it can only ever enter once
dist[next] = dist[cur] + 1;
q.push(next);          // marked and queued together`,
          py: `# wrong - the same cell enters the queue many times
while q:
    cur = q.popleft()
    if cur in seen:
        continue
    seen.add(cur)
    # ... look at the neighbours

# right - it can only ever enter once
dist[nxt] = dist[cur] + 1
q.append(nxt)          # marked and queued together`,
        },
        {
          kind: "text",
          mn: "Буруу хувилбар нь зөв хариу өгдөг ч нэг нүд олон удаа дараалалд орж, том хүснэгт дээр цаг хугацаа хэтэрнэ.",
          en: "The wrong version still gives the right answer, but one cell enters the queue many times and on a large grid it times out.",
        },
      ],
    },
  ],
  dijkstra: [
    {
      id: "watch-it-run",
      title_mn: "Алхам алхмаар харах",
      title_en: "Watch it run",
      blocks: [{ kind: "slides", deck: "dijkstra" }],
    },
    {
      id: "when-which",
      title_mn: "Аль алгоритмыг сонгох вэ",
      title_en: "Choosing between them",
      blocks: [
        {
          kind: "text",
          mn: "Гурвуулаа «зам ол» гэсэн бодлого боловч нөхцөл нь өөр. Буруугаа сонговол алдаа заахгүй, зүгээр л буруу хариу гарна.",
          en: "All three answer \"find a route\", but under different conditions. Choose wrong and nothing errors — the answer is simply wrong.",
        },
        {
          kind: "table",
          head_mn: ["Нөхцөл", "Алгоритм"],
          head_en: ["Situation", "Algorithm"],
          rows: [
            ["Зөвхөн холбогдсон эсэх / Only need connectivity", "DFS"],
            ["Бүх алхам ижил зардалтай / Every step costs the same", "BFS"],
            ["Холбоос өөр өөр жинтэй / Edges have different weights", "Дейкстра / Dijkstra"],
            ["Сөрөг жинтэй холбоос / Some weights are negative", "Дейкстра БОЛОХГҮЙ / NOT Dijkstra"],
          ],
        },
        {
          kind: "note",
          tone: "tip",
          mn: "Дейкстра нь бүх жин 1 байхад BFS-тэй яг ижил хариу өгнө — зүгээр л илүү удаан. Тиймээс BFS хангалттай үед BFS ашигла.",
          en: "With every weight equal to 1, Dijkstra gives exactly the same answer as BFS, only slower. So when BFS is enough, use BFS.",
        },
      ],
    },
    {
      id: "stale-entries",
      title_mn: "Хуучирсан бичлэгүүд",
      title_en: "The stale entries",
      blocks: [
        {
          kind: "text",
          mn: "Дейкстра нэг цэгийг дараалалд олон удаа хийж болно — тэр болгонд илүү богино зам олдоход. Дараалалаас гаргахдаа хуучирсныг нь шалгаж алгасах ёстой.",
          en: "Dijkstra can push the same node several times, once for each shorter route it finds. When you pop, you have to notice the out-of-date ones and skip them.",
        },
        {
          kind: "code",
          cpp: `auto [d, u] = pq.top(); pq.pop();
if (d > dist[u]) continue;      // a shorter route already went through`,
          py: `d, u = heapq.heappop(pq)
if d > dist[u]:
    continue                    # a shorter route already went through`,
        },
        {
          kind: "note",
          tone: "warn",
          mn: "Энэ мөрийг мартвал хариу нь зөв гарна, гэхдээ нэг цэгийг олон удаа боловсруулж, том граф дээр цаг хугацаа хэтэрнэ.",
          en: "Leave that line out and the answer is still right, but each node is processed many times over and a large graph times out.",
        },
      ],
    },
  ],

  // ── Unit 12 · Objects ─────────────────────────────────────────────────
  classes: [
    {
      id: "watch-it-run",
      title_mn: "Алхам алхмаар харах",
      title_en: "Watch it run",
      blocks: [{ kind: "slides", deck: "classes" }],
    },
    {
      id: "struct-or-class",
      title_mn: "struct үү, class уу",
      title_en: "struct or class?",
      blocks: [
        {
          kind: "text",
          only: "cpp",
          mn: "C++-д ялгаа нь ганцхан: `struct` анхдагчаараа нээлттэй, `class` хаалттай. Өөр бүх зүйл ижил — `struct` ч бас метод, байгуулагчтай байж болно.",
          en: "In C++ there is exactly one difference: a `struct` starts public and a `class` starts private. Everything else is the same — a `struct` can have methods and constructors too.",
        },
        {
          kind: "text",
          only: "py",
          mn: "Python-д `struct` гэж байхгүй, зөвхөн класс бий. Энгийн өгөгдөл хадгалахад `dataclass` эсвэл жижиг класс хэрэглэдэг.",
          en: "Python has no `struct`, only classes. For plain data a `dataclass` or a small class is what people use.",
        },
        {
          kind: "table",
          only: "cpp",
          head_mn: ["Хэрэгцээ", "Сонголт"],
          head_en: ["What you need", "Use"],
          rows: [
            ["Хэдэн талбарыг хамт барих / Hold a few fields together", "`struct`"],
            ["Утгыг хамгаалах дүрэмтэй / Rules that protect the value", "`class`"],
            ["Тэмцээний код / Contest code", "Бараг үргэлж `struct` / almost always `struct`"],
          ],
        },
        {
          kind: "table",
          only: "py",
          head_mn: ["Хэрэгцээ", "Сонголт"],
          head_en: ["What you need", "Use"],
          rows: [
            ["Хэдэн талбарыг хамт барих / Hold a few fields together", "`@dataclass`"],
            ["Утгыг хамгаалах дүрэмтэй / Rules that protect the value", "Энгийн класс / a plain class"],
            ["Өөрчлөгдөхгүй хос утга / A fixed pair of values", "Кортеж / a tuple"],
          ],
        },
        {
          kind: "note",
          tone: "tip",
          only: "cpp",
          mn: "Тэмцээнд `struct` нь богино бөгөөд `{a, b}` гэж шууд үүсгэж болдог. Хамгаалалт хэрэггүй газар класс бичих нь зүгээр л илүү бичлэг.",
          en: "In a contest a `struct` is shorter and can be built with `{a, b}` directly. Writing a class where you need no protection is just more typing.",
        },
        {
          kind: "note",
          tone: "tip",
          only: "py",
          mn: "`@dataclass` нь `__init__`-ийг чиний өмнөөс бичиж өгнө. Зөвхөн өгөгдөл барих гэж байгаа бол хамгийн богино зам.",
          en: "A `@dataclass` writes `__init__` for you. When all you want is to hold data, it is the shortest route there.",
        },
      ],
    },
    {
      id: "when-not-to",
      title_mn: "Хэзээ класс хийх ХЭРЭГГҮЙ вэ",
      title_en: "When NOT to make one",
      blocks: [
        {
          kind: "text",
          mn: "Класс нь ХАМТ явдаг талбаруудыг барихад зориулагдсан. Хамааралгүй зүйлсийг нэг дор хийх нь эмх цэгцтэй санагдаж болох ч уншихад хэцүү болгодог.",
          en: "A class is for fields that belong TOGETHER. Bundling unrelated things can feel tidy and makes the code harder to read.",
        },
        {
          kind: "table",
          head_mn: ["Нөхцөл", "Шийдэл"],
          head_en: ["Situation", "What to do"],
          rows: [
            ["Оюутны нэр, оноо, анги / A student's name, score, class", "Нэг бүтэц / one type — they travel together"],
            ["Ганц утга / A single value", "Энгийн хувьсагч / just a variable"],
            ["Нэг л удаа хэрэглэх хоёр тоо / Two numbers used once", "Хос / a pair or tuple"],
            ["«Бүх юмаа хийх» бүтэц / A \"holds everything\" type", "Хэсэг болгон салга / split it up"],
          ],
        },
        {
          kind: "note",
          tone: "tip",
          mn: "Шалгах асуулт: талбарын нэгийг өөрчлөхөд нөгөө нь мөн өөрчлөгдөх ёстой юу? Тийм бол тэд хамт байх ёстой. Үгүй бол магадгүй үгүй.",
          en: "A quick test: if you change one field, must another change with it? If so, they belong together. If not, they probably do not.",
        },
      ],
    },
  ],
  "class-methods": [
    {
      id: "watch-it-run",
      title_mn: "Алхам алхмаар харах",
      title_en: "Watch it run",
      blocks: [{ kind: "slides", deck: "class-methods" }],
    },
    {
      id: "why-constructor",
      title_mn: "Байгуулагч юунаас хамгаалдаг вэ",
      title_en: "What a constructor protects you from",
      blocks: [
        {
          kind: "text",
          mn: "Байгуулагчгүй бол обьект «хагас дүүрсэн» байдалтай оршиж чадна — зарим талбар нь тохируулагдсан, зарим нь хог утгатай. Байгуулагч энэ байдлыг боломжгүй болгодог.",
          en: "Without a constructor an object can exist half-filled — some fields set, others holding rubbish. A constructor makes that state impossible.",
        },
        {
          kind: "code",
          cpp: `Rect a;              // w and h hold junk — the compiler allows it
a.w = 3;             // now half-built
// ... a.h is still junk when area() is called

Rect b(3, 4);        // with a constructor this is the ONLY way in`,
          py: `class Rect:
    def __init__(self, w, h):
        self.w = w
        self.h = h

b = Rect(3, 4)       # __init__ makes this the only way in
a = Rect()           # TypeError: two arguments are missing`,
        },
        {
          kind: "note",
          tone: "warn",
          only: "cpp",
          mn: "Аргументтай байгуулагч тодорхойлсны дараа `Rect a;` гэж бичих боломжгүй болно — компилятор татгалзана. Энэ бол алдаа биш, зорилго нь тэр.",
          en: "Once you define a constructor with arguments, `Rect a;` no longer compiles. That is not a bug — it is the entire point.",
        },
        {
          kind: "note",
          tone: "warn",
          only: "py",
          mn: "`__init__` аргумент шаардаж эхэлмэгц `Rect()` гэж дуудахад `TypeError` гарна. Энэ бол алдаа биш, зорилго нь тэр — хагас дүүрсэн обьект үүсэхээс сэргийлж байна.",
          en: "Once `__init__` requires arguments, calling `Rect()` raises a `TypeError`. That is not a bug — it is the entire point: a half-filled object can no longer be made.",
        },
      ],
    },
    {
      id: "self-and-this",
      title_mn: "self ба this гэж юу вэ",
      title_en: "What self and this actually are",
      blocks: [
        {
          kind: "text",
          only: "cpp",
          mn: "Метод дотор `w` гэж бичихэд компилятор «аль обьектын `w` вэ?» гэдгийг мэддэг — учир нь метод нь дуудагдсан обьектоо нууцаар хүлээж авдаг. Тэр обьект нь `this`.",
          en: "Inside a method, writing `w` works because the compiler knows WHICH object's `w` you mean — the method silently receives the object it was called on. That object is `this`.",
        },
        {
          kind: "text",
          only: "py",
          mn: "Python үүнийг нуудаггүй: тэр обьектыг эхний параметрээр шууд өгдөг ба уламжлалаар `self` гэж нэрлэдэг. Тийм учраас метод бүрт `self` бичих ёстой.",
          en: "Python does not hide it: the object arrives as the first parameter, called `self` by convention. That is why every method has to declare it.",
        },
        {
          kind: "code",
          cpp: `int area() {
    return w * h;        // really this->w * this->h
}`,
          py: `def area(self):
    return self.w * self.h   # the same thing, spelled out`,
        },
        {
          kind: "note",
          tone: "warn",
          only: "py",
          mn: "`self` мартах нь Python-ы хамгийн түгээмэл алдаа. Тодорхойлолтод мартвал дуудахад `TypeError`, биед нь мартвал талбар биш локал хувьсагч болно.",
          en: "Forgetting `self` is the most common Python slip here. Missing from the definition gives a `TypeError` when you call it; missing inside the body makes a local variable instead of a field.",
        },
      ],
    },
  ],
  "operator-overload": [
    {
      id: "watch-it-run",
      title_mn: "Алхам алхмаар харах",
      title_en: "Watch it run",
      blocks: [{ kind: "slides", deck: "operator-overload" }],
    },
    {
      id: "which-operators",
      title_mn: "Ямар операторыг тодорхойлох нь зүйтэй вэ",
      title_en: "Which operators are worth defining",
      blocks: [
        {
          kind: "text",
          mn: "Оператор тодорхойлох нь хүчирхэг ч хэтрүүлбэл код ойлгомжгүй болно. Тэмцээнд бараг зөвхөн нэгийг л хэрэглэдэг.",
          en: "Defining operators is powerful but easy to overdo — it can make code harder to read, not easier. In contests one of them does nearly all the work.",
        },
        {
          kind: "table",
          only: "cpp",
          head_mn: ["Оператор", "Хэзээ хэрэгтэй"],
          head_en: ["Operator", "When it earns its place"],
          rows: [
            ["`<`", "`sort`, `set`, `priority_queue` — байнга / constantly"],
            ["`==`", "Хайлт, харьцуулалт / searching and comparing"],
            ["`+`", "Тоо шиг зүйл (вектор, матриц) / things that behave like numbers"],
            ["`<<`", "Хэвлэх — тэмцээнд ховор / printing — rarely worth it in a contest"],
          ],
        },
        {
          kind: "table",
          only: "py",
          head_mn: ["Тусгай метод", "Хэзээ хэрэгтэй"],
          head_en: ["Special method", "When it earns its place"],
          rows: [
            ["`__lt__`", "`sort`, `heapq` — байнга / constantly"],
            ["`__eq__`", "Хайлт, харьцуулалт / searching and comparing"],
            ["`__add__`", "Тоо шиг зүйл (вектор, матриц) / things that behave like numbers"],
            ["`__str__`", "`print(obj)` уншимжтай болгох / making `print(obj)` readable"],
          ],
        },
        {
          kind: "note",
          tone: "warn",
          only: "cpp",
          mn: "`<` нь ХАТУУ дараалал өгөх ёстой: тэнцүү элемент дээр заавал `false`. `<=` гэж бичвэл `sort` санах ойн гадна гарч сүйрч болно — компилятор анхааруулахгүй.",
          en: "`<` must give a STRICT ordering: equal items have to give `false`. Writing `<=` can send `sort` off the end of the array and crash, with no compiler warning.",
        },
        {
          kind: "note",
          tone: "warn",
          only: "py",
          mn: "`__lt__` нь ХАТУУ дараалал өгөх ёстой: тэнцүү элемент дээр заавал `False`. Мөн `__eq__` тодорхойлвол обьект `set`, `dict`-д орохоо болино — `__hash__`-ийг ч бас бич.",
          en: "`__lt__` must give a STRICT ordering: equal items have to give `False`. And defining `__eq__` stops the object working in a `set` or `dict` — write `__hash__` as well.",
        },
      ],
    },
    {
      id: "sort-without-it",
      title_mn: "Оператор бичихгүйгээр эрэмбэлэх",
      title_en: "Sorting without writing one",
      blocks: [
        {
          kind: "text",
          mn: "Нэг л газар өөр дараалал хэрэгтэй бол оператор тодорхойлох шаардлагагүй. Түр зуурын харьцуулагч өгвөл болно — тэгвэл нэг бүтэц олон янзаар эрэмбэлэгдэж чадна.",
          en: "If you need a different order in just one place, do not define an operator. Hand the sort a comparison instead — then one type can be sorted several ways.",
        },
        {
          kind: "code",
          cpp: `sort(v.begin(), v.end(), [](const Student& a, const Student& b) {
    return a.name < b.name;      // by name, only here
});`,
          py: `v.sort(key=lambda s: s.name)     # by name, only here`,
        },
        {
          kind: "note",
          tone: "tip",
          mn: "Дүрэм: дараалал нь обьектын ӨӨРИЙНХ нь шинж бол оператор бич. Тухайн бодлогод л хэрэгтэй бол харьцуулагч өг.",
          en: "The rule of thumb: define the operator when the order is a property of the object itself. Pass a comparison when it is a property of this one problem.",
        },
      ],
    },
  ],
};
