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
          mn: "C++ хэлэнд **тушаал бүр цэгтэй таслалаар (`;`) төгсдөг**. Энэ нь өгүүлбэрийн цэг шиг: «энэ тушаал дууслаа» гэсэн үг.",
          en: "In C++ **every statement ends with a semicolon (`;`)**. It works like a full stop: it says \"this instruction is finished\".",
        },
        {
          kind: "text",
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
          mn: "Кодоо түр «унтраахад» тайлбар маш тохиромжтой: мөрийн урд `//` тавихад тэр мөр ажиллахаа болино.",
          en: "Comments are handy for switching code off temporarily: put `//` in front of a line and it stops running.",
        },
      ],
    },
    {
      id: "white-space",
      title_mn: "Хоосон зай ба догол мөр",
      title_en: "White space and indentation",
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
          mn: "Сайн нэр бол хамгийн сайн тайлбар. `int d;` гэхээр юу ч ойлгохгүй, `int daysLeft;` гэвэл тайлбар хэрэггүй.",
          en: "A good name is the best comment. `int d;` tells you nothing; `int daysLeft;` needs no explanation.",
        },
        {
          kind: "table",
          head_mn: ["Муу", "Сайн"],
          head_en: ["Poor", "Better"],
          rows: [
            ["`int a;`", "`int score;`"],
            ["`int x2;`", "`int studentCount;`"],
            ["`double t;`", "`double totalPrice;`"],
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
          mn: "`int` нь ойролцоогоор ±2 тэрбумын хооронд тоо хадгална. Түүнээс том тоонд `long long` хэрэглэнэ.",
          en: "An `int` holds numbers between about ±2 billion. For anything bigger use `long long`.",
        },
        {
          kind: "table",
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
          mn: "Тэмдэгт бүр дотроо тоо байдаг (ASCII код). Тиймээс `'a' + 1` нь `'b'` болно, `'5' - '0'` нь `5` тоог өгнө.",
          en: "Every character is really a number underneath (its ASCII code). So `'a' + 1` gives `'b'`, and `'5' - '0'` gives the number `5`.",
        },
      ],
    },
    {
      id: "choosing",
      title_mn: "Аль төрлийг сонгох вэ",
      title_en: "Which type should I use?",
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
          mn: "`#include <cmath>` бичвэл олон бэлэн функц ашиглаж болно.",
          en: "Add `#include <cmath>` and you get a set of ready-made functions.",
        },
        {
          kind: "table",
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
          kind: "table",
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
          mn: "Мөрийн тэмдэгтүүд **0-оос** дугаарлагдана. `s[0]` бол эхний тэмдэгт, `s.size()` бол урт.",
          en: "Characters are numbered from **0**. `s[0]` is the first character and `s.size()` is the length.",
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
          mn: "`a[5]` гэж хандвал C++ алдаа заахгүй — санах ойн хогийг өгнө, эсвэл програм сүйрнэ. Хилээ өөрөө хянах ёстой.",
          en: "Reading `a[5]` gives no error in C++ — you get junk memory, or a crash. Staying inside the bounds is your job.",
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
      cppOnly: true,
      blocks: [
        {
          kind: "text",
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
};
