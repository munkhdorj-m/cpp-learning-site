// Beginner C++ curriculum for the Learn section.
//
// Written for absolute beginners (7th–8th grade): one idea per lesson, plain
// language, a worked example explained line by line, the mistakes they will
// actually hit, and a self-check question. Bilingual — Mongolian first,
// because that is the language these students think in.

import { PYTHON_VARIANTS } from "./lessons-python";
import { LESSON_SECTIONS } from "./lesson-sections";

export interface CodeLine {
  /** Exact snippet from `code` this note is about. */
  code: string;
  note_mn: string;
  note_en: string;
}

export interface Term {
  term: string;
  def_mn: string;
  def_en: string;
}

export interface Mistake {
  wrong: string;
  fix: string;
  why_mn: string;
  why_en: string;
}

export interface Quiz {
  question_mn: string;
  question_en: string;
  choices: string[];
  /** Index into `choices`. */
  answer: number;
  explain_mn: string;
  explain_en: string;
}

/**
 * One piece of lesson body content. Sections are built out of these, which is
 * what turns a lesson into a readable reference page rather than a single
 * worked example.
 *
 * Text is plain, except that `backticks` mark inline code.
 */
export type Block = (
  | { kind: "text"; mn: string; en: string }
  | {
      kind: "code";
      /** C++ version — always present, it is the course's main language. */
      cpp: string;
      /** Python version, where the same idea exists in Python. */
      py?: string;
      output?: string;
      caption_mn?: string;
      caption_en?: string;
    }
  | { kind: "list"; mn: string[]; en: string[]; ordered?: boolean }
  | { kind: "note"; tone: "tip" | "warn"; mn: string; en: string }
  | { kind: "table"; head_mn: string[]; head_en: string[]; rows: string[][] }
  /** A photograph from lib/lesson-images, with its credit rendered under it. */
  | { kind: "image"; image: string; caption_mn?: string; caption_en?: string }
  /**
   * A step-by-step diagram from lib/lesson-slides, keyed by deck name.
   *
   * The deck itself is not inlined here: only the lesson being read should
   * cross to the browser, so the page resolves the name server-side.
   */
  | { kind: "slides"; deck: string }
) & {
  /**
   * Show this block only when reading in one language.
   *
   * `cppOnly` on a Section is all-or-nothing, which is too blunt when a
   * section is mostly universal but one sentence is not — "put `//` in front
   * of a line" is right in C++ and wrong in Python, yet comments themselves
   * matter in both. Hiding the whole section would have cost the Python
   * reader the lesson; leaving it taught them something false. This lets the
   * two sentences sit side by side, one shown to each.
   *
   * Code blocks do not need it — they already carry cpp and py.
   */
  only?: "cpp" | "py";
};

/**
 * A heading-level chunk of a lesson. These are what the "on this page" rail
 * lists, so each one should be something a student would look up by name.
 */
export interface Section {
  /** Anchor in the URL, and the scroll-spy id. */
  id: string;
  title_mn: string;
  title_en: string;
  blocks: Block[];
  /** Hidden when reading in Python — the idea does not exist there. */
  cppOnly?: boolean;
}

/** The same lesson expressed in another language. */
export interface LessonVariant {
  code: string;
  output: string;
  lines: CodeLine[];
  mistakes?: Mistake[];
  /**
   * Terms and quiz for this language. Needed because a lot of the C++
   * vocabulary (cout, main, endl) simply does not exist in Python — showing
   * it next to Python code confuses students.
   */
  terms?: Term[];
  quiz?: Quiz;
}

export interface Lesson {
  slug: string;
  unit: number;
  title_mn: string;
  title_en: string;
  goal_mn: string;
  goal_en: string;
  intro_mn: string;
  intro_en: string;
  code: string;
  output: string;
  lines: CodeLine[];
  /**
   * The reference part of the lesson: everything the worked example does not
   * have room to say. Rendered after the example, and listed in the
   * "on this page" rail.
   */
  sections?: Section[];
  terms?: Term[];
  mistakes?: Mistake[];
  quiz?: Quiz;
  /** Optional starter the student edits in the playground. */
  challenge_mn?: string;
  challenge_en?: string;
  /**
   * Python rendering of the same idea. When present the lesson shows a
   * C++/Python switch; the explanation around it stays the same, because
   * the concept being taught does not change with the language.
   */
  python?: LessonVariant;
}

export interface Unit {
  id: number;
  title_mn: string;
  title_en: string;
  blurb_mn: string;
  blurb_en: string;
}

export const UNITS: Unit[] = [
  {
    id: 1,
    title_mn: "Эхний алхам",
    title_en: "First Steps",
    blurb_mn: "Програм гэж юу вэ, дэлгэц рүү хэрхэн бичих вэ.",
    blurb_en: "What a program is, and how to print to the screen.",
  },
  {
    id: 2,
    title_mn: "Мэдээлэл хадгалах",
    title_en: "Storing Information",
    blurb_mn: "Хувьсагч, төрөл, оролт, тооцоолол.",
    blurb_en: "Variables, types, input and arithmetic.",
  },
  {
    id: 3,
    title_mn: "Шийдвэр гаргах",
    title_en: "Making Decisions",
    blurb_mn: "Нөхцөл шалгаж өөр өөр үйлдэл хийх.",
    blurb_en: "Check a condition and do different things.",
  },
  {
    id: 4,
    title_mn: "Давталт",
    title_en: "Repeating Things",
    blurb_mn: "Нэг ажлыг олон удаа давтах.",
    blurb_en: "Do the same job many times.",
  },
  {
    id: 5,
    title_mn: "Текст ба массив",
    title_en: "Text and Array",
    blurb_mn: "Үг боловсруулах, олон утгыг нэг дор хадгалах.",
    blurb_en: "Work with words, and hold many values at once.",
  },
  {
    id: 6,
    title_mn: "Илүү том програм",
    title_en: "Bigger Programs",
    blurb_mn: "Давхар давталт, функц, уян хатан жагсаалт.",
    blurb_en: "Nested loops, functions, and growable lists.",
  },
  {
    id: 7,
    title_mn: "Алгоритмын суурь",
    title_en: "Algorithm Foundations",
    blurb_mn:
      "Рекурс, хурд, хоёр хэмжээст хүснэгт — цаашдын бүх зүйлийн суурь.",
    blurb_en:
      "Recursion, speed and grids — what everything after this rests on.",
  },
  {
    id: 8,
    title_mn: "Хайлт ба эрэмбэлэлт",
    title_en: "Searching and Sorting",
    blurb_mn: "Хайх, эрэмбэлэх, хоёртын хайлт, угтвар нийлбэр.",
    blurb_en: "Finding things, sorting them, binary search and prefix sums.",
  },
  {
    id: 9,
    title_mn: "Бэлэн функцууд",
    title_en: "Ready-made Containers",
    blurb_mn: "map, set, стек, дараалал — өөрөө бичихгүйгээр ашиглах.",
    blurb_en:
      "map, set, stack and queue — the ones you use instead of writing your own.",
  },
  {
    id: 10,
    title_mn: "Алгоритмын аргууд",
    title_en: "Algorithm Techniques",
    blurb_mn: "Шуналт арга, ухран буцах, динамик програмчлал.",
    blurb_en: "Greedy, backtracking and dynamic programming.",
  },
  {
    id: 11,
    title_mn: "Граф",
    title_en: "Graphs",
    blurb_mn: "Цэг ба холбоос, гүнзгий ба өргөн хайлт, хамгийн богино зам.",
    blurb_en:
      "Nodes and edges, depth-first and breadth-first search, shortest paths.",
  },
  {
    id: 12,
    title_mn: "Обьект",
    title_en: "Objects",
    blurb_mn:
      "Класс, метод, өөрийн оператор. Жижиг боловч Cambridge-д хэрэгтэй.",
    blurb_en:
      "Classes, methods and your own operators. Small, but needed for Cambridge.",
  },
];

export const LESSONS: Lesson[] = [
  // ── Unit 1 ────────────────────────────────────────────────────────────
  {
    slug: "hello-world",
    unit: 1,
    title_mn: "Анхны програм",
    title_en: "Your First Program",
    goal_mn: "Дэлгэц дээр “Hello, World!” гэж бичих.",
    goal_en: 'Print "Hello, World!" on the screen.',
    intro_mn:
      "Програм гэдэг нь компьютерт өгөх зааврын жагсаалт юм. Компьютер зааврыг дээрээс доош дараалан гүйцэтгэнэ. Хамгийн эхний програм бол дэлгэц рүү нэг мөр бичих.",
    intro_en:
      "A program is a list of instructions for the computer. It follows them one at a time, from top to bottom. The classic first program just prints one line of text.",
    code: `#include <iostream>
using namespace std;

int main() {
    cout << "Hello, World!" << endl;
    return 0;
}`,
    output: "Hello, World!",
    lines: [
      {
        code: "#include <iostream>",
        note_mn:
          "Оролт/гаралтын хэрэгслийг татаж авна. `cout` ашиглах бол энэ мөр заавал хэрэгтэй.",
        note_en:
          "Brings in the input/output tools. You need this line to use `cout`.",
      },
      {
        code: "using namespace std;",
        note_mn:
          "`std::cout` гэж урт бичихийн оронд зүгээр `cout` гэж бичих боломж олгоно.",
        note_en:
          "Lets you write just `cout` instead of the longer `std::cout`.",
      },
      {
        code: "int main() {",
        note_mn:
          "Програм ЭНДЭЭС эхэлнэ. Бүх код `{` ба `}` хоёрын дунд бичигдэнэ.",
        note_en:
          "The program starts HERE. All your code goes between `{` and `}`.",
      },
      {
        code: 'cout << "Hello, World!" << endl;',
        note_mn:
          "`cout` = дэлгэц рүү бич. Хашилтан доторх зүйл яг тэр хэвээрээ гарна. `endl` шинэ мөр эхлүүлнэ.",
        note_en:
          "`cout` means print. Anything inside quotes appears exactly as written. `endl` starts a new line.",
      },
      {
        code: "return 0;",
        note_mn:
          "“Бүх зүйл амжилттай боллоо” гэж мэдэгдээд програмыг дуусгана.",
        note_en: 'Ends the program and reports "everything went fine".',
      },
    ],
    terms: [
      {
        term: "cout",
        def_mn: "Дэлгэц рүү хэвлэх тушаал. “console out” гэсний товчлол.",
        def_en: 'The print command. Short for "console out".',
      },
      {
        term: "main",
        def_mn: "Програмын эхлэх цэг. C++ програм бүрт заавал байна.",
        def_en: "The starting point. Every C++ program must have one.",
      },
    ],
    mistakes: [
      {
        wrong: 'cout << "Hello, World!" << endl',
        fix: 'cout << "Hello, World!" << endl;',
        why_mn:
          "Мөр бүрийн төгсгөлд цэгтэй таслал `;` тавина. Мартвал алдаа гарна.",
        why_en:
          "Every statement ends with a semicolon `;`. Forgetting it is the most common error.",
      },
      {
        wrong: "cout << Hello, World!;",
        fix: 'cout << "Hello, World!";',
        why_mn: 'Бичвэрийг заавал давхар хашилтанд `" "` хийнэ.',
        why_en: 'Text must be inside double quotes `" "`.',
      },
    ],
    quiz: {
      question_mn: "`endl` юу хийдэг вэ?",
      question_en: "What does `endl` do?",
      choices: [
        "Шинэ мөр эхлүүлнэ / Starts a new line",
        "Програмыг зогсооно / Stops the program",
        "Тоог нэмнэ / Adds numbers",
      ],
      answer: 0,
      explain_mn: "`endl` нь курсорыг дараагийн мөрөнд буулгана.",
      explain_en: "`endl` moves the cursor down to the next line.",
    },
    challenge_mn: "Өөрийнхөө нэрийг хэвлэж үзээрэй.",
    challenge_en: "Try printing your own name instead.",
  },
  {
    slug: "printing",
    unit: 1,
    title_mn: "Олон мөр хэвлэх",
    title_en: "Printing More",
    goal_mn: "Хэд хэдэн мөр, тоо, бичвэрийг хамт хэвлэх.",
    goal_en: "Print several lines, and mix text with numbers.",
    intro_mn:
      "`<<` тэмдгийг гинж шиг олон удаа ашиглаж болно. Тоог хашилтгүй бичнэ — хашилтанд хийвэл тоо биш бичвэр болно.",
    intro_en:
      "You can chain `<<` as many times as you like. Numbers go without quotes — if you put quotes around a number it becomes text, not a number.",
    code: `#include <iostream>
using namespace std;

int main() {
    cout << "My name is Bat" << endl;
    cout << "I am " << 14 << " years old" << endl;
    cout << 2 + 3 << endl;
    return 0;
}`,
    output: "My name is Bat\nI am 14 years old\n5",
    lines: [
      {
        code: 'cout << "I am " << 14 << " years old" << endl;',
        note_mn:
          'Гурван хэсгийг нэг мөрөнд наана: бичвэр, тоо, бичвэр. Зайг анхаар — `"I am "` доторх зай хэрэгтэй.',
        note_en:
          'Glues three pieces onto one line: text, number, text. Notice the space inside `"I am "` — you need it.',
      },
      {
        code: "cout << 2 + 3 << endl;",
        note_mn:
          "Компьютер эхлээд 2 + 3-ыг бодоод дараа нь 5 гэж хэвлэнэ. Хашилтгүй учраас тооцоолол хийгдэнэ.",
        note_en:
          "The computer works out 2 + 3 first, then prints 5. No quotes means it does the maths.",
      },
    ],
    mistakes: [
      {
        wrong: 'cout << "2 + 3";',
        fix: "cout << 2 + 3;",
        why_mn: "Хашилттай бол `2 + 3` гэсэн бичвэр гарна, 5 биш.",
        why_en: "With quotes you get the text `2 + 3`, not the answer 5.",
      },
    ],
    quiz: {
      question_mn: '`cout << "5" + 5;` биш `cout << 5 + 5;` бол юу хэвлэх вэ?',
      question_en: "What does `cout << 5 + 5;` print?",
      choices: ["10", "55", "5 + 5"],
      answer: 0,
      explain_mn: "Хашилтгүй тоонууд нэмэгдэж 10 болно.",
      explain_en: "Without quotes the numbers are added, giving 10.",
    },
    challenge_mn: "Дуртай 3 хоолоо тус тусын мөрөнд хэвлэ.",
    challenge_en: "Print your 3 favourite foods, each on its own line.",
  },
  {
    slug: "comments",
    unit: 1,
    title_mn: "Тайлбар бичих",
    title_en: "Comments",
    goal_mn: "Кодондоо өөртөө зориулсан тэмдэглэл үлдээх.",
    goal_en: "Leave notes for yourself inside the code.",
    intro_mn:
      "Тайлбар бол компьютер УНШИХГҮЙ, зөвхөн хүнд зориулсан текст. Кодоо дараа сануулахад маш хэрэгтэй.",
    intro_en:
      "A comment is text the computer IGNORES — it is only for humans. Very useful for reminding yourself what the code does.",
    code: `#include <iostream>
using namespace std;

int main() {
    // This line is a note. It does nothing.
    cout << "Hi" << endl;  // notes can sit after code too

    /* A longer note
       across several lines */
    return 0;
}`,
    output: "Hi",
    lines: [
      {
        code: "// This line is a note. It does nothing.",
        note_mn: "`//`-ийн ард бичсэн бүхнийг компьютер алгасна (нэг мөр).",
        note_en: "Everything after `//` is skipped, to the end of that line.",
      },
      {
        code: "/* A longer note",
        note_mn: "`/*` ба `*/` хооронд хэдэн ч мөр тайлбар бичиж болно.",
        note_en:
          "Between `/*` and `*/` you can write as many lines as you want.",
      },
    ],
    quiz: {
      question_mn: "Тайлбар нь програмын ажиллагааг өөрчлөх үү?",
      question_en: "Do comments change how the program runs?",
      choices: ["Үгүй / No", "Тийм / Yes", "Заримдаа / Sometimes"],
      answer: 0,
      explain_mn: "Компьютер тайлбарыг бүрэн алгасдаг.",
      explain_en: "The computer skips comments completely.",
    },
  },

  // ── Unit 2 ────────────────────────────────────────────────────────────
  {
    slug: "variables",
    unit: 2,
    title_mn: "Хувьсагч",
    title_en: "Variables",
    goal_mn: "Тоог нэр өгч хадгалаад дараа нь ашиглах.",
    goal_en: "Store a number under a name and use it later.",
    intro_mn:
      "Хувьсагч бол нэртэй хайрцаг гэж төсөөл. Дотор нь утга хийж, дараа нь нэрээр нь дуудна. `int` гэдэг нь бүхэл тоо гэсэн үг.",
    intro_en:
      "Think of a variable as a labelled box. You put a value in, then use its name later. `int` means it holds a whole number.",
    code: `#include <iostream>
using namespace std;

int main() {
    int age = 14;
    int next = age + 1;

    cout << "Now: " << age << endl;
    cout << "Next year: " << next << endl;

    age = 20;              // the box can be refilled
    cout << "Later: " << age << endl;
    return 0;
}`,
    output: "Now: 14\nNext year: 15\nLater: 20",
    lines: [
      {
        code: "int age = 14;",
        note_mn:
          "`int` = төрөл (бүхэл тоо), `age` = нэр, `14` = эхний утга. Хайрцаг үүсгээд 14-ийг хийлээ.",
        note_en:
          "`int` is the type (whole number), `age` is the name, `14` is the starting value.",
      },
      {
        code: "int next = age + 1;",
        note_mn: "`age` дотор байгаа 14-ийг авч 1 нэмээд `next` дотор хийнэ.",
        note_en: "Takes the 14 inside `age`, adds 1, and stores it in `next`.",
      },
      {
        code: "age = 20;",
        note_mn:
          "Дахин `int` бичихгүй — хайрцаг аль хэдийн байгаа, зөвхөн утгыг сольж байна.",
        note_en:
          "No `int` this time — the box already exists, we are just replacing what is inside.",
      },
    ],
    terms: [
      {
        term: "int",
        def_mn: "Бүхэл тоо хадгалах төрөл: -3, 0, 7, 250 …",
        def_en: "A type that holds whole numbers: -3, 0, 7, 250 …",
      },
      {
        term: "=",
        def_mn:
          "“Тэнцүү” гэсэн үг БИШ. “Баруун талын утгыг зүүн талд хий” гэсэн үг.",
        def_en:
          'Does NOT mean "equals". It means "put the right-hand value into the left-hand box".',
      },
    ],
    mistakes: [
      {
        wrong: "age = 14;\nint age = 20;",
        fix: "int age = 14;\nage = 20;",
        why_mn:
          "Хувьсагчийг эхлээд төрөлтэй нь ЗАРЛАНА, дараа нь төрөлгүй ашиглана.",
        why_en:
          "Declare the variable with its type ONCE, then use it without the type.",
      },
      {
        wrong: "int my age = 14;",
        fix: "int myAge = 14;",
        why_mn: "Нэрэнд зай байж болохгүй. `myAge` эсвэл `my_age` гэж бич.",
        why_en: "Names cannot contain spaces. Use `myAge` or `my_age`.",
      },
    ],
    quiz: {
      question_mn: "`int x = 5; x = x + 3;` дараа `x` хэд вэ?",
      question_en: "After `int x = 5; x = x + 3;` what is `x`?",
      choices: ["8", "5", "3"],
      answer: 0,
      explain_mn: "5 дээр 3 нэмээд буцаагаад `x` дотор хийсэн тул 8 болно.",
      explain_en: "It adds 3 to 5 and puts the result back into `x`, so 8.",
    },
    challenge_mn: "Хоёр хувьсагч үүсгээд үржвэрийг нь хэвлэ.",
    challenge_en: "Make two variables and print their product.",
  },
  {
    slug: "types",
    unit: 2,
    title_mn: "Өөр төрлүүд",
    title_en: "Other Types",
    goal_mn: "Бутархай тоо, үсэг, үг, үнэн/худал хадгалах.",
    goal_en: "Store decimals, letters, words and true/false.",
    intro_mn:
      "Бүх зүйл бүхэл тоо байдаггүй. Хайрцаг бүр ямар төрлийн зүйл хадгалахаа мэдэж байх ёстой.",
    intro_en:
      "Not everything is a whole number. Each box must know what kind of thing it holds.",
    code: `#include <iostream>
using namespace std;

int main() {
    int   count  = 7;
    double price = 19.5;
    char  grade  = 'A';
    bool  passed = true;
    string name  = "Saraa";

    cout << name << " got " << grade << endl;
    cout << "Price: " << price << endl;
    cout << "Passed? " << passed << endl;
    return 0;
}`,
    output: "Saraa got A\nPrice: 19.5\nPassed? 1",
    lines: [
      {
        code: "double price = 19.5;",
        note_mn:
          "`double` бутархай тоо хадгална. `int` бол 19.5-ыг 19 болгоно.",
        note_en:
          "`double` holds decimals. An `int` would chop 19.5 down to 19.",
      },
      {
        code: "char  grade  = 'A';",
        note_mn: "`char` бол ГАНЦ үсэг. Дан хашилт `' '` ашиглана.",
        note_en: "`char` is a SINGLE letter. It uses single quotes `' '`.",
      },
      {
        code: "bool  passed = true;",
        note_mn:
          "`bool` зөвхөн `true` эсвэл `false`. Хэвлэхэд 1 (үнэн) эсвэл 0 (худал) гарна.",
        note_en:
          "`bool` is only `true` or `false`. It prints as 1 (true) or 0 (false).",
      },
      {
        code: 'string name  = "Saraa";',
        note_mn: '`string` бол үг/өгүүлбэр. Давхар хашилт `" "` ашиглана.',
        note_en:
          'A `string` is a word or sentence. It uses double quotes `" "`.',
      },
    ],
    mistakes: [
      {
        wrong: 'char grade = "A";',
        fix: "char grade = 'A';",
        why_mn: "`char` дан хашилт, `string` давхар хашилт.",
        why_en: "`char` uses single quotes; `string` uses double quotes.",
      },
      {
        wrong: "int price = 19.5;",
        fix: "double price = 19.5;",
        why_mn: "`int` бутархайг таслаад 19 болгоно.",
        why_en: "`int` throws the decimal away and stores 19.",
      },
    ],
    quiz: {
      question_mn: "Хүний өндрийг (1.62 м) ямар төрлөөр хадгалах вэ?",
      question_en: "Which type stores a height like 1.62?",
      choices: ["double", "int", "char"],
      answer: 0,
      explain_mn: "Бутархайтай тул `double`.",
      explain_en: "It has a decimal part, so `double`.",
    },
  },
  {
    slug: "input",
    unit: 2,
    title_mn: "Оролт унших",
    title_en: "Reading Input",
    goal_mn: "Хэрэглэгчийн бичсэн утгыг програмдаа авах.",
    goal_en: "Let the user type something into your program.",
    intro_mn:
      "`cin` бол `cout`-ийн эсрэг: дэлгэц рүү бичихийн оронд гараас уншиж хувьсагч дотор хийнэ. Сумны чиглэл `>>` эсрэгээ болохыг анзаар.",
    intro_en:
      "`cin` is the opposite of `cout`: instead of writing out, it reads what the user types into a variable. Notice the arrows `>>` point the other way.",
    code: `#include <iostream>
using namespace std;

int main() {
    int a, b;
    cin >> a >> b;
    cout << "Sum = " << a + b << endl;
    return 0;
}`,
    output: "(input: 4 6)\nSum = 10",
    lines: [
      {
        code: "int a, b;",
        note_mn: "Хоёр хувьсагчийг нэг мөрөнд зарлав. Одоохондоо хоосон.",
        note_en: "Declares two variables on one line. They are empty for now.",
      },
      {
        code: "cin >> a >> b;",
        note_mn:
          "Эхний тоог `a`, хоёр дахийг `b` дотор хийнэ. Зай эсвэл Enter-ээр тусгаарлана.",
        note_en:
          "Puts the first number into `a` and the second into `b`. Separate them with a space or Enter.",
      },
    ],
    mistakes: [
      {
        wrong: 'cout << "Enter a number: ";',
        fix: "cin >> n;",
        why_mn:
          "Шүүгч гаралтыг яг харьцуулдаг. Асуултын текст нэмэлт гаралт болж, зөв бодсон ч буруу гэж тооцогдоно. Бодлого бодохдоо хэзээ ч асуулт хэвлэхгүй.",
        why_en:
          "The judge compares your output exactly. A prompt is extra output, so a correct answer is still marked wrong. Never print a prompt in a contest problem.",
      },

      {
        wrong: "cin << a;",
        fix: "cin >> a;",
        why_mn: "`cin`-д сум `>>` — мэдээлэл хувьсагч РУУ орж байна.",
        why_en: "`cin` uses `>>` — the data flows INTO the variable.",
      },
    ],
    quiz: {
      question_mn: "Хэрэглэгч `3 8` гэж бичвэл `a + b` хэд вэ?",
      question_en: "If the user types `3 8`, what is `a + b`?",
      choices: ["11", "38", "5"],
      answer: 0,
      explain_mn: "`a` = 3, `b` = 8 тул нийлбэр 11.",
      explain_en: "`a` is 3 and `b` is 8, so the sum is 11.",
    },
    challenge_mn: "Хоёр тоо уншаад үржвэрийг нь хэвлэ.",
    challenge_en: "Read two numbers and print their product.",
  },
  {
    slug: "math",
    unit: 2,
    title_mn: "Тооцоолол",
    title_en: "Doing Maths",
    goal_mn: "Нэмэх, хасах, үржих, хуваах, үлдэгдэл олох.",
    goal_en: "Add, subtract, multiply, divide, and find remainders.",
    intro_mn:
      "C++ дээр `+ - * /` ажиллана. Хоёр анхаарах зүйл: `/` бүхэл тоон дээр бүхэл хариу өгнө, `%` үлдэгдлийг өгнө.",
    intro_en:
      "C++ has `+ - * /`. Two surprises: `/` between whole numbers gives a whole answer, and `%` gives the remainder.",
    code: `#include <iostream>
using namespace std;

int main() {
    int a = 7, b = 2;

    cout << a + b << endl;   // 9
    cout << a - b << endl;   // 5
    cout << a * b << endl;   // 14
    cout << a / b << endl;   // 3  <-- not 3.5!
    cout << a % b << endl;   // 1  remainder
    cout << 7.0 / 2 << endl; // 3.5
    return 0;
}`,
    output: "9\n5\n14\n3\n1\n3.5",
    lines: [
      {
        code: "cout << a / b << endl;   // 3  <-- not 3.5!",
        note_mn:
          "Хоёулаа `int` учраас бутархайг хаяна. 7 / 2 = 3 (3.5 биш). Энэ бол хамгийн түгээмэл гэнэтийн зүйл.",
        note_en:
          "Both are `int`, so the decimal is thrown away: 7 / 2 gives 3, not 3.5. This surprises everyone once.",
      },
      {
        code: "cout << a % b << endl;   // 1  remainder",
        note_mn:
          "`%` = үлдэгдэл. 7-г 2-т хуваахад 3 бүтэн, 1 үлдэнэ. Тэгш/сондгой шалгахад маш их хэрэглэнэ.",
        note_en:
          "`%` is the remainder: 7 ÷ 2 is 3 with 1 left over. Very handy for checking odd/even.",
      },
      {
        code: "cout << 7.0 / 2 << endl; // 3.5",
        note_mn: "Аль нэгийг нь бутархай болговол жинхэнэ хариу гарна.",
        note_en: "Make one side a decimal and you get the true answer.",
      },
    ],
    mistakes: [
      {
        wrong: "int half = 7 / 2;   // 3",
        fix: "double half = 7.0 / 2; // 3.5",
        why_mn: "Бутархай хариу хэрэгтэй бол аль нэг талыг `.0`-той бич.",
        why_en: "If you want a decimal answer, write one side with `.0`.",
      },
    ],
    quiz: {
      question_mn: "`9 % 4` хэд вэ?",
      question_en: "What is `9 % 4`?",
      choices: ["1", "2", "2.25"],
      answer: 0,
      explain_mn: "9 = 4 + 4 + 1, тул үлдэгдэл 1.",
      explain_en: "9 is 4 + 4 with 1 left over, so the remainder is 1.",
    },
    challenge_mn: "Тоо уншаад тэгш эсэхийг `% 2` ашиглан шалга.",
    challenge_en: "Read a number and use `% 2` to see if it is even.",
  },
  {
    slug: "operators",
    unit: 2,
    title_mn: "Операторууд",
    title_en: "Operators and Expressions",
    goal_mn: "Хувьсагчийн утгыг богино бичиглэлээр өөрчлөх.",
    goal_en: "Change a variable's value using the short forms.",
    intro_mn:
      "`score = score + 5` гэж бичих нь удаан. C++ хэлэнд ижил утгатай богино бичиглэлүүд бий: `+=` нь нэмж оноох, `++` нь яг нэгээр нэмэх.",
    intro_en:
      "Writing `score = score + 5` gets tiring. C++ has shorter forms that mean the same thing: `+=` adds and stores, and `++` adds exactly one.",
    code: `#include <iostream>
using namespace std;

int main() {
    int score = 10;

    score = score + 5;   // энгийн арга / the long way
    score += 5;          // ижил утгатай, богино / same thing, shorter
    score++;             // яг 1 нэмнэ / adds exactly 1

    cout << score << endl;

    int x = 1;
    int y = x++;         // эхлээд y-д өгнө, ДАРАА нь x өснө / y gets it first, THEN x grows
    cout << x << " " << y << endl;

    return 0;
}`,
    output: "21\n2 1",
    lines: [
      {
        code: "score += 5;",
        note_mn:
          "`score = score + 5;` -тэй яг ижил. `-=`, `*=`, `/=`, `%=` бас байдаг.",
        note_en:
          "Exactly the same as `score = score + 5;`. There are also `-=`, `*=`, `/=` and `%=`.",
      },
      {
        code: "score++;",
        note_mn: "Яг 1 нэмнэ. `score += 1;` -тэй ижил.",
        note_en: "Adds exactly one. The same as `score += 1;`.",
      },
      {
        code: "int y = x++;",
        note_mn:
          "**Ард** нь бичсэн тул `x`-ийн **хуучин** утга (1) `y`-д очно, дараа нь `x` 2 болно.",
        note_en:
          "Because `++` is **after** `x`, the **old** value (1) goes into `y`, and only then does `x` become 2.",
      },
    ],
    terms: [
      {
        term: "+=",
        def_mn: "«Дээр нь нэмээд буцааж хий» гэсэн богино бичиглэл.",
        def_en: 'Shorthand for "add this on, and store the result back".',
      },
      {
        term: "++",
        def_mn:
          "Нэгээр нэмэх. Урд нь бичвэл шинэ утга, ард нь бичвэл хуучин утга буцаана.",
        def_en:
          "Add one. Written before, it gives the new value; written after, the old value.",
      },
    ],
    mistakes: [
      {
        wrong: "x =+ 5;",
        fix: "x += 5;",
        why_mn:
          "`=+` гэдэг нь «x-д +5 оноо» гэсэн үг — нэмэхгүй, зүгээр 5 болгоно. Тэмдгийн дараалал чухал.",
        why_en:
          '`=+` means "assign positive 5" — it replaces instead of adding. The order of the symbols matters.',
      },
      {
        wrong: "cout << x++ << x;",
        fix: 'cout << x << " ";\nx++;',
        why_mn:
          "Нэг мөрөнд `x`-ийг өөрчилж, бас ашиглавал үр дүн тодорхойгүй болно. Тусад нь бич.",
        why_en:
          "Changing and using `x` in the same statement gives undefined results. Keep them on separate lines.",
      },
    ],
    quiz: {
      question_mn: "`int x = 1; int y = ++x;` дараа `y` хэд вэ?",
      question_en: "After `int x = 1; int y = ++x;` what is `y`?",
      choices: ["2", "1", "0"],
      answer: 0,
      explain_mn:
        "`++` урд нь байгаа тул эхлээд `x` 2 болж, ДАРАА нь `y`-д очино.",
      explain_en:
        "The `++` comes first, so `x` becomes 2 and then that new value goes into `y`.",
    },
    challenge_mn: "Тоо уншаад `+=` ашиглан 10 нэмж хэвлэ.",
    challenge_en: "Read a number, add 10 to it with `+=`, and print it.",
  },
  {
    slug: "type-conversion",
    unit: 2,
    title_mn: "Төрөл хөрвүүлэх",
    title_en: "Type Conversions",
    goal_mn: "Бүхэл ба бутархай тоог хооронд нь зөв хөрвүүлэх.",
    goal_en: "Move a value correctly between whole and decimal types.",
    intro_mn:
      "Хоёр бүхэл тоог хуваахад C++ бутархай хэсгийг хаяна. Зөв хариу авахын тулд нэгийг нь бутархай төрөл рүү хөрвүүлэх хэрэгтэй.",
    intro_en:
      "When you divide two whole numbers, C++ throws the fraction away. To get the real answer you must convert one of them to a decimal type first.",
    code: `#include <iostream>
using namespace std;

int main() {
    int total = 7;
    int count = 2;

    cout << total / count << endl;                       // 3
    cout << (double)total / count << endl;               // 3.5
    cout << static_cast<double>(total) / count << endl;  // 3.5

    double price = 9.99;
    int rounded = (int)price;   // таслаад хаяна, дугуйруулахгүй / cuts, does not round
    cout << rounded << endl;

    return 0;
}`,
    output: "3\n3.5\n3.5\n9",
    lines: [
      {
        code: "cout << total / count << endl;",
        note_mn:
          "Хоёулаа `int` тул хариу нь `int`. 3.5 биш **3** гарна — бутархай хэсэг устана.",
        note_en:
          "Both are `int`, so the answer is an `int`. You get **3**, not 3.5 — the fraction is lost.",
      },
      {
        code: "cout << (double)total / count << endl;",
        note_mn:
          "`(double)` нь `total`-ыг бутархай болгоно. Нэг тал нь бутархай болмогц хариу бүхэлдээ бутархай болно.",
        note_en:
          "`(double)` turns `total` into a decimal. Once one side is a decimal, the whole answer is.",
      },
      {
        code: "int rounded = (int)price;",
        note_mn:
          "9.99 → 9. Ойролцоолохгүй, зүгээр л таслаад хаяна. Дугуйруулах бол `round()` ашигла.",
        note_en:
          "9.99 becomes 9. It does not round — it simply cuts. Use `round()` if you want rounding.",
      },
    ],
    terms: [
      {
        term: "(double)x",
        def_mn:
          "Хуучин загварын хөрвүүлэлт. Богино тул бодлого бодоход түгээмэл.",
        def_en:
          "The old-style cast. It is short, so it is common in exercises.",
      },
      {
        term: "static_cast<double>(x)",
        def_mn: "Орчин үеийн хэлбэр. Урт ч гэсэн хайхад амархан, аюулгүй.",
        def_en: "The modern form. Longer, but easier to find and safer.",
      },
    ],
    mistakes: [
      {
        wrong: "double avg = sum / n;",
        fix: "double avg = (double)sum / n;",
        why_mn:
          "Хуваалт нь **эхлээд** бүхлээр хийгдээд дараа нь `double`-д хийгдэнэ. Хэтэрхий оройтсон — хөрвүүлэлт хуваахаас өмнө хийгдэх ёстой.",
        why_en:
          "The division happens **first**, in whole numbers, and only then is the result stored. Too late — convert before dividing.",
      },
      {
        wrong: "int n = 3.7;   // 4 гэж бодов / expected 4",
        fix: "int n = round(3.7);",
        why_mn: "Хөрвүүлэлт дугуйруулдаггүй, таслаад хаядаг тул 3 болно.",
        why_en: "Conversion cuts rather than rounds, so you get 3.",
      },
    ],
    quiz: {
      question_mn: "`int a = 9, b = 2;` бол `(double)a / b` хэд вэ?",
      question_en: "With `int a = 9, b = 2;` what does `(double)a / b` give?",
      choices: ["4.5", "4", "5"],
      answer: 0,
      explain_mn:
        "`a` бутархай болсон тул хуваалт бутархайгаар хийгдэж 4.5 гарна.",
      explain_en:
        "`a` becomes a decimal, so the division is done in decimals and gives 4.5.",
    },
    challenge_mn: "Хоёр бүхэл тоо уншаад дундажийг нь бутархайгаар хэвлэ.",
    challenge_en:
      "Read two whole numbers and print their average as a decimal.",
  },

  // ── Unit 3 ────────────────────────────────────────────────────────────
  {
    slug: "if-else",
    unit: 3,
    title_mn: "if / else",
    title_en: "if / else",
    goal_mn: "Нөхцөлөөс хамаарч өөр өөр зүйл хийх.",
    goal_en: "Do different things depending on a condition.",
    intro_mn:
      "“Хэрэв … бол … эс бөгөөс …” гэсэн санаа. Хаалтан доторх нөхцөл үнэн бол эхний блок, худал бол `else` блок ажиллана.",
    intro_en:
      'This is the "if … otherwise …" idea. If the condition in brackets is true the first block runs; if not, the `else` block runs.',
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
    lines: [
      {
        code: "if (n > 0) {",
        note_mn:
          "Нөхцөлийг ХААЛТАНД бичнэ. Үнэн бол доорх `{ }` доторх код ажиллана.",
        note_en:
          "The condition goes in BRACKETS. If it is true, the code in `{ }` below runs.",
      },
      {
        code: "} else if (n < 0) {",
        note_mn:
          "Эхний нөхцөл худал байсан үед л шалгагдана. Хэдэн ч `else if` нэмж болно.",
        note_en:
          "Only checked when the first condition was false. You can chain as many as you like.",
      },
      {
        code: "} else {",
        note_mn: "Бусад бүх тохиолдол. Нөхцөлгүй.",
        note_en: "Everything else. It has no condition of its own.",
      },
    ],
    mistakes: [
      {
        wrong: "if (n = 0)",
        fix: "if (n == 0)",
        why_mn:
          "`=` бол утга ОНООХ, `==` бол ХАРЬЦУУЛАХ. Энэ бол хамгийн олон гардаг алдаа.",
        why_en:
          "`=` assigns a value, `==` compares. This is the single most common beginner bug.",
      },
      {
        wrong: 'if (n > 0);\n    cout << "Positive";',
        fix: 'if (n > 0)\n    cout << "Positive";',
        why_mn:
          "`if`-ийн ард цэгтэй таслал тавьвал нөхцөл хоосон болж, дараагийн мөр үргэлж ажиллана.",
        why_en:
          "A semicolon right after `if` ends it early, so the next line always runs.",
      },
    ],
    quiz: {
      question_mn: "`n` нь 0 үед дээрх програм юу хэвлэх вэ?",
      question_en: "What does the program print when `n` is 0?",
      choices: ["Zero", "Positive", "Negative"],
      answer: 0,
      explain_mn: "0 > 0 худал, 0 < 0 худал тул `else` ажиллана.",
      explain_en: "0 > 0 is false and 0 < 0 is false, so the `else` runs.",
    },
    challenge_mn: "Оноо уншаад 60-аас дээш бол “Pass” гэж хэвлэ.",
    challenge_en: 'Read a score and print "Pass" if it is 60 or more.',
  },
  {
    slug: "conditions",
    unit: 3,
    title_mn: "Нөхцөл нэгтгэх",
    title_en: "Combining Conditions",
    goal_mn: "Хоёр ба түүнээс дээш нөхцөлийг нэг дор шалгах.",
    goal_en: "Check two or more conditions at once.",
    intro_mn:
      "Харьцуулах тэмдгүүд: `==` тэнцүү, `!=` тэнцүү биш, `<` `>` `<=` `>=`. Тэдгээрийг `&&` (ба) `||` (эсвэл) -ээр холбоно.",
    intro_en:
      "Comparisons: `==` equal, `!=` not equal, `<` `>` `<=` `>=`. Join them with `&&` (and) or `||` (or).",
    code: `#include <iostream>
using namespace std;

int main() {
    int age = 14;
    bool hasTicket = true;

    if (age >= 12 && hasTicket) {
        cout << "You may enter" << endl;
    }

    if (age < 6 || age > 65) {
        cout << "Free entry" << endl;
    } else {
        cout << "Pay full price" << endl;
    }
    return 0;
}`,
    output: "You may enter\nPay full price",
    lines: [
      {
        code: "if (age >= 12 && hasTicket) {",
        note_mn:
          "`&&` = БА. ХОЁУЛАА үнэн байж гэмээнэ ажиллана. Аль нэг нь худал бол ажиллахгүй.",
        note_en:
          "`&&` is AND. BOTH sides must be true. If either is false, the block is skipped.",
      },
      {
        code: "if (age < 6 || age > 65) {",
        note_mn: "`||` = ЭСВЭЛ. Аль нэг нь үнэн бол хангалттай.",
        note_en: "`||` is OR. Just one side needs to be true.",
      },
    ],
    terms: [
      {
        term: "==",
        def_mn: "Тэнцүү эсэхийг шалгана (оноохгүй).",
        def_en: "Checks whether two things are equal (it does not assign).",
      },
      {
        term: "!=",
        def_mn: "Тэнцүү БИШ эсэхийг шалгана.",
        def_en: "Checks whether two things are NOT equal.",
      },
    ],
    quiz: {
      question_mn: "`age = 10`, `hasTicket = false` үед эхний `if` ажиллах уу?",
      question_en:
        "With `age = 10` and `hasTicket = false`, does the first `if` run?",
      choices: ["Үгүй / No", "Тийм / Yes", "Заримдаа / Sometimes"],
      answer: 0,
      explain_mn: "`&&` хоёуланг шаардана; тасалбар байхгүй тул худал.",
      explain_en: "`&&` needs both to be true, and there is no ticket.",
    },
  },
  {
    slug: "switch",
    unit: 3,
    title_mn: "switch сонголт",
    title_en: "switch and ? :",
    goal_mn: "Нэг утгыг олон боломжтой харьцуулахдаа цэвэрхэн бичих.",
    goal_en: "Write a clean choice when one value is compared against many.",
    intro_mn:
      "Нэг л хувьсагчийг олон тодорхой утгатай харьцуулж байвал `else if` гинж урт болно. `switch` нь яг үүнд зориулагдсан.",
    intro_en:
      "When one variable is compared against many exact values, a chain of `else if` gets long. `switch` is made for exactly that.",
    code: `#include <iostream>
using namespace std;

int main() {
    int day = 7;

    switch (day) {
        case 6:
        case 7:
            cout << "Weekend" << endl;
            break;
        case 1:
            cout << "Monday again" << endl;
            break;
        default:
            cout << "School day" << endl;
    }

    int age = 20;
    cout << (age >= 18 ? "adult" : "child") << endl;

    return 0;
}`,
    output: "Weekend\nadult",
    lines: [
      {
        code: "switch (day) {",
        note_mn: "`day`-ийн утгыг доорх `case`-үүдтэй нэг нэгээр нь тулгана.",
        note_en: "Compares the value of `day` against each `case` below.",
      },
      {
        code: "case 6:\ncase 7:",
        note_mn:
          "`case 6`-д `break` байхгүй тул 6 ба 7 хоёулаа адилхан үр дүнд хүрнэ.",
        note_en:
          "`case 6` has no `break`, so 6 and 7 both fall through to the same result.",
      },
      {
        code: "break;",
        note_mn:
          "`switch`-ээс гарна. Мартвал доорх бүх `case` дараалан ажиллана.",
        note_en:
          "Leaves the `switch`. Forget it and every case below runs as well.",
      },
      {
        code: "default:",
        note_mn: "Аль ч `case` таарахгүй бол энэ ажиллана. `else`-тэй адил.",
        note_en: "Runs when no `case` matched. It is the `else` of a `switch`.",
      },
      {
        code: 'age >= 18 ? "adult" : "child"',
        note_mn:
          "Гурвалсан оператор: «нөхцөл ? үнэн бол энэ : худал бол энэ». Богино `if/else`.",
        note_en:
          'The ternary operator: "condition ? if-true : if-false". A one-line `if/else`.',
      },
    ],
    terms: [
      {
        term: "case",
        def_mn: "Тулгах нэг тодорхой утга. Зөвхөн тогтмол утга байж болно.",
        def_en: "One exact value to match. It must be a constant.",
      },
      {
        term: "break",
        def_mn: "`switch`-ээс гарах тушаал. Бараг үргэлж хэрэгтэй.",
        def_en: "Leaves the `switch`. You almost always need it.",
      },
    ],
    mistakes: [
      {
        wrong: "switch (score) {\n  case score > 90:",
        fix: "if (score > 90) { … }",
        why_mn:
          "`case` дотор нөхцөл бичиж болохгүй, зөвхөн яг таарах утга. Муж шалгах бол `if` ашигла.",
        why_en:
          "A `case` cannot hold a condition, only an exact value. Use `if` for ranges.",
      },
      {
        wrong: 'case 1:\n  cout << "one";\ncase 2:',
        fix: 'case 1:\n  cout << "one";\n  break;\ncase 2:',
        why_mn: "`break` мартвал доорх `case`-үүд ч ажиллаж, хоёр хариу гарна.",
        why_en:
          "Without `break` the cases below run too, and you get two answers.",
      },
    ],
    quiz: {
      question_mn: "`switch` дотор `break` мартвал юу болох вэ?",
      question_en: "What happens if you forget `break` inside a `switch`?",
      choices: [
        "Доорх case-үүд дараалан ажиллана",
        "Компиляцын алдаа гарна",
        "Юу ч болохгүй",
      ],
      answer: 0,
      explain_mn:
        "Үүнийг «унаж орох» гэдэг. Заримдаа зориуд ашигладаг ч ихэвчлэн алдаа.",
      explain_en:
        'This is called "falling through". It is sometimes deliberate, but usually a bug.',
    },
    challenge_mn: "1-7 хүртэлх тоо уншаад гарагийн нэрийг `switch`-ээр хэвлэ.",
    challenge_en: "Read a number 1–7 and print the day's name using `switch`.",
  },

  // ── Unit 4 ────────────────────────────────────────────────────────────
  {
    slug: "for-loop",
    unit: 4,
    title_mn: "for давталт",
    title_en: "for Loops",
    goal_mn: "Тодорхой тооны удаа давтах.",
    goal_en: "Repeat something a known number of times.",
    intro_mn:
      "Нэг зүйлийг 100 удаа бичих үү? Үгүй. `for` давталт таны өмнөөс тоолж давтана.",
    intro_en:
      "Would you write the same line 100 times? No. A `for` loop counts and repeats for you.",
    code: `#include <iostream>
using namespace std;

int main() {
    for (int i = 1; i <= 5; i++) {
        cout << i << " ";
    }
    cout << endl;
    return 0;
}`,
    output: "1 2 3 4 5",
    lines: [
      {
        code: "for (int i = 1; i <= 5; i++) {",
        note_mn:
          "Гурван хэсэг, цэгтэй таслалаар тусгаарлана: ЭХЛЭЛ `int i = 1`, ҮРГЭЛЖЛЭХ НӨХЦӨЛ `i <= 5`, АЛХАМ `i++`.",
        note_en:
          "Three parts split by semicolons: START `int i = 1`, KEEP GOING WHILE `i <= 5`, STEP `i++`.",
      },
      {
        code: 'cout << i << " ";',
        note_mn: "Давталт бүрт `i` өөр утгатай: эхлээд 1, дараа 2 … 5 хүртэл.",
        note_en:
          "Each time round, `i` holds a different value: 1, then 2 … up to 5.",
      },
    ],
    terms: [
      {
        term: "i++",
        def_mn: "`i = i + 1` гэсэн богино бичлэг.",
        def_en: "Short for `i = i + 1`.",
      },
    ],
    mistakes: [
      {
        wrong: "for (int i = 1; i < 5; i++)",
        fix: "for (int i = 1; i <= 5; i++)",
        why_mn: "`<` бол 4 хүртэл л явна. 5-ыг оруулах бол `<=` хэрэгтэй.",
        why_en: "`<` stops at 4. Use `<=` if you want 5 included.",
      },
    ],
    quiz: {
      question_mn: "`for (int i = 0; i < 3; i++)` хэдэн удаа давтах вэ?",
      question_en: "How many times does `for (int i = 0; i < 3; i++)` repeat?",
      choices: ["3", "4", "2"],
      answer: 0,
      explain_mn: "i нь 0, 1, 2 гэсэн 3 утга авна.",
      explain_en: "i takes the values 0, 1 and 2 — three times.",
    },
    challenge_mn: "1-ээс 10 хүртэлх тоонуудын нийлбэрийг ол.",
    challenge_en: "Add up all the numbers from 1 to 10.",
  },
  {
    slug: "while-loop",
    unit: 4,
    title_mn: "while давталт",
    title_en: "while Loops",
    goal_mn: "Хэдэн удаа давтахыг мэдэхгүй үед давтах.",
    goal_en: "Repeat when you do not know how many times in advance.",
    intro_mn:
      "`while` нь “нөхцөл үнэн байсаар л давт” гэсэн үг. Нөхцөлийг өөрчлөхөө мартвал програм хэзээ ч зогсохгүй!",
    intro_en:
      '`while` means "keep repeating while this stays true". If you forget to change the condition, it never stops!',
    code: `#include <iostream>
using namespace std;

int main() {
    int n = 3;
    while (n > 0) {
        cout << n << " ";
        n--;              // without this it never ends
    }
    cout << "Go!" << endl;
    return 0;
}`,
    output: "3 2 1 Go!",
    lines: [
      {
        code: "while (n > 0) {",
        note_mn: "Давталт бүрийн ӨМНӨ нөхцөлийг шалгана. Худал бол зогсоно.",
        note_en:
          "The condition is checked BEFORE each round. When false, it stops.",
      },
      {
        code: "n--;              // without this it never ends",
        note_mn:
          "`n--` = `n = n - 1`. Үүнгүй бол `n` үргэлж 3 хэвээр үлдэж, давталт хэзээ ч дуусахгүй.",
        note_en:
          "`n--` is `n = n - 1`. Without it `n` stays 3 forever and the loop never ends.",
      },
    ],
    mistakes: [
      {
        wrong: "int n = 3;\nwhile (n > 0) {\n    cout << n;\n}",
        fix: "int n = 3;\nwhile (n > 0) {\n    cout << n;\n    n--;\n}",
        why_mn: "Төгсгөлгүй давталт. Нөхцөлд нөлөөлдөг зүйлийг заавал өөрчил.",
        why_en:
          "An endless loop. You must change something that affects the condition.",
      },
    ],
    quiz: {
      question_mn: "`while` давталт хэзээ зогсох вэ?",
      question_en: "When does a `while` loop stop?",
      choices: [
        "Нөхцөл худал болоход / When the condition becomes false",
        "5 удаа давтсаны дараа / After 5 rounds",
        "Хэзээ ч / Never",
      ],
      answer: 0,
      explain_mn: "Давталт бүрийн өмнө шалгаад худал бол зогсоно.",
      explain_en:
        "It checks before each round and stops once the condition is false.",
    },
  },
  {
    slug: "loop-control",
    unit: 4,
    title_mn: "Давталтыг удирдах",
    title_en: "Controlling a Loop",
    goal_mn: "Давталтыг дундаас нь зогсоох, нэг эргэлтийг алгасах.",
    goal_en: "Stop a loop early, or skip a single turn.",
    intro_mn:
      "`break` нь давталтыг бүрмөсөн зогсооно. `continue` нь энэ эргэлтийг л алгасаад дараагийнх руу үсэрнэ. `do…while` нь нөхцөлөө **дараа** нь шалгадаг тул ядаж нэг удаа ажиллана.",
    intro_en:
      "`break` stops a loop completely. `continue` skips just this turn and jumps to the next. A `do…while` checks its condition **afterwards**, so it always runs at least once.",
    code: `#include <iostream>
using namespace std;

int main() {
    int i = 0;
    do {
        cout << "runs at least once" << endl;
        i++;
    } while (i < 1);

    for (int n = 1; n <= 10; n++) {
        if (n % 2 == 0) continue;   // тэгш бол алгасна / skip if even
        if (n > 7) break;           // 7-оос хойш зогсоно / stop after 7
        cout << n << " ";
    }
    cout << endl;

    return 0;
}`,
    output: "runs at least once\n1 3 5 7 ",
    lines: [
      {
        code: "do { … } while (i < 1);",
        note_mn:
          "Бие нь **эхлээд** ажиллаад дараа нь нөхцөлөө шалгана. Тиймээс нөхцөл нь анхнаасаа худал байсан ч нэг удаа ажиллана.",
        note_en:
          "The body runs **first**, then the condition is checked. So it runs once even if the condition was false from the start.",
      },
      {
        code: "if (n % 2 == 0) continue;",
        note_mn:
          "Тэгш тоо бол доорх мөрүүдийг алгасаад шууд дараагийн `n` рүү шилжинэ.",
        note_en:
          "If `n` is even, the lines below are skipped and the loop moves straight to the next `n`.",
      },
      {
        code: "if (n > 7) break;",
        note_mn: "Давталтаас бүрмөсөн гарна. `n = 9` дээр ажиллаж зогсооно.",
        note_en: "Leaves the loop for good. It fires when `n` reaches 9.",
      },
    ],
    terms: [
      {
        term: "break",
        def_mn: "Давталтыг бүрмөсөн зогсооно.",
        def_en: "Stops the loop completely.",
      },
      {
        term: "continue",
        def_mn: "Энэ эргэлтийг л дуусгаад дараагийнх руу шилжинэ.",
        def_en: "Ends this turn only, and moves to the next one.",
      },
      {
        term: "do…while",
        def_mn: "Ядаж нэг удаа ажилладаг давталт.",
        def_en: "A loop that always runs at least once.",
      },
    ],
    mistakes: [
      {
        wrong: "while (i < 5) {\n  if (i == 3) continue;\n  i++;\n}",
        fix: "while (i < 5) {\n  i++;\n  if (i == 3) continue;\n}",
        why_mn:
          "`continue` нь `i++`-ийг алгасаад `i` үүрд 3 хэвээр үлдэнэ — төгсгөлгүй давталт. `while` дотор `continue` ашиглахдаа тоолуураа урьдчилж нэмэгтүүл.",
        why_en:
          "`continue` skips the `i++`, so `i` stays 3 forever — an infinite loop. Inside a `while`, advance the counter before you `continue`.",
      },
      {
        wrong: "do { … } while (x > 0)",
        fix: "do { … } while (x > 0);",
        why_mn: "`do…while`-ийн төгсгөлд цэг таслал заавал хэрэгтэй.",
        why_en: "A `do…while` needs a semicolon at the end.",
      },
    ],
    quiz: {
      question_mn:
        "Нөхцөл нь анхнаасаа худал бол `do…while` хэдэн удаа ажиллах вэ?",
      question_en:
        "If the condition is false from the very start, how many times does a `do…while` run?",
      choices: ["1 удаа", "0 удаа", "Үүрд"],
      answer: 0,
      explain_mn:
        "Нөхцөлөө биеэ ажиллуулсны ДАРАА шалгадаг тул нэг удаа ажиллана.",
      explain_en:
        "It checks the condition only after running the body, so the body runs once.",
    },
    challenge_mn:
      "1-ээс 20 хүртэл тоолж, 3-д хуваагдах тоог алгасаад бусдыг хэвлэ.",
    challenge_en:
      "Count from 1 to 20, skipping every multiple of 3, and print the rest.",
  },
  {
    slug: "putting-it-together",
    unit: 4,
    title_mn: "Бүгдийг нэгтгэх",
    title_en: "Putting It Together",
    goal_mn: "Оролт, давталт, нөхцөлийг нэг програмд ашиглах.",
    goal_en: "Use input, a loop and a condition in one program.",
    intro_mn:
      "Одоо чи бодит бодлого бодох чадвартай боллоо. Энэ програм N ширхэг тоо уншаад тэгш тоонуудын нийлбэрийг олно.",
    intro_en:
      "You now know enough to solve a real task. This program reads N numbers and adds up only the even ones.",
    code: `#include <iostream>
using namespace std;

int main() {
    int n;
    cin >> n;

    int sum = 0;
    for (int i = 0; i < n; i++) {
        int x;
        cin >> x;
        if (x % 2 == 0) {
            sum = sum + x;
        }
    }

    cout << "Even sum = " << sum << endl;
    return 0;
}`,
    output: "(input: 5\\n1 2 3 4 6)\nEven sum = 12",
    lines: [
      {
        code: "int sum = 0;",
        note_mn:
          "Хураах хувьсагчийг ЭХЛЭЭД 0-оор эхлүүлнэ. Давталтын ГАДНА байгааг анхаар.",
        note_en:
          "Start the total at 0. Notice it lives OUTSIDE the loop, so it survives every round.",
      },
      {
        code: "for (int i = 0; i < n; i++) {",
        note_mn: "Яг `n` удаа давтана — хэрэглэгчийн хэлсэн тоогоор.",
        note_en: "Repeats exactly `n` times — however many the user asked for.",
      },
      {
        code: "if (x % 2 == 0) {",
        note_mn: "Үлдэгдэл 0 бол тэгш тоо. Зөвхөн тэднийг нэмнэ.",
        note_en: "A remainder of 0 means even. Only those get added.",
      },
    ],
    quiz: {
      question_mn: "`sum`-ийг давталтын дотор зарлавал юу болох вэ?",
      question_en: "What happens if `sum` is declared inside the loop?",
      choices: [
        "Давталт бүрт 0 болж хураалт алдагдана / It resets to 0 each round and the total is lost",
        "Ямар ч ялгаагүй / No difference",
        "Хурдан болно / It runs faster",
      ],
      answer: 0,
      explain_mn:
        "Давталтын дотор зарласан хувьсагч давталт бүрт шинээр үүснэ.",
      explain_en:
        "A variable declared inside the loop is created fresh every round.",
    },
    challenge_mn: "Тэгш биш, сондгой тоонуудын нийлбэрийг олж үз.",
    challenge_en: "Change it to add the odd numbers instead.",
  },
];

// ── Unit 5 ──────────────────────────────────────────────────────────────
LESSONS.push(
  {
    slug: "strings",
    unit: 5,
    title_mn: "Бичвэртэй ажиллах",
    title_en: "Working with Text",
    goal_mn: "Үгийн уртыг олох, үгсийг наах, үсэг бүрт хандах.",
    goal_en: "Find a word's length, join words, and reach single letters.",
    intro_mn:
      "`string` бол үсгүүдийн эгнээ. Үсэг бүр 0-оос эхлэн дугаарлагдана — эхний үсэг нь 1 биш, 0 дугаартай!",
    intro_en:
      "A `string` is a row of letters. They are numbered from 0 — the first letter is number 0, not 1!",
    code: `#include <iostream>
using namespace std;

int main() {
    string name = "Bat";

    cout << name.length() << endl;   // 3
    cout << name[0] << endl;         // B
    cout << name + "aa" << endl;     // Bataa

    for (int i = 0; i < name.length(); i++) {
        cout << name[i] << "-";
    }
    cout << endl;
    return 0;
}`,
    output: "3\nB\nBataa\nB-a-t-",
    lines: [
      {
        code: "cout << name.length() << endl;   // 3",
        note_mn:
          "`.length()` нь хэдэн үсэгтэйг хэлнэ. Хаалт `()`-г мартаж болохгүй.",
        note_en:
          "`.length()` tells you how many letters there are. Don't forget the `()`.",
      },
      {
        code: "cout << name[0] << endl;         // B",
        note_mn:
          "Дөрвөлжин хаалт `[ ]` доторх тоо нь байрлал. 0 = эхний үсэг, 1 = хоёр дахь …",
        note_en:
          "The number in square brackets `[ ]` is the position. 0 is the first letter, 1 the second …",
      },
      {
        code: 'cout << name + "aa" << endl;     // Bataa',
        note_mn: "`+` нь бичвэр дээр “наах” гэсэн утгатай, нэмэх биш.",
        note_en: "On text, `+` means 'join together', not 'add up'.",
      },
      {
        code: "for (int i = 0; i < name.length(); i++) {",
        note_mn:
          "Үсэг бүрийг эргэх стандарт хэлбэр: 0-оос эхэлж, урт хүрэхээс өмнө зогсоно.",
        note_en:
          "The standard way to walk every letter: start at 0, stop before the length.",
      },
    ],
    terms: [
      {
        term: "s.length()",
        def_mn: "Мөрийн урт (үсгийн тоо). `s.size()` ч гэж бичиж болно.",
        def_en: "The number of letters. `s.size()` does the same thing.",
      },
      {
        term: "s[i]",
        def_mn: "`i` дугаартай үсэг. Дугаарлалт 0-оос эхэлнэ.",
        def_en: "The letter at position `i`. Counting starts at 0.",
      },
    ],
    mistakes: [
      {
        wrong: 'string s = "Bat";\ncout << s[3];',
        fix: "cout << s[2];   // last letter",
        why_mn:
          "3 үсэгтэй мөрийн байрлалууд 0, 1, 2. `s[3]` байхгүй газар — алдаа гарна.",
        why_en:
          "A 3-letter string has positions 0, 1, 2. `s[3]` is past the end and misbehaves.",
      },
      {
        wrong: "cout << name.length;",
        fix: "cout << name.length();",
        why_mn: "`length` бол функц тул хаалт `()` заавал хэрэгтэй.",
        why_en: "`length` is a function, so it needs the brackets `()`.",
      },
    ],
    quiz: {
      question_mn: '`string s = "Hello";` бол `s[1]` юу вэ?',
      question_en: 'With `string s = "Hello";` what is `s[1]`?',
      choices: ["e", "H", "l"],
      answer: 0,
      explain_mn: "0 нь H, 1 нь e. Дугаарлалт 0-оос эхэлдгийг санаарай.",
      explain_en: "Position 0 is H and position 1 is e — counting starts at 0.",
    },
    challenge_mn: "Нэрээ уншаад урвуугаар нь хэвлэ.",
    challenge_en: "Read a name and print it backwards.",
  },
  {
    slug: "getline",
    unit: 5,
    title_mn: "Бүтэн мөр унших",
    title_en: "Reading a Whole Line",
    goal_mn: "Зайтай өгүүлбэрийг бүтнээр нь унших.",
    goal_en: "Read a whole sentence, spaces included.",
    intro_mn:
      "`cin >> s` нь ЗАЙ хүртэл л уншина. “Bat Erdene” гэж бичвэл зөвхөн “Bat” орно. Бүтэн мөр хэрэгтэй бол `getline` ашиглана.",
    intro_en:
      '`cin >> s` stops at the first SPACE. Type "Bat Erdene" and you only get "Bat". For the whole line use `getline`.',
    code: `#include <iostream>
using namespace std;

int main() {
    string first;
    cin >> first;              // reads one word

    string rest;
    getline(cin, rest);        // reads the rest of the line

    cout << "Word: " << first << endl;
    cout << "Rest:" << rest << endl;
    return 0;
}`,
    output: "(input: Bat Erdene Suh)\nWord: Bat\nRest: Erdene Suh",
    lines: [
      {
        code: "cin >> first;              // reads one word",
        note_mn: "Эхний зай дээр зогсоно. “Bat” л уншина.",
        note_en: 'Stops at the first space, so it only reads "Bat".',
      },
      {
        code: "getline(cin, rest);        // reads the rest of the line",
        note_mn:
          "Мөрийн төгсгөл хүртэл бүгдийг, зайтай нь хамт уншина. `cin` эхэнд байгааг анхаар.",
        note_en:
          "Reads everything to the end of the line, spaces and all. Note `cin` comes first.",
      },
    ],
    mistakes: [
      {
        wrong: "int n;\ncin >> n;\ngetline(cin, line);   // line is empty!",
        fix: "int n;\ncin >> n;\ncin.ignore();\ngetline(cin, line);",
        why_mn:
          "`cin >> n` нь Enter товчийг үлдээдэг. `cin.ignore()` түүнийг цэвэрлэнэ. Энэ бол маш түгээмэл урхи.",
        why_en:
          "`cin >> n` leaves the Enter key behind, so getline reads an empty line. `cin.ignore()` clears it. A very common trap.",
      },
    ],
    quiz: {
      question_mn: "Зайтай өгүүлбэр унших зөв арга аль нь вэ?",
      question_en: "Which one reads a sentence containing spaces?",
      choices: ["getline(cin, s)", "cin >> s", "cout << s"],
      answer: 0,
      explain_mn: "`cin >> s` зай дээр зогсдог тул `getline` хэрэгтэй.",
      explain_en: "`cin >> s` stops at a space, so you need `getline`.",
    },
  },
  {
    slug: "string-tools",
    unit: 5,
    title_mn: "Мөрийн хэрэгслүүд",
    title_en: "String Tools",
    goal_mn: "Мөрийн уртыг олох, хэсэг таслах, хайх, тоо руу хөрвүүлэх.",
    goal_en: "Measure, cut, search and convert strings.",
    intro_mn:
      "`string` төрөл өөртөө олон бэлэн хэрэгсэлтэй. Тэдгээрийг цэгээр дуудна: `s.size()`, `s.substr(...)` гэх мэт.",
    intro_en:
      "The `string` type comes with tools built in. You call them with a dot: `s.size()`, `s.substr(...)` and so on.",
    code: `#include <iostream>
#include <string>
using namespace std;

int main() {
    string s = "Ulaanbaatar";

    cout << s.size() << endl;           // 11
    cout << s.substr(0, 5) << endl;     // Ulaan
    cout << s.find("baatar") << endl;   // 5

    string num = "42";
    int n = stoi(num) + 1;
    cout << n << endl;                  // 43

    return 0;
}`,
    output: "11\nUlaan\n5\n43",
    lines: [
      {
        code: "s.size()",
        note_mn: "Хэдэн тэмдэгттэй вэ. `s.length()` гэж бичсэн ч ижил.",
        note_en: "How many characters. `s.length()` means the same thing.",
      },
      {
        code: "s.substr(0, 5)",
        note_mn:
          "0 дугаараас эхлээд **5 тэмдэгт** авна. Хоёр дахь тоо нь төгсгөлийн байрлал БИШ, харин урт.",
        note_en:
          "Starts at index 0 and takes **5 characters**. The second number is a length, not an end position.",
      },
      {
        code: 's.find("baatar")',
        note_mn:
          "Хаанаас эхэлж таарч байгааг буцаана (энд 5). Олдохгүй бол `string::npos` буцаана.",
        note_en:
          "Returns where the match starts (5 here). If there is no match it returns `string::npos`.",
      },
      {
        code: "stoi(num)",
        note_mn: "«string to int» — мөрийг тоо болгоно. Бутархайд `stod` бий.",
        note_en:
          '"string to int" — turns text into a number. Use `stod` for decimals.',
      },
    ],
    terms: [
      {
        term: "s.substr(a, n)",
        def_mn: "`a` дугаараас эхэлсэн `n` тэмдэгтийг таслаж авна.",
        def_en: "Takes `n` characters starting at index `a`.",
      },
      {
        term: "stoi / to_string",
        def_mn: "Мөр → тоо, тоо → мөр хөрвүүлэгч хос.",
        def_en: "The pair that converts text to a number and back again.",
      },
    ],
    mistakes: [
      {
        wrong: 'if (s.find("x") > 0) …',
        fix: 'if (s.find("x") != string::npos) …',
        why_mn:
          "Олдохгүй үед `find` маш том тоо буцаадаг тул `> 0` нь үргэлж үнэн болно. Үргэлж `npos`-той харьцуул.",
        why_en:
          "When there is no match `find` returns a very large number, so `> 0` is always true. Always compare with `npos`.",
      },
      {
        wrong: 'int n = "42" + 1;',
        fix: 'int n = stoi("42") + 1;',
        why_mn: "Мөр дээр шууд тоо нэмж болохгүй — эхлээд хөрвүүл.",
        why_en: "You cannot add a number to text — convert it first.",
      },
    ],
    quiz: {
      question_mn: '`string s = "programming";` бол `s.substr(3, 4)` юу вэ?',
      question_en: 'With `string s = "programming";` what is `s.substr(3, 4)`?',
      choices: ["gram", "gramm", "ogra"],
      answer: 0,
      explain_mn: "3 дугаар нь `g`. Тэндээс 4 тэмдэгт авбал `gram`.",
      explain_en:
        "Index 3 is `g`. Taking 4 characters from there gives `gram`.",
    },
    challenge_mn: "Үг уншаад эхний болон сүүлийн тэмдэгтийг нь хэвлэ.",
    challenge_en: "Read a word and print its first and last character.",
  },
  {
    slug: "arrays",
    unit: 5,
    title_mn: "Массив",
    title_en: "Arrays",
    goal_mn: "Олон утгыг нэг нэрэн дор хадгалах.",
    goal_en: "Store many values under one name.",
    intro_mn:
      "30 сурагчийн оноог хадгалахад 30 хувьсагч үүсгэх үү? Үгүй. Массив бол дугаарлагдсан хайрцгуудын эгнээ — нэг нэртэй, олон үүртэй.",
    intro_en:
      "Would you make 30 variables for 30 test scores? No. An array is a row of numbered boxes: one name, many slots.",
    code: `#include <iostream>
using namespace std;

int main() {
    int score[5] = {70, 85, 90, 60, 100};

    cout << score[0] << endl;    // 70  (first)
    cout << score[4] << endl;    // 100 (last)

    score[1] = 88;               // change one slot

    for (int i = 0; i < 5; i++) {
        cout << score[i] << " ";
    }
    cout << endl;
    return 0;
}`,
    output: "70\n100\n70 88 90 60 100",
    lines: [
      {
        code: "int score[5] = {70, 85, 90, 60, 100};",
        note_mn:
          "`[5]` = 5 үүр гэсэн үг. Үүрнүүд нь 0, 1, 2, 3, 4 дугаартай — 5 гэж байхгүй!",
        note_en:
          "`[5]` means five slots, numbered 0, 1, 2, 3, 4 — there is no slot 5!",
      },
      {
        code: "cout << score[4] << endl;    // 100 (last)",
        note_mn:
          "Сүүлийн үүрний дугаар нь ҮРГЭЛЖ хэмжээ хасах нэг. 5 үүртэй бол сүүлчийнх нь 4.",
        note_en:
          "The last slot is ALWAYS size minus one. With 5 slots, the last is 4.",
      },
      {
        code: "score[1] = 88;               // change one slot",
        note_mn: "Ганц үүрийг энгийн хувьсагч шиг сольж болно.",
        note_en: "A single slot behaves just like an ordinary variable.",
      },
      {
        code: "for (int i = 0; i < 5; i++) {",
        note_mn:
          "Массивыг эргэх стандарт давталт. `i` нь үүрний дугаарын үүрэг гүйцэтгэнэ.",
        note_en:
          "The standard loop for walking an array — `i` plays the part of the slot number.",
      },
    ],
    terms: [
      {
        term: "index",
        def_mn: "Үүрний дугаар. Үргэлж 0-оос эхэлнэ.",
        def_en: "The slot number. Always starts at 0.",
      },
    ],
    mistakes: [
      {
        wrong: "int a[5];\na[5] = 10;",
        fix: "a[4] = 10;   // last slot",
        why_mn:
          "5 үүртэй массивын сүүлчийн дугаар 4. `a[5]` нь хилээс гарсан — програм эвдэрч болно.",
        why_en:
          "With 5 slots the last index is 4. `a[5]` is out of bounds and can corrupt your program.",
      },
      {
        wrong: "int a[5];\ncout << a[0];   // random junk",
        fix: "int a[5] = {0};\ncout << a[0];   // 0",
        why_mn: "Утга өгөөгүй массив хогтой байдаг. Эхлээд дүүргэ.",
        why_en: "An array you never filled contains junk. Fill it first.",
      },
    ],
    quiz: {
      question_mn: "`int a[10];` бол зөв хамгийн том дугаар аль нь вэ?",
      question_en: "For `int a[10];` what is the largest valid index?",
      choices: ["9", "10", "11"],
      answer: 0,
      explain_mn: "10 үүр = 0-ээс 9 хүртэл дугаарлагдана.",
      explain_en: "Ten slots are numbered 0 through 9.",
    },
    challenge_mn: "5 тоо уншаад массивд хийж, урвуу дарааллаар хэвлэ.",
    challenge_en: "Read 5 numbers into an array and print them in reverse.",
  },
  {
    slug: "array-loops",
    unit: 5,
    title_mn: "Массив дээрх бодолт",
    title_en: "Working Through an Array",
    goal_mn: "Нийлбэр, дундаж, хамгийн их утгыг олох.",
    goal_en: "Find a total, an average, and the largest value.",
    intro_mn:
      "Массив + давталт = жинхэнэ хүч. Ихэнх бодлого яг энэ хоёрын хослол дээр тогтдог.",
    intro_en:
      "Array + loop is where the real power is. Most problems are built on exactly this pair.",
    code: `#include <iostream>
using namespace std;

int main() {
    int n;
    cin >> n;

    int a[100];
    for (int i = 0; i < n; i++) cin >> a[i];

    int sum = 0;
    int best = a[0];
    for (int i = 0; i < n; i++) {
        sum = sum + a[i];
        if (a[i] > best) best = a[i];
    }

    cout << "Sum: " << sum << endl;
    cout << "Max: " << best << endl;
    cout << "Avg: " << (double)sum / n << endl;
    return 0;
}`,
    output: "(input: 4\\n3 9 2 6)\nSum: 20\nMax: 9\nAvg: 5",
    lines: [
      {
        code: "for (int i = 0; i < n; i++) cin >> a[i];",
        note_mn:
          "Массивыг уншиж дүүргэх богино бичлэг. Ганц мөр бол `{ }` заавал биш.",
        note_en:
          "A short way to fill the array. With a single statement the `{ }` are optional.",
      },
      {
        code: "int best = a[0];",
        note_mn:
          "Хамгийн ихийг ЭХНИЙ утгаар эхлүүлнэ, 0-оор биш! Сөрөг тоонууд байвал 0 буруу хариу өгнө.",
        note_en:
          "Start the maximum at the FIRST value, not 0 — with negative numbers, 0 would be wrong.",
      },
      {
        code: "if (a[i] > best) best = a[i];",
        note_mn: "Илүү том утга тааралдвал л шинэчилнэ.",
        note_en: "Only update when you meet something bigger.",
      },
      {
        code: 'cout << "Avg: " << (double)sum / n << endl;',
        note_mn:
          "`(double)` нь бүхэл хуваалтаас сэргийлнэ. Үгүй бол 20/4 биш 20/3 маягийн алдаа гарч болно.",
        note_en:
          "`(double)` avoids integer division, which would chop the decimal off the average.",
      },
    ],
    mistakes: [
      {
        wrong: "int best = 0;   // then compare",
        fix: "int best = a[0];",
        why_mn: "Бүх тоо сөрөг байвал хариу нь 0 гэж буруу гарна.",
        why_en:
          "If every number is negative, the answer wrongly comes out as 0.",
      },
    ],
    quiz: {
      question_mn: "Хамгийн ихийг олохдоо яагаад `a[0]`-оор эхлүүлэх вэ?",
      question_en: "Why start the maximum at `a[0]`?",
      choices: [
        "Бүх тоо сөрөг байж болох тул / Because every number might be negative",
        "Илүү хурдан тул / Because it is faster",
        "Ямар ч ялгаагүй / It makes no difference",
      ],
      answer: 0,
      explain_mn: "0-оор эхлүүлбэл сөрөг тоонуудын хувьд буруу хариу гарна.",
      explain_en:
        "Starting at 0 gives a wrong answer when all values are below zero.",
    },
    challenge_mn: "Хамгийн БАГА утгыг олж хэвлэ.",
    challenge_en: "Find and print the smallest value instead.",
  },

  // ── Unit 6 ────────────────────────────────────────────────────────────
  {
    slug: "nested-loops",
    unit: 6,
    title_mn: "Давхар давталт",
    title_en: "Nested Loops",
    goal_mn: "Давталт дотор давталт ажиллуулж хүснэгт, дүрс гаргах.",
    goal_en: "Put a loop inside a loop to build rows and shapes.",
    intro_mn:
      "Цагийн зүү шиг: гадна давталт нэг алхахад дотоод давталт бүтэн эргэлт хийнэ. Мөр, багана гаргахад ашиглана.",
    intro_en:
      "Like clock hands: for every single step of the outer loop, the inner loop runs all the way round. Perfect for rows and columns.",
    code: `#include <iostream>
using namespace std;

int main() {
    for (int row = 1; row <= 4; row++) {
        for (int col = 1; col <= row; col++) {
            cout << "*";
        }
        cout << endl;
    }
    return 0;
}`,
    output: "*\n**\n***\n****",
    lines: [
      {
        code: "for (int row = 1; row <= 4; row++) {",
        note_mn: "ГАДНА давталт = мөрүүд. 4 удаа ажиллана.",
        note_en: "The OUTER loop is the rows. It runs 4 times.",
      },
      {
        code: "for (int col = 1; col <= row; col++) {",
        note_mn:
          "ДОТООД давталт = тухайн мөрийн од. `row`-оос хамаарч байгааг анзаар — тиймээс шатлаж өснө.",
        note_en:
          "The INNER loop draws that row's stars. Notice it depends on `row`, which is what makes the staircase.",
      },
      {
        code: "cout << endl;",
        note_mn:
          "Дотоод давталт дууссаны ДАРАА мөр таслана. Дотор нь тавивал бүх од тус тусдаа мөрөнд орно.",
        note_en:
          "Break the line AFTER the inner loop finishes. Inside, every star would land on its own line.",
      },
    ],
    mistakes: [
      {
        wrong: "for (int i = 0; i < 3; i++)\n  for (int i = 0; i < 3; i++)",
        fix: "for (int i = 0; i < 3; i++)\n  for (int j = 0; j < 3; j++)",
        why_mn: "Хоёр давталт ижил нэр ашиглаж болохгүй. `i` ба `j` гэж ялга.",
        why_en: "Two loops cannot share a counter name. Use `i` and `j`.",
      },
    ],
    quiz: {
      question_mn:
        "3×4 давхар давталтын дотоод хэсэг нийт хэдэн удаа ажиллах вэ?",
      question_en:
        "In a 3-by-4 nested loop, how many times does the inside run?",
      choices: ["12", "7", "4"],
      answer: 0,
      explain_mn: "3 × 4 = 12. Гадна алхам бүрт дотоод нь бүрэн эргэнэ.",
      explain_en:
        "3 × 4 = 12 — the inner loop completes fully for each outer step.",
    },
    challenge_mn: "Урвуу гурвалжин (4, 3, 2, 1 од) гарга.",
    challenge_en: "Print an upside-down triangle: 4 stars, then 3, 2, 1.",
  },
  {
    slug: "functions",
    unit: 6,
    title_mn: "Функц",
    title_en: "Functions",
    goal_mn: "Кодын хэсгийг нэрлээд дахин дахин ашиглах.",
    goal_en: "Give a piece of code a name and reuse it.",
    intro_mn:
      "Функц бол өөрийн бүтээсэн тушаал. Нэг удаа бичээд хэдэн ч удаа дуудна. Урт програмыг жижиг ойлгомжтой хэсгүүдэд хуваана.",
    intro_en:
      "A function is a command you invent yourself: write it once, call it as often as you like. It breaks a long program into small, understandable pieces.",
    code: `#include <iostream>
using namespace std;

int square(int x) {
    return x * x;
}

void greet(string name) {
    cout << "Hello, " << name << "!" << endl;
}

int main() {
    cout << square(5) << endl;    // 25
    cout << square(9) << endl;    // 81
    greet("Saraa");
    return 0;
}`,
    output: "25\n81\nHello, Saraa!",
    lines: [
      {
        code: "int square(int x) {",
        note_mn:
          "`int` (эхний) = ямар төрлийн хариу БУЦААХ вэ. `square` = нэр. `int x` = хүлээж авах утга.",
        note_en:
          "The first `int` is the type it GIVES BACK. `square` is the name. `int x` is what it takes in.",
      },
      {
        code: "return x * x;",
        note_mn: "`return` нь хариуг буцаагаад функцийг тэр дороо дуусгана.",
        note_en:
          "`return` hands the answer back and ends the function immediately.",
      },
      {
        code: "void greet(string name) {",
        note_mn:
          "`void` = юу ч буцаахгүй, зүгээр нэг ажил хийнэ (энд хэвлэнэ). `return` шаардлагагүй.",
        note_en:
          "`void` means it gives nothing back — it just does a job (printing here). No `return` needed.",
      },
      {
        code: "cout << square(5) << endl;    // 25",
        note_mn:
          "Функцийг ДУУДАХ. 5 нь `x` болж орно, буцаж ирсэн 25 хэвлэгдэнэ.",
        note_en:
          "This CALLS the function: 5 goes in as `x`, and the 25 that comes back gets printed.",
      },
    ],
    terms: [
      {
        term: "return",
        def_mn: "Хариуг буцааж, функцийг дуусгана.",
        def_en: "Sends the answer back and ends the function.",
      },
      {
        term: "void",
        def_mn: "Хариу буцаахгүй функцийн төрөл.",
        def_en: "The type for a function that returns nothing.",
      },
    ],
    mistakes: [
      {
        wrong: "int square(int x) {\n    x * x;\n}",
        fix: "int square(int x) {\n    return x * x;\n}",
        why_mn: "`return` бичихгүй бол хариу гарч ирэхгүй.",
        why_en: "Without `return` the answer never comes back out.",
      },
      {
        wrong:
          "int main() {\n    cout << square(5);\n}\nint square(int x){...}",
        fix: "int square(int x){...}\nint main() {\n    cout << square(5);\n}",
        why_mn:
          "Функцийг ашиглахаас ӨМНӨ бичсэн байх ёстой — `main`-ийн дээр тавь.",
        why_en:
          "A function must appear BEFORE it is used — put it above `main`.",
      },
    ],
    quiz: {
      question_mn: "`void` функц юу буцаах вэ?",
      question_en: "What does a `void` function give back?",
      choices: ["Юу ч биш / Nothing", "0", "Бичвэр / Text"],
      answer: 0,
      explain_mn: "`void` нь “хариу байхгүй” гэсэн үг — зөвхөн ажил хийнэ.",
      explain_en: "`void` means 'no answer' — it only performs an action.",
    },
    challenge_mn: "Хоёр тооны их нь буцаадаг `maxOf` функц бич.",
    challenge_en:
      "Write a `maxOf` function that returns the larger of two numbers.",
  },
  {
    slug: "function-details",
    unit: 6,
    title_mn: "Функцийн нарийн ширийн",
    title_en: "More About Functions",
    goal_mn:
      "Функц эх хувьсагчийг өөрчлөх, анхны утга авах, ижил нэртэй байх боломжийг ойлгох.",
    goal_en:
      "Let a function change the original variable, take default values, and share a name.",
    intro_mn:
      "Энгийн функц нь параметрийн **хуулбарыг** авдаг тул эх хувьсагч өөрчлөгддөггүй. `&` тэмдэг нэмбэл хуулбар биш, эх хувьсагч өөрөө дамжина.",
    intro_en:
      "By default a function receives a **copy** of its argument, so the original never changes. Adding `&` passes the original itself instead.",
    code: `#include <iostream>
using namespace std;

void addTax(double& price) {   // & = эх хувьсагчийг өөрчилнө / & changes the original
    price = price * 1.1;
}

int power(int base, int exp = 2) {   // exp өгөхгүй бол 2 / exp is 2 if you omit it
    int result = 1;
    for (int i = 0; i < exp; i++) result *= base;
    return result;
}

int main() {
    double p = 100;
    addTax(p);
    cout << p << endl;             // 110

    cout << power(5) << endl;      // 25
    cout << power(2, 10) << endl;  // 1024

    return 0;
}`,
    output: "110\n25\n1024",
    lines: [
      {
        code: "void addTax(double& price)",
        note_mn:
          "`&` байхгүй бол `price` бол хуулбар — функц дуусахад өөрчлөлт алга болно. `&`-тэй бол `main` доторх `p` өөрөө өөрчлөгдөнө.",
        note_en:
          "Without `&`, `price` is a copy and the change disappears when the function ends. With `&`, the `p` inside `main` itself changes.",
      },
      {
        code: "int power(int base, int exp = 2)",
        note_mn: "`exp = 2` бол анхны утга. Дуудахдаа орхивол 2 гэж үзнэ.",
        note_en:
          "`exp = 2` is a default. If you leave the argument out, 2 is used.",
      },
      {
        code: "power(5)",
        note_mn: "Нэг л аргумент өгсөн тул `exp` нь 2 болж 5² = 25 гарна.",
        note_en: "Only one argument, so `exp` is 2 and you get 5² = 25.",
      },
    ],
    terms: [
      {
        term: "&",
        def_mn: "Лавлагаа. Хуулбар биш, эх хувьсагчийг өөрийг нь дамжуулна.",
        def_en: "A reference. Passes the original variable, not a copy.",
      },
      {
        term: "default argument",
        def_mn: "Дуудахдаа орхивол хэрэглэгдэх урьдчилан тогтоосон утга.",
        def_en: "A value used when the caller leaves that argument out.",
      },
    ],
    mistakes: [
      {
        wrong: "void twice(int n) {\n  n = n * 2;\n}",
        fix: "void twice(int& n) {\n  n = n * 2;\n}",
        why_mn:
          "`&` байхгүй тул зөвхөн хуулбар өөрчлөгдөж, дуудсан газарт нь юу ч болохгүй.",
        why_en:
          "Without `&` only the copy changes, and nothing happens at the call site.",
      },
      {
        wrong: "int f(int a = 1, int b);",
        fix: "int f(int a, int b = 1);",
        why_mn: "Анхны утгатай параметрүүд заавал **төгсгөлд** байх ёстой.",
        why_en: "Parameters with defaults must come **last**.",
      },
    ],
    quiz: {
      question_mn:
        "`void f(int x)` дотор `x`-ийг өөрчилвөл дуудсан хувьсагч яах вэ?",
      question_en:
        "If `void f(int x)` changes `x`, what happens to the variable that was passed in?",
      choices: [
        "Огт өөрчлөгдөхгүй",
        "Мөн адил өөрчлөгдөнө",
        "Компиляцын алдаа гарна",
      ],
      answer: 0,
      explain_mn:
        "Хуулбар дамжсан тул эх хувьсагч хэвээрээ. Өөрчлөх бол `int& x` гэж бич.",
      explain_en:
        "A copy was passed, so the original is untouched. Write `int& x` if you want it changed.",
    },
    challenge_mn:
      "Хоёр хувьсагчийн утгыг солидог `swapValues` функцийг `&` ашиглан бич.",
    challenge_en:
      "Write a `swapValues` function that swaps two variables, using `&`.",
  },
  {
    slug: "structs",
    unit: 6,
    title_mn: "Өөрийн төрөл (struct)",
    title_en: "Structs: Your Own Type",
    goal_mn: "Хоорондоо холбоотой хэдэн утгыг нэг зүйл болгон нэгтгэх.",
    goal_en: "Group several related values into one thing.",
    intro_mn:
      "Сурагчийн нэр, анги, дундаж оноог тус тусад нь гурван хувьсагчид хадгалах нь эмх замбараагүй. `struct` нь тэдгээрийг нэг нэрийн дор нэгтгэнэ.",
    intro_en:
      "Keeping a student's name, grade and average in three separate variables gets messy fast. A `struct` puts them together under one name.",
    code: `#include <iostream>
#include <string>
using namespace std;

struct Student {
    string name;
    int    grade;
    double average;
};

int main() {
    Student s;
    s.name    = "Bat";
    s.grade   = 8;
    s.average = 92.5;

    cout << s.name << " (grade " << s.grade << ") "
         << s.average << endl;

    Student best = s;   // бүх талбар нь хамт хуулагдана / every field is copied
    cout << best.name << endl;

    return 0;
}`,
    output: "Bat (grade 8) 92.5\nBat",
    lines: [
      {
        code: "struct Student { … };",
        note_mn:
          "Шинэ төрөл **зарлаж** байна, хувьсагч үүсгээгүй хараахан. Төгсгөлийн цэг таслалыг бүү мартаарай.",
        note_en:
          "This **declares** a new type; it does not create a variable yet. Do not forget the semicolon at the end.",
      },
      {
        code: "Student s;",
        note_mn: "Одоо `Student` төрлийн бодит хувьсагч үүслээ.",
        note_en: "Now an actual variable of type `Student` exists.",
      },
      {
        code: 's.name = "Bat";',
        note_mn: "Цэгээр талбар руу нь хандана: `хувьсагч.талбар`.",
        note_en: "A dot reaches a field: `variable.field`.",
      },
      {
        code: "Student best = s;",
        note_mn:
          "Бүтцийг хуулахад доторх бүх талбар хамт хуулагдана — гараар нэг нэгээр нь хуулах шаардлагагүй.",
        note_en:
          "Copying a struct copies every field with it — no need to copy them one at a time.",
      },
    ],
    terms: [
      {
        term: "struct",
        def_mn: "Хэдэн утгыг нэгтгэсэн өөрийн шинэ төрөл.",
        def_en: "Your own new type, made of several values grouped together.",
      },
      {
        term: "талбар / field",
        def_mn: "Бүтцийн дотор байгаа нэг хувьсагч. Цэгээр хандана.",
        def_en: "One variable inside a struct. You reach it with a dot.",
      },
    ],
    mistakes: [
      {
        wrong: "struct Student {\n  string name;\n}",
        fix: "struct Student {\n  string name;\n};",
        why_mn: "`struct`-ийн хаалтын дараа цэг таслал заавал хэрэгтэй.",
        why_en: "A `struct` needs a semicolon after its closing brace.",
      },
      {
        wrong: "Student s;\ncout << s.name;",
        fix: 'Student s;\ns.name = "Bat";\ncout << s.name;',
        why_mn: "Талбаруудад утга оноохоос өмнө уншвал хог утга гарна.",
        why_en: "Reading fields before you set them gives junk values.",
      },
    ],
    quiz: {
      question_mn: "`struct`-ийн талбарт хэрхэн ханддаг вэ?",
      question_en: "How do you reach a field of a struct?",
      choices: ["s.name", "s->name", "s[name]"],
      answer: 0,
      explain_mn:
        "Энгийн хувьсагчид цэг ашиглана. Сум (`->`) нь заагчтай ажиллахад хэрэглэгдэнэ.",
      explain_en:
        "A plain variable uses a dot. The arrow (`->`) is for pointers.",
    },
    challenge_mn:
      "`Book` бүтэц үүсгээд гарчиг, зохиогч, хуудасны тоог хадгалж хэвлэ.",
    challenge_en:
      "Make a `Book` struct with a title, an author and a page count, then print one.",
  },
  {
    slug: "vectors",
    unit: 6,
    title_mn: "Вектор",
    title_en: "Vectors",
    goal_mn: "Хэмжээ нь өөрчлөгддөг жагсаалт ашиглах.",
    goal_en: "Use a list that can grow while the program runs.",
    intro_mn:
      "Массивын хэмжээг эхнээс нь мэдэх ёстой. Вектор бол уян хатан массив — ажиллаж байхдаа өсч, хумигдана. Бодлого бодоход ихэвчлэн үүнийг сонгодог.",
    intro_en:
      "An array's size is fixed from the start. A vector is a stretchy array — it grows and shrinks while running. For contest problems this is usually the better choice.",
    code: `#include <iostream>
#include <vector>
using namespace std;

int main() {
    vector<int> v;

    v.push_back(10);
    v.push_back(20);
    v.push_back(30);

    cout << v.size() << endl;    // 3
    cout << v[1] << endl;        // 20

    for (int x : v) {
        cout << x << " ";
    }
    cout << endl;
    return 0;
}`,
    output: "3\n20\n10 20 30",
    lines: [
      {
        code: "#include <vector>",
        note_mn: "Вектор ашиглах бол энэ мөрийг нэмнэ.",
        note_en: "You need this extra line to use vectors.",
      },
      {
        code: "vector<int> v;",
        note_mn:
          "`<int>` дотор ямар төрлийн зүйл хадгалахыг бичнэ. Одоохондоо хоосон.",
        note_en: "Inside `< >` you say what it holds. It starts out empty.",
      },
      {
        code: "v.push_back(10);",
        note_mn: "Төгсгөлд нэг утга нэмнэ. Хэмжээ автоматаар өснө.",
        note_en: "Adds one value at the end — the size grows by itself.",
      },
      {
        code: "for (int x : v) {",
        note_mn:
          "“Векторын утга бүрийн хувьд” гэсэн богино давталт. Дугаар бодох шаардлагагүй.",
        note_en:
          "A shorter loop meaning 'for each value in v'. No index arithmetic needed.",
      },
    ],
    terms: [
      {
        term: "push_back",
        def_mn: "Төгсгөлд нэмэх.",
        def_en: "Add to the end.",
      },
      {
        term: "v.size()",
        def_mn: "Одоо хэдэн утга байгаа.",
        def_en: "How many values it holds right now.",
      },
    ],
    mistakes: [
      {
        wrong: "vector<int> v;\nv[0] = 5;",
        fix: "vector<int> v;\nv.push_back(5);",
        why_mn:
          "Хоосон вектор дээр `v[0]` байхгүй үүр. Эхлээд `push_back`-аар нэм.",
        why_en:
          "An empty vector has no slot 0 yet — add with `push_back` first.",
      },
    ],
    quiz: {
      question_mn: "Массив, вектор хоёрын гол ялгаа юу вэ?",
      question_en: "What is the main difference between an array and a vector?",
      choices: [
        "Векторын хэмжээ өөрчлөгдөнө / A vector can change size",
        "Вектор илүү хурдан / A vector is faster",
        "Ялгаа байхгүй / There is no difference",
      ],
      answer: 0,
      explain_mn: "Массив тогтмол хэмжээтэй, вектор ажиллаж байхдаа өснө.",
      explain_en:
        "An array's size is fixed; a vector grows while the program runs.",
    },
    challenge_mn: "n тоо уншиж вектор дүүргээд нийлбэрийг ол.",
    challenge_en: "Read n numbers into a vector and print their sum.",
  },
);

// ── Units 7-12 · the advanced half ──────────────────────────────────────
//
// Pushed last so the array is in curriculum order. The site numbers each
// lesson by its position here and walks next/previous the same way, so a
// unit out of place shows up as a wrong lesson number and a jump to the
// wrong lesson at the end of a unit. scripts/check-sections.mts asserts it.
LESSONS.push(
  {
    slug: "recursion",
    unit: 7,
    title_mn: "Рекурс",
    title_en: "Recursion",
    goal_mn: "Өөрийгөө дуудаж байгаа функц бичих, зогсох нөхцөлийг зөв тавих.",
    goal_en:
      "Write a function that calls itself, and stop it at the right moment.",
    intro_mn:
      "Функц өөрийгөө дуудаж болно. Энэ нь том бодлогыг яг адилхан жижиг бодлого болгон хувааж, сүүлд нь маш амархан тохиолдол дээр зогсоно. Зогсох тохиолдлыг ЭХЛЭЭД бичих нь чухал — тэрийг мартвал програм хэзээ ч дуусахгүй.",
    intro_en:
      "A function is allowed to call itself. That turns a big job into the same job on something smaller, until you reach a case so easy you can answer it outright. Write that stopping case FIRST — forget it and the program never ends.",
    code: `#include <iostream>
using namespace std;

int factorial(int n) {
    if (n <= 1) {
        return 1;
    }
    return n * factorial(n - 1);
}

int main() {
    cout << factorial(5) << endl;
    return 0;
}`,
    output: "120",
    lines: [
      {
        code: "if (n <= 1) {",
        note_mn:
          "Зогсох нөхцөл. 1-ийн факториал бол 1 — үүнийг бодох шаардлагагүй, шууд мэднэ.",
        note_en:
          "The stopping case. The factorial of 1 is just 1 — nothing to work out.",
      },
      {
        code: "return n * factorial(n - 1);",
        note_mn:
          "Өөрийгөө дуудаж байна, гэхдээ ҮРГЭЛЖ бага тоогоор. Тийм учраас эцэст нь 1 хүрнэ.",
        note_en:
          "It calls itself, but ALWAYS with a smaller number. That is why it eventually reaches 1.",
      },
      {
        code: "cout << factorial(5) << endl;",
        note_mn:
          "5 → 5*factorial(4) → 5*4*factorial(3) → ... → 5*4*3*2*1 = 120.",
        note_en: "5 → 5*factorial(4) → 5*4*factorial(3) → … → 5*4*3*2*1 = 120.",
      },
    ],
    terms: [
      {
        term: "recursion",
        def_mn: "Функц өөрийгөө дуудах.",
        def_en: "A function calling itself.",
      },
      {
        term: "base case",
        def_mn:
          "Дуудалт зогсох тохиолдол. Үүнгүйгээр рекурс хязгааргүй үргэлжилнэ.",
        def_en:
          "The case where the calls stop. Without one, recursion never ends.",
      },
    ],
    mistakes: [
      {
        wrong: "int f(int n) { return n * f(n - 1); }",
        fix: "int f(int n) { if (n <= 1) return 1; return n * f(n - 1); }",
        why_mn:
          "Зогсох нөхцөлгүй. Програм хязгааргүй дуудаж, санах ой дүүрч сүйрнэ (stack overflow).",
        why_en:
          "No stopping case. It calls forever until memory runs out — a stack overflow.",
      },
      {
        wrong: "return n * factorial(n);",
        fix: "return n * factorial(n - 1);",
        why_mn:
          "Тоо нь буурахгүй бол зогсох нөхцөл рүү хэзээ ч ойртохгүй. Дуудалт бүр багасаж байх ёстой.",
        why_en:
          "If the value never shrinks it never approaches the stopping case. Each call must get smaller.",
      },
    ],
    quiz: {
      question_mn: "Зогсох нөхцөл (base case) байхгүй бол юу болох вэ?",
      question_en: "What happens if a recursive function has no base case?",
      choices: [
        "Функц 0 буцаана / The function returns 0",
        "Хязгааргүй дуудаж програм сүйрнэ / It calls itself forever and crashes",
        "Компилятор алдаа заана / The compiler refuses to build it",
      ],
      answer: 1,
      explain_mn:
        "Компилятор үүнийг барьж чадахгүй — ажиллах үедээ л сүйрнэ. Тийм учраас зогсох нөхцөлөө эхэлж бич.",
      explain_en:
        "The compiler cannot catch this — it only fails when it runs. That is why you write the stopping case first.",
    },
    challenge_mn:
      "n-ээс 1 хүртэл тоонуудын нийлбэрийг рекурсээр бод. sum(4) нь 10 гарна.",
    challenge_en:
      "Write a recursive function that adds up 1 to n. sum(4) should give 10.",
    python: {
      code: `def factorial(n):
    if n <= 1:
        return 1
    return n * factorial(n - 1)

print(factorial(5))`,
      output: "120",
      lines: [
        {
          code: "if n <= 1:",
          note_mn: "Зогсох нөхцөл — C++ дээрхтэй яг адилхан.",
          note_en: "The stopping case — exactly as in C++.",
        },
        {
          code: "return n * factorial(n - 1)",
          note_mn: "Бага тоогоор өөрийгөө дуудна.",
          note_en: "Calls itself with a smaller number.",
        },
      ],
      mistakes: [
        {
          wrong: "def f(n): return n * f(n - 1)",
          fix: "def f(n):\n    if n <= 1: return 1\n    return n * f(n - 1)",
          why_mn:
            "Python-д энэ нь RecursionError өгнө — анхдагчаар ойролцоогоор 1000 дуудалтын дараа зогсоно.",
          why_en:
            "In Python this raises RecursionError — it stops after about 1000 calls by default.",
        },
      ],
    },
  },
  {
    slug: "complexity",
    unit: 7,
    title_mn: "Хэр хурдан вэ?",
    title_en: "How Fast Is It?",
    goal_mn:
      "Хэдэн үйлдэл хийгдэхийг тоолж, бодлогын хязгаараас аргаа сонгож сурах.",
    goal_en:
      "Count how much work a program does, and read the limits to choose an approach.",
    intro_mn:
      "Хоёр програм ижил хариу өгч болох ч нэг нь секунд, нөгөө нь цаг зарцуулна. Чухал нь мөрийн тоо биш, ДАВТАЛТЫН тоо. Бодлогын хязгаарыг хараад аль арга багтахыг урьдчилж мэдэж болно.",
    intro_en:
      "Two programs can give the same answer, one in a second and one in an hour. What matters is not how many lines you wrote but how many times the computer repeats something. The limits in a problem tell you which approach will fit.",
    code: `#include <iostream>
#include <vector>
using namespace std;

int main() {
    vector<int> v = {4, 8, 15, 16, 23, 42};
    int n = v.size();

    long long steps = 0;
    for (int i = 0; i < n; i++) {
        steps++;
    }
    cout << "one loop: " << steps << endl;

    steps = 0;
    for (int i = 0; i < n; i++) {
        for (int j = 0; j < n; j++) {
            steps++;
        }
    }
    cout << "two loops: " << steps << endl;
    return 0;
}`,
    output: "one loop: 6\ntwo loops: 36",
    lines: [
      {
        code: "for (int i = 0; i < n; i++) {",
        note_mn: "Нэг давталт — n удаа ажиллана. Үүнийг O(n) гэдэг.",
        note_en: "One loop runs n times. We call that O(n).",
      },
      {
        code: "for (int j = 0; j < n; j++) {",
        note_mn:
          "Давталт дотор давталт — n × n удаа. Үүнийг O(n²) гэдэг. n=1000 бол нэг сая удаа.",
        note_en:
          "A loop inside a loop runs n × n times — O(n²). With n=1000 that is a million steps.",
      },
      {
        code: "long long steps = 0;",
        note_mn:
          "Тоолуур том болж магадгүй тул `long long`. `int` 2 тэрбумаас хэтэрвэл алдаа өгнө.",
        note_en:
          "The counter can get big, so `long long`. An `int` breaks past about 2 billion.",
      },
    ],
    terms: [
      {
        term: "O(n)",
        def_mn: "Өгөгдлийн хэмжээтэй шууд пропорциональ ажиллагаа.",
        def_en: "Work that grows in step with the amount of data.",
      },
      {
        term: "O(n²)",
        def_mn:
          "Хоёр давхар давталт. n хоёр дахин ихсэхэд ажил дөрөв дахин нэмэгдэнэ.",
        def_en: "Two nested loops. Double n and the work goes up four times.",
      },
    ],
    mistakes: [
      {
        wrong:
          "n ≤ 100000 бодлогод хоёр давхар давталт / A double loop when n ≤ 100000",
        fix: "Нэг давталт эсвэл эрэмбэлэлт / One pass, or a sort",
        why_mn:
          "100000² = 10 тэрбум үйлдэл. Ямар ч шүүгч үүнийг хүлээхгүй — TLE гарна.",
        why_en:
          "100000² is ten billion steps. No judge waits that long — you get TLE.",
      },
      {
        wrong: "Нэрийг богиносгож хурдасгах / Shortening names to go faster",
        fix: "Давталтын тоог багасгах / Do less repeated work",
        why_mn:
          "Нэрний урт хурдад огт нөлөөлөхгүй. Зөвхөн хийгдэж буй ажлын хэмжээ л чухал.",
        why_en:
          "Name length has no effect at all. Only the amount of repeated work matters.",
      },
    ],
    quiz: {
      question_mn:
        "Бодлогод n ≤ 200000 гэж байвал аль арга багтах магадлалтай вэ?",
      question_en:
        "A problem says n ≤ 200000. Which approach is likely to fit?",
      choices: [
        "Хоёр давхар давталт O(n²) / A double loop, O(n²)",
        "Гурван давхар давталт O(n³) / A triple loop, O(n³)",
        "Нэг давталт эсвэл эрэмбэлэлт O(n log n) / One pass or a sort, O(n log n)",
      ],
      answer: 2,
      explain_mn:
        "n = 200000 бол n² нь 40 тэрбум — хэтэрхий их. O(n) ба O(n log n) л багтана.",
      explain_en:
        "With n = 200000, n² is forty billion — far too much. Only O(n) or O(n log n) fits.",
    },
    challenge_mn:
      "Массив дотор ижил хоёр тоо байгаа эсэхийг ол. Эхлээд хоёр давхар давталтаар, дараа нь эрэмбэлээд нэг давталтаар бич. Хоёулаа ижил хариу өгөх ёстой.",
    challenge_en:
      "Find whether an array contains the same number twice. Do it with a double loop first, then by sorting and making one pass. Both must agree.",
  },
  {
    slug: "grids",
    unit: 7,
    title_mn: "Хоёр хэмжээст хүснэгт",
    title_en: "Grids",
    goal_mn: "Мөр, баганатай хүснэгт үүсгэж, дамжин уншиж сурах.",
    goal_en: "Build a table with rows and columns, and walk through it.",
    intro_mn:
      "Шатрын самбар, лабиринт, зургийн цэгүүд — эдгээр нь бүгд хүснэгт. Массивын доторх массив гэж бодож болно: эхний индекс нь МӨР, хоёр дахь нь БАГАНА.",
    intro_en:
      "A chessboard, a maze, the pixels of a picture — all of them are grids. Think of an array of arrays: the first index is the ROW, the second is the COLUMN.",
    code: `#include <iostream>
#include <vector>
using namespace std;

int main() {
    int rows = 3, cols = 4;
    vector<vector<int>> g(rows, vector<int>(cols, 0));

    g[0][0] = 1;
    g[1][2] = 7;
    g[2][3] = 9;

    for (int r = 0; r < rows; r++) {
        for (int c = 0; c < cols; c++) {
            cout << g[r][c] << " ";
        }
        cout << endl;
    }
    return 0;
}`,
    output: "1 0 0 0 \n0 0 7 0 \n0 0 0 9",
    lines: [
      {
        code: "vector<vector<int>> g(rows, vector<int>(cols, 0));",
        note_mn:
          "3 мөр үүсгэж, мөр бүрд 4 нүд, бүгдийг 0-ээр дүүргэв. Хэмжээгээ энд нэг л удаа зааж өгнө.",
        note_en:
          "Makes 3 rows, each with 4 cells, all set to 0. You give the size once, here.",
      },
      {
        code: "g[1][2] = 7;",
        note_mn:
          "МӨР эхэлж, дараа нь БАГАНА. Энэ бол 2-р мөрийн 3 дахь нүд — тоолол 0-ээс.",
        note_en:
          "ROW first, then COLUMN. This is row 2, column 3 — counting from 0.",
      },
      {
        code: "for (int r = 0; r < rows; r++) {",
        note_mn:
          "Гадна давталт мөрөөр явна. Тийм учраас нэг мөр бүрэн хэвлэгдээд шинэ мөр эхэлнэ.",
        note_en:
          "The outer loop walks the rows. That is why a whole row prints before the line break.",
      },
      {
        code: "cout << endl;",
        note_mn: "Мөр бүрийн ТӨГСГӨЛД. Дотор давталтад байвал багана болно.",
        note_en:
          "At the END of each row. Put it inside the inner loop and you get a column instead.",
      },
    ],
    terms: [
      {
        term: "row",
        def_mn: "Хэвтээ эгнээ. Эхний индекс.",
        def_en: "A horizontal line of cells. The first index.",
      },
      {
        term: "column",
        def_mn: "Босоо эгнээ. Хоёр дахь индекс.",
        def_en: "A vertical line of cells. The second index.",
      },
    ],
    mistakes: [
      {
        wrong: "g[c][r]",
        fix: "g[r][c]",
        why_mn:
          "Мөр, багана солигдвол хүснэгт эргэнэ. Дөрвөлжин биш хүснэгт дээр бол шууд сүйрнэ.",
        why_en:
          "Swapping row and column flips the grid — and on a non-square grid it crashes outright.",
      },
      {
        wrong: "vector<vector<int>> g; g[0][0] = 1;",
        fix: "vector<vector<int>> g(rows, vector<int>(cols, 0));",
        why_mn:
          "Хоосон хүснэгтэд нүд байхгүй. Ашиглахаас өмнө хэмжээг нь өгөх ёстой.",
        why_en:
          "An empty grid has no cells at all. Give it a size before you use it.",
      },
    ],
    quiz: {
      question_mn: "`g[2][0]` гэдэг нь юуг заах вэ?",
      question_en: "What does `g[2][0]` refer to?",
      choices: [
        "3 дахь мөрийн 1 дэх нүд / Row 3, column 1",
        "1 дэх мөрийн 3 дахь нүд / Row 1, column 3",
        "2 дахь мөрийн 0 дахь мөр / Row 2 of row 0",
      ],
      answer: 0,
      explain_mn:
        "Эхний тоо нь мөр. 0-ээс тоолохоор индекс 2 нь 3 дахь мөр, индекс 0 нь 1 дэх багана.",
      explain_en:
        "The first number is the row. Counting from 0, index 2 is the third row and index 0 is the first column.",
    },
    challenge_mn:
      "3×3 хүснэгт уншаад голын диагоналын нийлбэрийг хэвлэ (g[0][0] + g[1][1] + g[2][2]).",
    challenge_en:
      "Read a 3×3 grid and print the sum of the main diagonal (g[0][0] + g[1][1] + g[2][2]).",
    python: {
      code: `rows, cols = 3, 4
g = [[0] * cols for _ in range(rows)]

g[0][0] = 1
g[1][2] = 7
g[2][3] = 9

for r in range(rows):
    for c in range(cols):
        print(g[r][c], end=" ")
    print()`,
      output: "1 0 0 0 \n0 0 7 0 \n0 0 0 9",
      lines: [
        {
          code: "g = [[0] * cols for _ in range(rows)]",
          note_mn:
            "Мөр бүрийг ТУСДАА үүсгэж байна. `[[0]*cols]*rows` гэвэл бүх мөр нэг л жагсаалт болно.",
          note_en:
            "Builds each row SEPARATELY. Writing `[[0]*cols]*rows` makes every row the same list.",
        },
        {
          code: 'print(g[r][c], end=" ")',
          note_mn: '`end=" "` нь мөр таслахгүй, зай тавина.',
          note_en: '`end=" "` prints a space instead of a line break.',
        },
      ],
      mistakes: [
        {
          wrong: "g = [[0] * cols] * rows",
          fix: "g = [[0] * cols for _ in range(rows)]",
          why_mn:
            "Эхнийх нь нэг мөрийг олон удаа заасан. `g[0][0]` -г өөрчилвөл бүх мөр өөрчлөгдөнө.",
          why_en:
            "The first makes every row point at the SAME list. Change `g[0][0]` and every row changes.",
        },
      ],
    },
  },
  {
    slug: "arrays-in-functions",
    unit: 7,
    title_mn: "Массивыг функцэд өгөх",
    title_en: "Passing Arrays to Functions",
    goal_mn:
      "Вектороо хуулбарлахгүйгээр функцэд дамжуулж, өөрчлөлт нь үлдэхээр болгох.",
    goal_en:
      "Hand a vector to a function without copying it, and keep the changes.",
    intro_mn:
      "Функцэд вектор өгөхөд анхдагчаараа ХУУЛБАР үүснэ. Тэр хуулбар дээр хийсэн өөрчлөлт гадна үлдэхгүй, том вектор дээр удаан ажиллана. `&` тэмдэг тавьвал хуулбар үүсэхгүй, жинхэнэ вектор дээр ажиллана.",
    intro_en:
      "By default a vector handed to a function is COPIED. Changes to that copy do not survive, and on a big vector the copying itself is slow. An `&` means the function works on the real one instead.",
    code: `#include <iostream>
#include <vector>
using namespace std;

void addOne(vector<int>& v) {
    for (int& x : v) {
        x = x + 1;
    }
}

int sum(const vector<int>& v) {
    int total = 0;
    for (int x : v) {
        total = total + x;
    }
    return total;
}

int main() {
    vector<int> nums = {1, 2, 3};
    addOne(nums);
    cout << nums[0] << " " << nums[1] << " " << nums[2] << endl;
    cout << sum(nums) << endl;
    return 0;
}`,
    output: "2 3 4\n9",
    lines: [
      {
        code: "void addOne(vector<int>& v) {",
        note_mn:
          "`&` — хуулбар биш, жинхэнэ вектор. Дотор нь хийсэн өөрчлөлт гадна үлдэнэ.",
        note_en:
          "The `&` means the real vector, not a copy. Changes made inside stay.",
      },
      {
        code: "for (int& x : v) {",
        note_mn:
          "Энд бас `&` хэрэгтэй. Үгүй бол `x` нь нүдний хуулбар болж, өөрчлөлт алдагдана.",
        note_en:
          "This needs an `&` too. Without it `x` is a copy of the cell and the change is lost.",
      },
      {
        code: "int sum(const vector<int>& v) {",
        note_mn:
          "`const&` — хуулбарлахгүй, гэхдээ өөрчлөхгүй гэж амлаж байна. Уншиж л байгаа бол үүнийг хэрэглэ.",
        note_en:
          "`const&` means no copy, and a promise not to change it. Use this when you only read.",
      },
    ],
    terms: [
      {
        term: "&",
        def_mn: "Хуулбар биш, жинхэнэ утга дээр ажиллана гэсэн тэмдэг.",
        def_en: "A mark saying: work on the real thing, not a copy.",
      },
      {
        term: "const&",
        def_mn: "Хуулбарлахгүй, гэхдээ өөрчлөхийг хориглоно.",
        def_en: "No copy, and changing it is forbidden.",
      },
    ],
    mistakes: [
      {
        wrong: "void addOne(vector<int> v)",
        fix: "void addOne(vector<int>& v)",
        why_mn:
          "`&` мартвал функц хуулбар дээр ажиллана. Програм алдаа заахгүй, зүгээр л юу ч өөрчлөгдөхгүй.",
        why_en:
          "Without the `&` the function edits a copy. Nothing errors — nothing simply changes.",
      },
      {
        wrong: "for (int x : v) { x = x + 1; }",
        fix: "for (int& x : v) { x = x + 1; }",
        why_mn:
          "Нүд бүрийн хуулбарыг нэмээд хаяж байна. Вектор хэвээрээ үлдэнэ.",
        why_en:
          "This increments a copy of each cell and throws it away. The vector is untouched.",
      },
    ],
    quiz: {
      question_mn:
        "Функц векторыг зөвхөн УНШИХ бол аль гарын үсэг хамгийн зөв вэ?",
      question_en: "A function only READS a vector. Which signature is best?",
      choices: [
        "vector<int> v — хуулбар / a copy",
        "const vector<int>& v — хуулбаргүй, өөрчлөхгүй / no copy, cannot change",
        "vector<int>& v — хуулбаргүй, өөрчилж болно / no copy, can change",
      ],
      answer: 1,
      explain_mn:
        "Хуулбар нь удаан, өөрчилж болдог хувилбар нь буруугаар өөрчлөх эрсдэлтэй. `const&` хоёуланг нь шийднэ.",
      explain_en:
        "A copy is slow, and a plain `&` allows accidental edits. `const&` avoids both.",
    },
    challenge_mn:
      "Векторын хамгийн их утгыг буцаадаг функц бич. Хуулбар үүсгэхгүй байхаар `const&` ашигла.",
    challenge_en:
      "Write a function that returns the largest value in a vector. Use `const&` so nothing is copied.",
  },
  {
    slug: "fast-io",
    unit: 7,
    title_mn: "Хурдан оролт",
    title_en: "Fast Input",
    goal_mn: "Хэдэн ширхэг тоо ирэхийг мэдэхгүй үед уншиж, оролтоо хурдасгах.",
    goal_en:
      "Read numbers when you are not told how many there are, and make reading fast.",
    intro_mn:
      "Заримдаа бодлого «файл дуустал тоо унш» гэдэг. `cin >> x` нь амжилттай уншсан эсэхээ хэлдэг тул үүнийг давталтын нөхцөл болгон ашиглаж болно. Мөн олон мянган тоо уншихад эхэнд нэг мөр нэмбэл хэд дахин хурдан болно.",
    intro_en:
      "Sometimes a problem says: keep reading numbers until the input runs out. `cin >> x` reports whether it succeeded, so you can use it as the loop condition. And when there are tens of thousands of numbers, one extra line at the top makes reading several times faster.",
    code: `#include <iostream>
#include <vector>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    vector<int> nums;
    int x;
    while (cin >> x) {
        nums.push_back(x);
    }

    long long total = 0;
    for (int v : nums) {
        total = total + v;
    }
    cout << nums.size() << " " << total << endl;
    return 0;
}`,
    output: "(input: 10 20 5 15 10)\n5 60",
    lines: [
      {
        code: "ios::sync_with_stdio(false);",
        note_mn:
          "C++-ийн уншилтыг C-ийнхтэй тааруулахаа болино. Ганц мөр, гэхдээ том оролт дээр хэд дахин хурдасна.",
        note_en:
          "Stops C++ from keeping in step with C's own input. One line, and on big inputs it is several times faster.",
      },
      {
        code: "cin.tie(nullptr);",
        note_mn:
          "Уншихаас өмнө гаралтыг албадан хэвлэхээ болино. Дээрхтэй хамт хэрэглэнэ.",
        note_en:
          "Stops it flushing output before every read. Used together with the line above.",
      },
      {
        code: "while (cin >> x) {",
        note_mn:
          "Уншиж чадвал үнэн, оролт дуусвал худал. Тоо хэд болохыг мэдэх шаардлагагүй.",
        note_en:
          "True while it can read, false when the input runs out. You never need to be told the count.",
      },
      {
        code: "long long total = 0;",
        note_mn:
          "Олон тоо нэмэхэд нийлбэр том болно. `int` хүрэхгүй байж магадгүй.",
        note_en:
          "Adding many numbers gives a big total. An `int` may not be enough.",
      },
    ],
    terms: [
      {
        term: "EOF",
        def_mn: "Оролтын төгсгөл. Уншихыг оролдоход амжилтгүй болно.",
        def_en: "The end of the input. A read attempt there fails.",
      },
      {
        term: "sync_with_stdio",
        def_mn: "Уншилтыг хурдасгадаг нэг удаагийн тохиргоо.",
        def_en: "A one-off setting that speeds reading up.",
      },
    ],
    mistakes: [
      {
        wrong: "while (!cin.eof()) { cin >> x; ... }",
        fix: "while (cin >> x) { ... }",
        why_mn:
          "`eof()` нь уншилт БҮТЭЛГҮЙТСЭНИЙ ДАРАА үнэн болно. Тийм учраас сүүлийн тоо давхар боловсруулагдана.",
        why_en:
          "`eof()` only turns true AFTER a read has already failed, so the last value gets handled twice.",
      },
      {
        wrong:
          "sync_with_stdio(false) + printf хольж хэрэглэх / Mixing sync_with_stdio(false) with printf",
        fix: "Зөвхөн нэгийг нь сонгох / Pick one family and stay in it",
        why_mn:
          "Хоёуланг нь холивол гаралтын дараалал будлиантана. Нэгийг нь сонго.",
        why_en:
          "Mixing the two after that line scrambles the order of your output. Pick one.",
      },
    ],
    quiz: {
      question_mn: "`while (cin >> x)` давталт хэзээ зогсох вэ?",
      question_en: "When does `while (cin >> x)` stop?",
      choices: [
        "x нь 0 болоход / When x becomes 0",
        "Яг 100 тоо уншсаны дараа / After exactly 100 numbers",
        "Уншиж чадахгүй болоход буюу оролт дуусахад / When it can no longer read — the input ended",
      ],
      answer: 2,
      explain_mn:
        "`cin >> x` нь амжилттай уншсан бол үнэн буцаана. Оролт дуусахад худал болж давталт зогсоно.",
      explain_en:
        "`cin >> x` reports success. When the input ends it reports failure and the loop stops.",
    },
    challenge_mn:
      "Оролт дуустал тоо уншаад хамгийн их, хамгийн бага утгыг хэвлэ. Тоо хэд байхыг чамд хэлэхгүй.",
    challenge_en:
      "Read numbers until the input ends, then print the largest and the smallest. You are not told how many there are.",
  },
  {
    slug: "linear-search",
    unit: 8,
    title_mn: "Шугаман хайлт",
    title_en: "Linear Search",
    goal_mn: "Массиваас утга хайж, олдсон байрлалыг нь буцаах.",
    goal_en: "Look for a value in an array and report where it is.",
    intro_mn:
      "Хамгийн энгийн хайлт: эхнээс нь эхлээд нэг бүрчлэн шалгана. Олдвол шууд зогсоно. Олдохгүй бол -1 буцаах нь заншил — «байхгүй» гэдгийг ингэж илэрхийлдэг.",
    intro_en:
      'The simplest search there is: start at the front and check each cell. Stop the moment you find it. If it is not there, returning -1 is the convention for "not found".',
    code: `#include <iostream>
#include <vector>
using namespace std;

int find(const vector<int>& v, int target) {
    for (int i = 0; i < (int)v.size(); i++) {
        if (v[i] == target) {
            return i;
        }
    }
    return -1;
}

int main() {
    vector<int> v = {4, 8, 15, 16, 23, 42};
    cout << find(v, 15) << endl;
    cout << find(v, 99) << endl;
    return 0;
}`,
    output: "2\n-1",
    lines: [
      {
        code: "if (v[i] == target) {",
        note_mn: "Нүд бүрийг хайж буй утгатай харьцуулна.",
        note_en: "Compare each cell with the value we want.",
      },
      {
        code: "return i;",
        note_mn: "Олонгуут ШУУД буцна. Цааш үргэлжлүүлэх нь дэмий ажил.",
        note_en: "Return the moment it is found. Carrying on is wasted work.",
      },
      {
        code: "return -1;",
        note_mn:
          "Давталт бүрэн дуусвал олдоогүй гэсэн үг. -1 бол «байхгүй»-гийн тэмдэг.",
        note_en:
          'If the loop finishes, it was never found. -1 is the sign for "not there".',
      },
      {
        code: "for (int i = 0; i < (int)v.size(); i++) {",
        note_mn:
          "`(int)` — `size()` нь тэмдэггүй тоо буцаадаг тул харьцуулахад анхааруулга гарахаас сэргийлж байна.",
        note_en:
          "The `(int)` avoids a warning: `size()` returns an unsigned type and comparing it to an int complains.",
      },
    ],
    terms: [
      {
        term: "linear search",
        def_mn: "Эхнээс нь дараалан шалгах хайлт. O(n).",
        def_en: "Checking each item in turn from the start. O(n).",
      },
      {
        term: "sentinel value",
        def_mn: "«Олдсонгүй» гэх мэт тусгай утга. Энд -1.",
        def_en: 'A special value meaning something like "not found". Here, -1.',
      },
    ],
    mistakes: [
      {
        wrong: "if (v[i] == target) found = i;",
        fix: "if (v[i] == target) return i;",
        why_mn:
          "Зогсохгүй бол сүүлчийн тохиолдол хадгалагдана. Эхний тохиолдлыг хүсвэл шууд буц.",
        why_en:
          "Without stopping you end up with the LAST match. If you want the first, return straight away.",
      },
      {
        wrong: "for (int i = 0; i <= v.size(); i++)",
        fix: "for (int i = 0; i < (int)v.size(); i++)",
        why_mn:
          "`<=` бол хамгийн сүүлийн нүднээс хэтэрнэ. Массивын гадна унших нь ямар ч алдаа заахгүй, зүгээр л хог өгнө.",
        why_en:
          "`<=` runs one past the last cell. Reading outside an array does not error — it just hands you rubbish.",
      },
    ],
    quiz: {
      question_mn:
        "6 элементтэй массиваас байхгүй утга хайвал хэдэн харьцуулалт хийгдэх вэ?",
      question_en:
        "Searching a 6-element array for a value that is not there — how many comparisons?",
      choices: ["1 / 1", "3 / 3", "6 / 6"],
      answer: 2,
      explain_mn:
        "Олдохгүй гэдгийг батлахын тулд БҮГДИЙГ шалгах ёстой. Тийм учраас хамгийн муу тохиолдол нь n.",
      explain_en:
        "To be sure it is absent you must check every one. That is why the worst case is n.",
    },
    challenge_mn:
      "Утга массивт ХЭДЭН удаа таарахыг тоолдог функц бич. Олдмогц бүү зогс.",
    challenge_en:
      "Write a function that counts HOW MANY times a value appears. This one must not stop early.",
    python: {
      code: `def find(v, target):
    for i in range(len(v)):
        if v[i] == target:
            return i
    return -1

v = [4, 8, 15, 16, 23, 42]
print(find(v, 15))
print(find(v, 99))`,
      output: "2\n-1",
      lines: [
        {
          code: "for i in range(len(v)):",
          note_mn: "`range(len(v))` нь 0-ээс сүүлийн индекс хүртэл.",
          note_en: "`range(len(v))` runs from 0 to the last index.",
        },
        {
          code: "return -1",
          note_mn:
            "Python-д `v.index(target)` гэж бас болно, гэхдээ олдохгүй бол алдаа шидэнэ.",
          note_en:
            "Python also has `v.index(target)`, but that raises an error when it is missing.",
        },
      ],
    },
  },
  {
    slug: "sorting-tools",
    unit: 8,
    title_mn: "Эрэмбэлэх",
    title_en: "Sorting",
    goal_mn: "`sort` ашиглан эрэмбэлэх, өөрийн дүрмээр эрэмбэлэх.",
    goal_en: "Sort with `sort`, and sort by your own rule.",
    intro_mn:
      "Эрэмбэлэх алгоритмыг өөрөө бичих шаардлагагүй — C++ дотор бэлэн байдаг бөгөөд чиний бичихээс хурдан. Мэдэх ёстой зүйл нь: хэрхэн дуудах, өөрийн дүрмээ яаж өгөх вэ гэдэг.",
    intro_en:
      "You do not need to write a sorting algorithm — C++ ships one, and it is faster than anything you would write. What you need to know is how to call it, and how to give it your own rule.",
    code: `#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

struct Student {
    string name;
    int score;
};

bool byScore(const Student& a, const Student& b) {
    return a.score > b.score;
}

int main() {
    vector<int> v = {5, 2, 9, 1};
    sort(v.begin(), v.end());
    for (int x : v) cout << x << " ";
    cout << endl;

    vector<Student> s = {{"Bat", 70}, {"Suvd", 95}, {"Tuul", 82}};
    sort(s.begin(), s.end(), byScore);
    for (const Student& st : s) cout << st.name << " ";
    cout << endl;
    return 0;
}`,
    output: "1 2 5 9 \nSuvd Tuul Bat",
    lines: [
      {
        code: "#include <algorithm>",
        note_mn: "`sort` энд байрладаг. `<cmath>` дотор БИШ.",
        note_en: "This is where `sort` lives. NOT in `<cmath>`.",
      },
      {
        code: "sort(v.begin(), v.end());",
        note_mn:
          "Эхлэл ба төгсгөлийг өгнө. Анхдагчаар багаас их рүү эрэмбэлнэ.",
        note_en:
          "You give it the start and the end. By default it sorts smallest first.",
      },
      {
        code: "return a.score > b.score;",
        note_mn:
          "«a нь b-ээс ӨМНӨ байх ёстой юу?» гэсэн асуултад хариулна. `>` тул өндөр оноо түрүүлнэ.",
        note_en:
          'Answers "should a come BEFORE b?". With `>`, the higher score comes first.',
      },
      {
        code: "sort(s.begin(), s.end(), byScore);",
        note_mn: "Гурав дахь аргумент нь өөрийн дүрэм.",
        note_en: "The third argument is your own rule.",
      },
    ],
    terms: [
      {
        term: "comparator",
        def_mn: "Хоёр элементийн аль нь өмнө байхыг хэлдэг функц.",
        def_en: "A function that says which of two items comes first.",
      },
      {
        term: "O(n log n)",
        def_mn: "`sort`-ын хурд. n = 200000 байсан ч амархан багтана.",
        def_en: "How fast `sort` is. Even n = 200000 fits comfortably.",
      },
    ],
    mistakes: [
      {
        wrong: "return a.score >= b.score;",
        fix: "return a.score > b.score;",
        why_mn:
          "Тэнцүү үед `true` буцаавал `sort` сүйрч болно. Тэнцүү бол ЗААВАЛ `false` байх ёстой.",
        why_en:
          "Returning true for equal items can crash `sort`. Equal must always give false.",
      },
      {
        wrong: "sort(v);",
        fix: "sort(v.begin(), v.end());",
        why_mn:
          "C++-д мужийг эхлэл, төгсгөлөөр нь өгдөг. Векторыг шууд өгч болохгүй.",
        why_en:
          "C++ takes a range as a start and an end. You cannot hand it the vector itself.",
      },
    ],
    quiz: {
      question_mn: "Comparator функц юуг буцаах ёстой вэ?",
      question_en: "What should a comparator return?",
      choices: [
        "a нь b-ээс өмнө байх ёстой бол true / true when a must come before b",
        "a ба b тэнцүү бол true / true when a and b are equal",
        "Хоёрын ялгааг / The difference between them",
      ],
      answer: 0,
      explain_mn:
        "«Өмнө байх уу?» гэсэн асуулт. Тэнцүү бол заавал false — эс бөгөөс `sort` сүйрнэ.",
      explain_en:
        'It answers "does a come first?". Equal items must give false, or `sort` can crash.',
    },
    challenge_mn:
      "Оюутнуудыг оноогоор нь ӨСӨХ дарааллаар эрэмбэл. Оноо тэнцвэл нэрээр нь цагаан толгойн дарааллаар.",
    challenge_en:
      "Sort the students by score, lowest first. When scores tie, order them by name.",
  },
  {
    slug: "binary-search",
    unit: 8,
    title_mn: "Хоёртын хайлт",
    title_en: "Binary Search",
    goal_mn: "Эрэмбэлэгдсэн массиваас хагасаар нь тасалж хайх.",
    goal_en: "Search a sorted array by halving it each time.",
    intro_mn:
      "Толь бичгээс үг хайхдаа эхний хуудаснаас эхэлдэггүй — дунд нь нээгээд аль тал руу явахаа шийддэг. Хоёртын хайлт яг ийм. Ганц болзол: өгөгдөл ЭРЭМБЭЛЭГДСЭН байх ёстой.",
    intro_en:
      "Looking a word up in a dictionary, you do not start at page one — you open the middle and decide which half to keep. Binary search is exactly that. One condition: the data must already be SORTED.",
    code: `#include <iostream>
#include <vector>
using namespace std;

int bsearch(const vector<int>& v, int target) {
    int lo = 0, hi = (int)v.size() - 1;
    while (lo <= hi) {
        int mid = lo + (hi - lo) / 2;
        if (v[mid] == target) return mid;
        if (v[mid] < target) lo = mid + 1;
        else hi = mid - 1;
    }
    return -1;
}

int main() {
    vector<int> v = {4, 8, 15, 16, 23, 42};
    cout << bsearch(v, 23) << endl;
    cout << bsearch(v, 5) << endl;
    return 0;
}`,
    output: "4\n-1",
    lines: [
      {
        code: "int lo = 0, hi = (int)v.size() - 1;",
        note_mn: "Хайж буй муж. `hi` нь СҮҮЛИЙН индекс, хэмжээ биш.",
        note_en:
          "The range still in play. `hi` is the LAST index, not the size.",
      },
      {
        code: "int mid = lo + (hi - lo) / 2;",
        note_mn:
          "Дунд. `(lo + hi) / 2` гэвэл маш том тоон дээр хэтэрч болзошгүй тул ингэж бичдэг.",
        note_en:
          "The middle. Written this way because `(lo + hi) / 2` can overflow on very large values.",
      },
      {
        code: "if (v[mid] < target) lo = mid + 1;",
        note_mn:
          "Дунд нь жижиг бол хариу баруун талд. `mid + 1` — `mid`-ийг дахин шалгах хэрэггүй.",
        note_en:
          "Middle too small, so the answer is to the right. `mid + 1` — no need to check `mid` again.",
      },
      {
        code: "while (lo <= hi) {",
        note_mn:
          "`<=` — муж дотор ганц элемент үлдсэн ч шалгах ёстой. `<` бол түүнийг алдана.",
        note_en:
          "`<=` because a range of one still needs checking. With `<` you would miss it.",
      },
    ],
    terms: [
      {
        term: "binary search",
        def_mn: "Хагасаар нь тасалж хайх. O(log n).",
        def_en: "Searching by halving. O(log n).",
      },
      {
        term: "O(log n)",
        def_mn: "Маш удаан өсдөг. Сая элемент дунд ердөө 20 орчим алхам.",
        def_en: "Grows very slowly. About 20 steps among a million items.",
      },
    ],
    mistakes: [
      {
        wrong: "Эрэмбэлэгдээгүй массив дээр / Binary search on unsorted data",
        fix: "Эхлээд sort(v.begin(), v.end()); / Sort it first",
        why_mn:
          "Эрэмбэлэгдээгүй бол «аль тал руу явах» гэсэн шийдвэр утгагүй. Алдаа заахгүй, зүгээр л буруу хариу өгнө.",
        why_en:
          'Unsorted, the choice of "which half" means nothing. It does not error — it just answers wrongly.',
      },
      {
        wrong: "lo = mid;",
        fix: "lo = mid + 1;",
        why_mn:
          "`mid` шалгагдсан. Дахин оруулбал муж багасахгүй, давталт хэзээ ч дуусахгүй.",
        why_en:
          "`mid` has been checked. Keep it and the range never shrinks — the loop hangs forever.",
      },
    ],
    quiz: {
      question_mn: "Хоёртын хайлт ажиллахын тулд юу ЗААВАЛ шаардлагатай вэ?",
      question_en: "What does binary search absolutely require?",
      choices: [
        "Массив эрэмбэлэгдсэн байх / The array must be sorted",
        "Массив тэгш тооны элементтэй байх / An even number of elements",
        "Бүх утга эерэг байх / All values positive",
      ],
      answer: 0,
      explain_mn:
        "Эрэмбэ л «энэ талд байх боломжгүй» гэж хэлэх эрхийг өгдөг. Тэрийг алдвал бүх зүйл нурна.",
      explain_en:
        'Only the ordering lets you say "it cannot be in that half". Lose that and the whole idea collapses.',
    },
    challenge_mn:
      "Эрэмбэлэгдсэн массиваас өгөгдсөн утгаас ИХ хамгийн эхний тоог ол. Байхгүй бол -1.",
    challenge_en:
      "In a sorted array, find the first value strictly greater than a given number. Return -1 if there is none.",
  },
  {
    slug: "binary-search-answer",
    unit: 8,
    title_mn: "Хариу дээрх хоёртын хайлт",
    title_en: "Binary Search on the Answer",
    goal_mn: "Хариуг шууд бодохын оронд таагаад шалгах аргыг ойлгох.",
    goal_en: "Guess an answer and check it, instead of computing it directly.",
    intro_mn:
      "Энэ бол хүнд сэдэв — эхлээд өмнөх хичээлээ сайн ойлгоод ир. Санаа нь: заримдаа хариуг шууд бодоход хэцүү ч «энэ хариу боломжтой юу?» гэдгийг шалгахад амархан байдаг. Тэгвэл боломжтой хариунуудын дундаас хоёртын хайлтаар хамгийн сайныг олж болно.",
    intro_en:
      'This one is hard — be comfortable with the previous lesson first. The idea: sometimes computing the answer is difficult, but checking "is this answer possible?" is easy. When that is true you can binary search over the possible answers.',
    code: `#include <iostream>
#include <vector>
using namespace std;

// Can we cut k pieces of this length from the boards?
bool enough(const vector<int>& boards, int length, int k) {
    int pieces = 0;
    for (int b : boards) {
        pieces = pieces + b / length;
    }
    return pieces >= k;
}

int main() {
    vector<int> boards = {8, 12, 5};
    int k = 4;

    int lo = 1, hi = 12, best = 0;
    while (lo <= hi) {
        int mid = lo + (hi - lo) / 2;
        if (enough(boards, mid, k)) {
            best = mid;
            lo = mid + 1;
        } else {
            hi = mid - 1;
        }
    }
    cout << best << endl;
    return 0;
}`,
    output: "5",
    lines: [
      {
        code: "bool enough(const vector<int>& boards, int length, int k) {",
        note_mn:
          "Шалгагч функц. «Ийм урттай k ширхэг гарах уу?» гэдэгт л хариулна.",
        note_en:
          'The checker. It only answers "can we get k pieces of this length?".',
      },
      {
        code: "pieces = pieces + b / length;",
        note_mn:
          "Бүхэл хуваалт — 12 урттай банзнаас 5 урттай 2 ширхэг гарна, үлдэгдэл нь хаягдана.",
        note_en:
          "Whole-number division — a board of 12 gives two pieces of 5, and the remainder is scrap.",
      },
      {
        code: "best = mid;",
        note_mn: "Болж байвал ЭНЭ хариуг санаж аваад, илүү ихийг оролдоно.",
        note_en:
          "If it works, remember THIS answer and then try for a bigger one.",
      },
      {
        code: "hi = mid - 1;",
        note_mn:
          "Болохгүй бол хариу үүнээс бага. Урт нэмэгдэх тусам хэсгийн тоо цөөрдөг тул энэ дүрэм ажиллана.",
        note_en:
          "If it fails, the answer is smaller. This works because longer pieces always mean fewer of them.",
      },
    ],
    terms: [
      {
        term: "monotonic",
        def_mn: "Нэг чигт өөрчлөгдөх. Урт ихсэхэд хэсгийн тоо зөвхөн буурна.",
        def_en:
          "Changing in one direction only. Longer pieces, never more of them.",
      },
      {
        term: "predicate",
        def_mn: "Тийм/үгүй гэж хариулдаг функц.",
        def_en: "A function that answers yes or no.",
      },
    ],
    mistakes: [
      {
        wrong: "Ямар ч бодлогод хэрэглэх / Using it on any problem at all",
        fix: "Нэг чигт өөрчлөгдөхийг шалгах / Check the answer is monotonic first",
        why_mn:
          "Хариу нэг чигт өөрчлөгдөхгүй бол «дээшээ юу доошоо юу» гэдэг нь утгагүй болно.",
        why_en:
          'If the yes/no answer does not change in one direction, "go up or go down" means nothing.',
      },
      {
        wrong: "lo = 0",
        fix: "lo = 1",
        why_mn:
          "0 урттай хэсэг гэж байхгүй бөгөөд `b / 0` нь програмыг унагана.",
        why_en:
          "A piece of length 0 makes no sense, and `b / 0` crashes the program.",
      },
    ],
    quiz: {
      question_mn:
        "Хариу дээр хоёртын хайлт хийхийн тулд юу үнэн байх ёстой вэ?",
      question_en: "What must be true to binary search on the answer?",
      choices: [
        "Өгөгдөл эрэмбэлэгдсэн байх / The input must be sorted",
        "Хариу нэг чигт л өөрчлөгдөх — болж байсан бол түүнээс бага нь бас болно / The yes/no answer changes only once, in one direction",
        "Хариу нь заавал тэгш тоо байх / The answer must be even",
      ],
      answer: 1,
      explain_mn:
        "Өгөгдөл биш, ХАРИУ нь эрэмбэтэй байх ёстой: боломжтой хэсэг ба боломжгүй хэсэг тодорхой хуваагдана.",
      explain_en:
        "It is not the input that must be ordered but the ANSWERS: everything up to a point works, everything after it fails.",
    },
    challenge_mn:
      "n ширхэг ном m хүнд тарааж байна. Хүн бүрд өгөх номын хамгийн бага тоо хамгийн их байхаар хуваа.",
    challenge_en:
      "Share n books among m people. Make the smallest share as large as you can.",
  },
  {
    slug: "prefix-sums",
    unit: 8,
    title_mn: "Угтвар нийлбэр",
    title_en: "Prefix Sums",
    goal_mn: "Нэг удаа бэлтгээд, дурын мужийн нийлбэрийг шууд гаргах.",
    goal_en: "Prepare once, then answer any range-sum question instantly.",
    intro_mn:
      "«3-аас 7 дугаар элементийн нийлбэрийг ол» гэсэн асуултыг олон удаа асуувал давталтаар бодох нь удаан. Эхэнд нэг удаа явж, эхнээс энэ хүртэлх нийлбэрүүдийг хадгалвал дараа нь асуулт бүрийг НЭГ хасалтаар хариулна.",
    intro_en:
      'If you are asked "what do elements 3 to 7 add up to?" many times, looping each time is slow. Walk the array once, storing the total up to each point, and every later question becomes a single subtraction.',
    code: `#include <iostream>
#include <vector>
using namespace std;

int main() {
    vector<int> v = {3, 1, 4, 1, 5, 9};
    int n = (int)v.size();

    vector<long long> p(n + 1, 0);
    for (int i = 0; i < n; i++) {
        p[i + 1] = p[i] + v[i];
    }

    // sum of v[1..3] = 1 + 4 + 1
    cout << p[4] - p[1] << endl;
    // sum of v[0..5] = everything
    cout << p[6] - p[0] << endl;
    return 0;
}`,
    output: "6\n23",
    lines: [
      {
        code: "vector<long long> p(n + 1, 0);",
        note_mn:
          "Нэгээр УРТ. `p[0] = 0` нь «юу ч аваагүй» гэсэн үг — энэ нь хасалтыг амар болгодог.",
        note_en:
          'One longer than the array. `p[0] = 0` means "nothing taken yet", which makes the subtraction clean.',
      },
      {
        code: "p[i + 1] = p[i] + v[i];",
        note_mn: "Өмнөх нийлбэр дээр энэ элементийг нэмнэ.",
        note_en: "The previous total plus this element.",
      },
      {
        code: "cout << p[4] - p[1] << endl;",
        note_mn:
          "v[1]-ээс v[3] хүртэлх нийлбэр. Ерөнхий дүрэм: v[a..b] = p[b+1] - p[a].",
        note_en: "The sum of v[1] to v[3]. The rule: v[a..b] is p[b+1] - p[a].",
      },
      {
        code: "vector<long long> p",
        note_mn: "`long long` — нийлбэр анхны утгуудаас хамаагүй том болно.",
        note_en:
          "`long long` because a total grows far beyond the individual values.",
      },
    ],
    terms: [
      {
        term: "prefix sum",
        def_mn: "Эхнээс тухайн байрлал хүртэлх нийлбэр.",
        def_en: "The total from the start up to a position.",
      },
      {
        term: "precompute",
        def_mn: "Асуулт ирэхээс өмнө нэг удаа бодож тавих.",
        def_en: "Doing the work once, before the questions arrive.",
      },
    ],
    mistakes: [
      {
        wrong: "p[b] - p[a]",
        fix: "p[b + 1] - p[a]",
        why_mn:
          "b дугаар элементийг өөрийг нь оруулах ёстой. Нэгээр алдах хамгийн түгээмэл алдаа энд гардаг.",
        why_en:
          "Element b itself must be included. This is where the off-by-one usually bites.",
      },
      {
        wrong: "vector<int> p(n + 1, 0);",
        fix: "vector<long long> p(n + 1, 0);",
        why_mn:
          "100000 ширхэг мянган тооны нийлбэр нь `int`-ээс хэтэрнэ. Хариу чимээгүйхэн буруу болно.",
        why_en:
          "A hundred thousand values of a thousand each overflows an `int`. The answer goes silently wrong.",
      },
    ],
    quiz: {
      question_mn:
        "Угтвар нийлбэр бэлдсэний дараа нэг мужийн нийлбэрийг олоход хэдэн үйлдэл хэрэгтэй вэ?",
      question_en:
        "Once the prefix sums are built, how much work is one range query?",
      choices: [
        "Мужийн урттай тэнцүү / As many steps as the range is long",
        "Массивын урттай тэнцүү / As many steps as the array is long",
        "Ганц хасалт / A single subtraction",
      ],
      answer: 2,
      explain_mn:
        "Бэлтгэл нь O(n), гэхдээ дараа нь асуулт бүр O(1). Олон асуулттай үед л ашигтай.",
      explain_en:
        "Building costs O(n), but each later question is O(1). It pays off when there are many questions.",
    },
    challenge_mn:
      "Массив ба q ширхэг (a, b) асуулт ирнэ. Асуулт бүрийн хариуг угтвар нийлбэрээр гарга.",
    challenge_en:
      "You are given an array and q queries of the form (a, b). Answer each one using prefix sums.",
  },
  {
    slug: "stl-map-set",
    unit: 9,
    title_mn: "map ба set",
    title_en: "map and set",
    goal_mn: "Юмыг тоолохдоо map, давхардлыг арилгахдаа set ашиглах.",
    goal_en: "Count things with a map, and remove duplicates with a set.",
    intro_mn:
      "«Үг бүр хэдэн удаа гарсан бэ?» гэдгийг массиваар бодоход хэцүү. `map` нь түлхүүр бүрд утга хадгална — үг → тоо. `set` нь зөвхөн байгаа эсэхийг санана, давхардлыг өөрөө хаяна. Хоёулаа түлхүүрээ ЭРЭМБЭЛЖ хадгална.",
    intro_en:
      '"How many times did each word appear?" is awkward with an array. A `map` stores a value for each key — word to count. A `set` only remembers whether something is present, dropping duplicates by itself. Both keep their keys in SORTED order.',
    code: `#include <iostream>
#include <map>
#include <set>
#include <string>
using namespace std;

int main() {
    map<string, int> count;
    count["cat"]++;
    count["dog"]++;
    count["cat"]++;

    for (auto& pair : count) {
        cout << pair.first << "=" << pair.second << " ";
    }
    cout << endl;

    set<int> seen;
    seen.insert(5);
    seen.insert(2);
    seen.insert(5);
    cout << seen.size() << endl;
    cout << (seen.count(2) ? "yes" : "no") << endl;
    return 0;
}`,
    output: "cat=2 dog=1 \n2\nyes",
    lines: [
      {
        code: 'count["cat"]++;',
        note_mn:
          "Байхгүй түлхүүр рүү хандахад map өөрөө 0-ээр үүсгэнэ. Тийм учраас шууд нэмж болно.",
        note_en:
          "Touching a missing key makes the map create it as 0. That is why you can just increment it.",
      },
      {
        code: "for (auto& pair : count) {",
        note_mn:
          "`pair.first` бол түлхүүр, `pair.second` бол утга. Дараалал нь ҮРГЭЛЖ эрэмбэлэгдсэн.",
        note_en:
          "`pair.first` is the key, `pair.second` the value. The order is ALWAYS sorted.",
      },
      {
        code: "seen.insert(5);",
        note_mn:
          "5-ыг хоёр удаа хийсэн ч set-д ганцхан удаа л байна. Хэмжээ нь 2.",
        note_en: "5 goes in twice but a set holds it once. The size is 2.",
      },
      {
        code: "seen.count(2)",
        note_mn: "Байвал 1, байхгүй бол 0. Set-д байгаа эсэхийг ингэж шалгана.",
        note_en:
          "1 if present, 0 if not. This is how you test membership in a set.",
      },
    ],
    terms: [
      {
        term: "map",
        def_mn: "Түлхүүр → утга. Түлхүүр давхардахгүй, эрэмбэтэй.",
        def_en: "Key to value. Keys are unique and kept in order.",
      },
      {
        term: "set",
        def_mn: "Давхардалгүй утгуудын эрэмбэтэй цуглуулга.",
        def_en: "An ordered collection with no duplicates.",
      },
    ],
    mistakes: [
      {
        wrong: 'if (count["cat"] > 0)',
        fix: 'if (count.count("cat"))',
        why_mn:
          "Эхнийх нь шалгах гэж байгаад «cat» гэсэн бичлэгийг 0 утгатайгаар ҮҮСГЭНЭ. Map-ын хэмжээ чимээгүйхэн өснө.",
        why_en:
          'The first one CREATES a "cat" entry with value 0 just by looking. The map silently grows.',
      },
      {
        wrong:
          "map оруулсан дарааллаа санана гэж бодох / Expecting a map to keep insertion order",
        fix: "vector-т хийж эрэмбэлэх / Copy into a vector and sort",
        why_mn:
          "`map` нь ҮРГЭЛЖ түлхүүрээр эрэмбэлж хадгална, оруулсан дарааллыг санахгүй.",
        why_en:
          "A `map` is always in key order and never remembers the order you inserted in.",
      },
    ],
    quiz: {
      question_mn:
        '`map<string,int> m;` дээр `m["x"]` гэж УНШИХАД юу болох вэ?',
      question_en:
        'With `map<string,int> m;`, what happens when you merely READ `m["x"]`?',
      choices: [
        "Алдаа заана / It reports an error",
        '"x" гэсэн бичлэгийг 0 утгатай үүсгэнэ / It creates an "x" entry set to 0',
        "Юу ч болохгүй / Nothing at all happens",
      ],
      answer: 1,
      explain_mn:
        "Тийм учраас зөвхөн шалгах бол `count()` эсвэл `find()` ашиглах ёстой.",
      explain_en:
        "That is exactly why you use `count()` or `find()` when you only want to check.",
    },
    challenge_mn:
      "Мөр уншаад үсэг бүр хэдэн удаа орсныг цагаан толгойн дарааллаар хэвлэ.",
    challenge_en:
      "Read a line and print how many times each letter appears, in alphabetical order.",
    python: {
      code: `count = {}
for w in ["cat", "dog", "cat"]:
    count[w] = count.get(w, 0) + 1

for k in sorted(count):
    print(k, "=", count[k], end="  ")
print()

seen = {5, 2, 5}
print(len(seen))
print("yes" if 2 in seen else "no")`,
      output: "cat = 2  dog = 1  \n2\nyes",
      lines: [
        {
          code: "count[w] = count.get(w, 0) + 1",
          note_mn:
            "`get(w, 0)` — байхгүй бол 0. Python-ы dict нь C++-ын map шиг өөрөө үүсгэдэггүй.",
          note_en:
            "`get(w, 0)` gives 0 when missing. A Python dict does NOT auto-create like a C++ map.",
        },
        {
          code: "for k in sorted(count):",
          note_mn:
            "Python-ы dict нь оруулсан дарааллаа санадаг. Эрэмбэ хэрэгтэй бол `sorted()` гэж хэлэх ёстой — C++-аас ялгаатай.",
          note_en:
            "A Python dict keeps insertion order. If you want sorted order you must ask — unlike C++.",
        },
      ],
    },
  },
  {
    slug: "stack-queue",
    unit: 9,
    title_mn: "Стек ба дараалал",
    title_en: "Stack and Queue",
    goal_mn:
      "Хамгийн сүүлд орсныг эхлүүлэх, эсвэл хамгийн түрүүнд орсныг эхлүүлэх.",
    goal_en: "Take the newest first, or take the oldest first.",
    intro_mn:
      "Стек бол таваг угаах овоолго — дээрээс нь авна, хамгийн сүүлд тавьсан нь эхэлж гарна. Дараалал бол дэлгүүрийн ээлж — түрүүлж ирсэн нь түрүүлж гарна. Аль нь хэрэгтэйг бодлого өөрөө хэлдэг.",
    intro_en:
      "A stack is a pile of plates — you take from the top, so the last one on is the first one off. A queue is a shop line — first in, first out. Which you need is usually obvious from the problem.",
    code: `#include <iostream>
#include <stack>
#include <queue>
#include <string>
using namespace std;

bool balanced(const string& s) {
    stack<char> st;
    for (char c : s) {
        if (c == '(') st.push(c);
        else if (c == ')') {
            if (st.empty()) return false;
            st.pop();
        }
    }
    return st.empty();
}

int main() {
    cout << (balanced("(()())") ? "yes" : "no") << endl;
    cout << (balanced("(()") ? "yes" : "no") << endl;

    queue<string> line;
    line.push("Bat");
    line.push("Suvd");
    cout << line.front() << endl;
    line.pop();
    cout << line.front() << endl;
    return 0;
}`,
    output: "yes\nno\nBat\nSuvd",
    lines: [
      {
        code: "if (c == '(') st.push(c);",
        note_mn: "Нээх хаалт бүрийг овоолго дээр тавина.",
        note_en: "Every opening bracket goes on the pile.",
      },
      {
        code: "if (st.empty()) return false;",
        note_mn: "Хаах хаалт ирсэн ч овоолго хоосон — тохирох нээлт байхгүй.",
        note_en:
          "A closing bracket with an empty pile means there is nothing to match it.",
      },
      {
        code: "return st.empty();",
        note_mn: "Төгсгөлд овоолго хоосон байвал бүх хаалт тохирсон.",
        note_en:
          "If the pile is empty at the end, every bracket found its pair.",
      },
      {
        code: "cout << line.front() << endl;",
        note_mn:
          "Дараалалд `front()` — хамгийн эхэнд орсон. Стект бол `top()` гэдэг.",
        note_en:
          "A queue has `front()` — the oldest. A stack calls it `top()` instead.",
      },
    ],
    terms: [
      {
        term: "stack (LIFO)",
        def_mn: "Сүүлд орсон нь эхэлж гарна.",
        def_en: "Last in, first out.",
      },
      {
        term: "queue (FIFO)",
        def_mn: "Түрүүлж орсон нь түрүүлж гарна.",
        def_en: "First in, first out.",
      },
    ],
    mistakes: [
      {
        wrong: "int x = st.pop();",
        fix: "int x = st.top(); st.pop();",
        why_mn:
          "C++-д `pop()` юу ч буцаадаггүй, зөвхөн хаядаг. Утгыг нь урьдчилж `top()`-оор ав.",
        why_en:
          "In C++ `pop()` returns nothing — it only removes. Read the value with `top()` first.",
      },
      {
        wrong: "Хоосон стект top() дуудах / Calling top() on an empty stack",
        fix: "if (!st.empty()) ... st.top()",
        why_mn:
          "Хоосон үед `top()` дуудвал програм ажиллах үедээ сүйрнэ. Алдаа заахгүй.",
        why_en:
          "Calling `top()` on an empty stack crashes at run time. Nothing warns you.",
      },
    ],
    quiz: {
      question_mn:
        "Стект 1, 2, 3 гэж дараалан хийгээд нэгийг гаргавал юу гарах вэ?",
      question_en:
        "Push 1, then 2, then 3 onto a stack and pop once. What comes out?",
      choices: ["1 / 1", "3 / 3", "2 / 2"],
      answer: 1,
      explain_mn: "Стек нь дээрээс авдаг. Хамгийн сүүлд тавьсан 3 эхэлж гарна.",
      explain_en:
        "A stack is taken from the top, so 3 — the last one on — comes off first.",
    },
    challenge_mn: "Мөрийг стек ашиглан урвуугаар нь хэвлэ.",
    challenge_en: "Use a stack to print a string backwards.",
  },
  {
    slug: "priority-queue",
    unit: 9,
    title_mn: "Эрэмбэтэй дараалал",
    title_en: "Priority Queue",
    goal_mn: "Дараагийн хамгийн том (эсвэл хамгийн бага) утгыг байнга авах.",
    goal_en: "Always take the largest — or the smallest — next.",
    intro_mn:
      "Заримдаа «дараагийн хамгийн том» гэдгийг дахин дахин авах хэрэгтэй болдог. Бүхэлд нь дахин эрэмбэлэх нь удаан. `priority_queue` нь хамгийн томыг үргэлж дээрээ барьж байдаг бөгөөд нэмэх, авах хоёул log n хугацаа авна.",
    intro_en:
      'Sometimes you need "the biggest one left", over and over. Re-sorting each time is slow. A `priority_queue` always keeps the biggest on top, and both adding and taking cost log n.',
    code: `#include <iostream>
#include <queue>
#include <vector>
using namespace std;

int main() {
    priority_queue<int> big;
    big.push(5);
    big.push(1);
    big.push(9);
    cout << big.top() << endl;
    big.pop();
    cout << big.top() << endl;

    priority_queue<int, vector<int>, greater<int>> small;
    small.push(5);
    small.push(1);
    small.push(9);
    cout << small.top() << endl;
    return 0;
}`,
    output: "9\n5\n1",
    lines: [
      {
        code: "priority_queue<int> big;",
        note_mn:
          "Анхдагчаар ХАМГИЙН ИХ нь дээрээ. Оруулсан дараалал огт хамаагүй.",
        note_en:
          "By default the LARGEST sits on top. The order you added them does not matter.",
      },
      {
        code: "cout << big.top() << endl;",
        note_mn: "`top()` нь хамгийн томыг харуулна, гаргахгүй.",
        note_en: "`top()` shows the biggest without removing it.",
      },
      {
        code: "priority_queue<int, vector<int>, greater<int>> small;",
        note_mn:
          "Урт бичлэг, гэхдээ эсрэгээр — хамгийн БАГА нь дээрээ. Цээжлэх шаардлагагүй, хэрэгтэй үед хараарай.",
        note_en:
          "A mouthful, but it flips it: now the SMALLEST is on top. Look it up when you need it.",
      },
      {
        code: "big.pop();",
        note_mn: "Дээдийг хаяна. Дараа нь дараагийн том нь өөрөө дээшилнэ.",
        note_en: "Removes the top. The next biggest rises by itself.",
      },
    ],
    terms: [
      {
        term: "priority_queue",
        def_mn: "Хамгийн эрэмбэ өндөртэйг үргэлж дээрээ барих сав.",
        def_en:
          "A container that always keeps the highest-priority item on top.",
      },
      {
        term: "heap",
        def_mn:
          "Үүнийг дотроос нь ажиллуулдаг бүтэц. Хэрхэн ажилладгийг мэдэх шаардлагагүй.",
        def_en:
          "The structure that makes it work. You do not need to know how.",
      },
    ],
    mistakes: [
      {
        wrong:
          "priority_queue-г бүхэлд нь унших / Trying to read through a priority_queue",
        fix: "vector ашиглаад эрэмбэлэх / Use a vector and sort it",
        why_mn:
          "Зөвхөн дээдийг л харж болно. Дотор нь бүрэн эрэмбэлэгдээгүй байдаг.",
        why_en:
          "You can only ever see the top. The rest is not held in sorted order.",
      },
      {
        wrong:
          "greater<int> нь хамгийн их өгнө гэж бодох / Expecting greater<int> to give the largest",
        fix: "greater нь хамгийн БАГА-г дээшлүүлнэ / greater puts the SMALLEST on top",
        why_mn:
          "Нэр нь төөрөгдүүлдэг: `greater` бол харьцуулах дүрэм, үр дүн нь эсрэгээрээ.",
        why_en:
          "The name misleads: `greater` is the comparison rule, and it produces the opposite result.",
      },
    ],
    quiz: {
      question_mn: "`priority_queue<int>` дээр 3, 7, 5 нэмээд `top()` дуудвал?",
      question_en:
        "Push 3, 7 and 5 into a `priority_queue<int>` and call `top()`. What is it?",
      choices: ["7 / 7", "3 / 3", "5 / 5"],
      answer: 0,
      explain_mn: "Анхдагчаар хамгийн их нь дээрээ байдаг тул 7 гарна.",
      explain_en: "The default keeps the largest on top, so 7.",
    },
    challenge_mn: "n ширхэг тоо уншаад хамгийн том 3 утгыг нь хэвлэ.",
    challenge_en: "Read n numbers and print the three largest.",
  },
  {
    slug: "two-pointers",
    unit: 9,
    title_mn: "Хоёр заагч",
    title_en: "Two Pointers",
    goal_mn: "Эрэмбэлэгдсэн массивт хоёр захаас нь дөхөж хос олох.",
    goal_en: "Close in from both ends of a sorted array to find a pair.",
    intro_mn:
      "«Нийлбэр нь яг S болох хоёр тоо байна уу?» Хоёр давхар давталтаар бодвол O(n²). Гэхдээ массив эрэмбэлэгдсэн бол хоёр захаас нь эхэлж, нийлбэр нь их бол баруун заагчийг зүүн тийш, бага бол зүүн заагчийг баруун тийш зөөж, ганцхан удаагийн явалтаар шийднэ.",
    intro_en:
      '"Are there two numbers adding to exactly S?" A double loop makes that O(n²). But if the array is sorted you can start at both ends: too big, move the right pointer left; too small, move the left pointer right. One pass and you are done.',
    code: `#include <iostream>
#include <vector>
using namespace std;

int main() {
    vector<int> v = {1, 3, 4, 7, 11};
    int target = 10;

    int lo = 0, hi = (int)v.size() - 1;
    bool found = false;
    while (lo < hi) {
        int sum = v[lo] + v[hi];
        if (sum == target) {
            cout << v[lo] << " " << v[hi] << endl;
            found = true;
            break;
        }
        if (sum < target) lo++;
        else hi--;
    }
    if (!found) cout << "none" << endl;
    return 0;
}`,
    output: "3 7",
    lines: [
      {
        code: "int lo = 0, hi = (int)v.size() - 1;",
        note_mn: "Хоёр заагч — хамгийн бага ба хамгийн их дээр.",
        note_en: "Two pointers — one on the smallest, one on the largest.",
      },
      {
        code: "if (sum < target) lo++;",
        note_mn:
          "Бага байна — илүү том тоо хэрэгтэй тул зүүн заагчийг баруун тийш.",
        note_en:
          "Too small, so we need a bigger number: move the left pointer right.",
      },
      {
        code: "else hi--;",
        note_mn: "Их байна — багасгах хэрэгтэй тул баруун заагчийг зүүн тийш.",
        note_en:
          "Too big, so we need to shrink it: move the right pointer left.",
      },
      {
        code: "while (lo < hi) {",
        note_mn:
          "`<` — нэг элементийг өөртэй нь хослуулж болохгүй тул `<=` биш.",
        note_en: "`<`, not `<=`: an element must not be paired with itself.",
      },
    ],
    terms: [
      {
        term: "two pointers",
        def_mn: "Хоёр индекс нэг массив дээр зэрэг хөдлөх арга.",
        def_en: "Two indices moving along one array together.",
      },
    ],
    mistakes: [
      {
        wrong: "Эрэмбэлэгдээгүй массив дээр / On an unsorted array",
        fix: "Эхлээд эрэмбэл / Sort it first",
        why_mn: "«Их байвал багасга» гэдэг шийдвэр зөвхөн эрэмбэтэй үед л зөв.",
        why_en:
          '"Too big, shrink it" is only a valid move when the data is ordered.',
      },
      {
        wrong: "while (lo <= hi)",
        fix: "while (lo < hi)",
        why_mn:
          "Тэнцүү болоход хоёр заагч нэг элемент дээр байна. Тэр тоог өөртэй нь нэмэх нь ихэвчлэн буруу.",
        why_en:
          "When they meet both point at the same element, and adding it to itself is usually wrong.",
      },
    ],
    quiz: {
      question_mn: "Нийлбэр нь хэтэрхий ИХ байвал аль заагчийг хөдөлгөх вэ?",
      question_en: "The sum is too BIG. Which pointer moves?",
      choices: [
        "Зүүнийг баруун тийш / The left one, rightwards",
        "Баруунг зүүн тийш / The right one, leftwards",
        "Хоёуланг нь / Both of them",
      ],
      answer: 1,
      explain_mn:
        "Баруун заагч зүүн тийш явахад жижиг тоон дээр очиж нийлбэр буурна.",
      explain_en:
        "Moving the right pointer left lands on a smaller value, bringing the sum down.",
    },
    challenge_mn:
      "Эрэмбэлэгдсэн массиваас нийлбэр нь S болох ХОСУУДЫН тоог ол.",
    challenge_en: "Count how many PAIRS in a sorted array add up to S.",
  },
  {
    slug: "greedy",
    unit: 10,
    title_mn: "Шуналт арга",
    title_en: "Greedy",
    goal_mn:
      "Тухайн агшинд хамгийн сайн санагдахыг сонгох арга, түүний хязгаарыг ойлгох.",
    goal_en:
      "Take the best-looking choice right now — and learn when that fails.",
    intro_mn:
      "Шуналт арга бол «одоо хамгийн сайн харагдаж байгааг нь ав, эргэж бүү бод» гэсэн санаа. Заримдаа энэ нь яг зөв хариу өгдөг, заримдаа огт өгдөггүй. Хамгийн чухал нь: аль тохиолдолд ажилладгийг мэдэх.",
    intro_en:
      "Greedy means: take whatever looks best right now and never look back. Sometimes that gives exactly the right answer. Sometimes it does not. Knowing which is the whole skill.",
    code: `#include <iostream>
#include <vector>
using namespace std;

int coins(int amount, vector<int> values) {
    int used = 0;
    for (int v : values) {
        while (amount >= v) {
            amount = amount - v;
            used++;
        }
    }
    return used;
}

int main() {
    vector<int> mnt = {500, 100, 50, 10};
    cout << coins(680, mnt) << endl;

    // Greedy is NOT always right:
    vector<int> odd = {4, 3, 1};
    cout << coins(6, odd) << endl;   // greedy: 4+1+1 = 3 coins
    cout << "best is 2 (3+3)" << endl;
    return 0;
}`,
    output: "6\n3\nbest is 2 (3+3)",
    lines: [
      {
        code: "for (int v : values) {",
        note_mn:
          "Утгууд ИХЭЭС БАГА руу эрэмбэлэгдсэн байх ёстой. Шуналт арга томоос нь эхэлдэг.",
        note_en:
          "The values must be in order, largest first. Greedy starts from the big ones.",
      },
      {
        code: "while (amount >= v) {",
        note_mn:
          "Энэ дэвсгэртийг багтах чинээгээ ав, дараа нь дараагийнх руу шилж.",
        note_en: "Take as many of this coin as fit, then move to the next.",
      },
      {
        code: "cout << coins(6, odd) << endl;",
        note_mn:
          "4, 3, 1 дэвсгэртээр 6-г шуналтаар: 4 + 1 + 1 = 3 зоос. Гэтэл 3 + 3 = 2 зоос л хэрэгтэй.",
        note_en:
          "With coins 4, 3, 1 greedy makes 6 as 4 + 1 + 1 — three coins. But 3 + 3 needs only two.",
      },
    ],
    terms: [
      {
        term: "greedy",
        def_mn: "Одоогийн хамгийн сайныг сонгож, эргэж эргэлзэхгүй арга.",
        def_en: "Taking the locally best option and never reconsidering.",
      },
      {
        term: "counterexample",
        def_mn: "Аргыг буруу гэдгийг харуулах нэг жишээ. Нэг л хангалттай.",
        def_en: "One example that shows a method is wrong. One is enough.",
      },
    ],
    mistakes: [
      {
        wrong:
          "Шуналт арга үргэлж зөв гэж үзэх / Assuming greedy is always right",
        fix: "Эсрэг жишээ хайх / Hunt for a counterexample",
        why_mn:
          "Монголын дэвсгэрт дээр ажиллана, гэхдээ {4,3,1} дээр ажиллахгүй. Эхлээд гараар хэдэн жишээ шалга.",
        why_en:
          "It works for real money but not for coins {4,3,1}. Test a few small cases by hand first.",
      },
      {
        wrong: "Эрэмбэлэхээ мартах / Forgetting to sort",
        fix: "sort(values.rbegin(), values.rend());",
        why_mn: "Жижигээс нь эхэлбэл шуналт арга огт утгагүй болно.",
        why_en:
          "Starting from the small coins makes the whole idea meaningless.",
      },
    ],
    quiz: {
      question_mn: "Шуналт аргын талаар аль нь ҮНЭН бэ?",
      question_en: "Which statement about greedy is TRUE?",
      choices: [
        "Ямар ч бодлогод хамгийн сайн хариу өгнө / It always gives the best answer",
        "Заримдаа хамгийн сайн хариу өгдөггүй / It sometimes fails to give the best answer",
        "Зөвхөн эрэмбэлэгдсэн өгөгдөл дээр ажиллана / It only works on sorted data",
      ],
      answer: 1,
      explain_mn:
        "Тийм учраас шуналт арга сонгохоосоо өмнө эсрэг жишээ хайх ёстой.",
      explain_en:
        "Which is why you hunt for a counterexample before trusting a greedy idea.",
    },
    challenge_mn:
      "Эхлэх, дуусах цагтай олон арга хэмжээ өгөгдөнө. Хамгийн олныг нь давхцалгүй сонго. Зөвлөгөө: хамгийн ЭРТ дуусахаар нь эрэмбэл.",
    challenge_en:
      "You are given events with start and end times. Choose as many as possible without overlap. Hint: sort by EARLIEST finishing time.",
  },
  {
    slug: "backtracking",
    unit: 10,
    title_mn: "Ухран буцах",
    title_en: "Backtracking",
    goal_mn: "Бүх боломжийг туршиж, буруу замаас буцаж эргэх.",
    goal_en: "Try every possibility, and step back out of the wrong ones.",
    intro_mn:
      "Лабиринт дотор зам хайхтай адил: нэг замаар яв, тэнхэрвэл буцаад өөр замаар оролд. Кодоор бол — сонголт хий, рекурсээр цааш яв, буцаж ирээд тэр сонголтоо БУЦААЖ АВ. Сүүлийн алхам нь хамгийн чухал.",
    intro_en:
      "Like finding your way through a maze: take a path, and if it dead-ends, come back and try another. In code — make a choice, recurse, then UNDO the choice on the way back. That last step is the one people forget.",
    code: `#include <iostream>
#include <vector>
using namespace std;

void permute(vector<int>& v, vector<bool>& used, vector<int>& cur) {
    if (cur.size() == v.size()) {
        for (int x : cur) cout << x;
        cout << " ";
        return;
    }
    for (int i = 0; i < (int)v.size(); i++) {
        if (used[i]) continue;
        used[i] = true;
        cur.push_back(v[i]);

        permute(v, used, cur);

        cur.pop_back();
        used[i] = false;
    }
}

int main() {
    vector<int> v = {1, 2, 3};
    vector<bool> used(3, false);
    vector<int> cur;
    permute(v, used, cur);
    cout << endl;
    return 0;
}`,
    output: "123 132 213 231 312 321",
    lines: [
      {
        code: "if (cur.size() == v.size()) {",
        note_mn:
          "Бүрэн хариу бүрдсэн — хэвлээд буц. Энэ бол рекурсийн зогсох нөхцөл.",
        note_en:
          "A complete answer — print it and return. This is the recursion's stopping case.",
      },
      {
        code: "used[i] = true;",
        note_mn: "Сонголт хийж байна: энэ тоог авлаа гэж тэмдэглэв.",
        note_en: "Making a choice: mark this number as taken.",
      },
      {
        code: "cur.pop_back();",
        note_mn:
          "БУЦААЖ АВЧ БАЙНА. Үүнийг мартвал дараагийн салаа буруу төлөвөөс эхэлнэ.",
        note_en:
          "UNDOING the choice. Forget this and the next branch starts from a wrong state.",
      },
      {
        code: "used[i] = false;",
        note_mn: "Мөн адил буцаана. Сонголт ба буцаалт үргэлж хосоороо явна.",
        note_en: "Undone as well. A choice and its undo always come in a pair.",
      },
    ],
    terms: [
      {
        term: "backtracking",
        def_mn: "Сонго → гүнзгийр → буцааж ав.",
        def_en: "Choose, go deeper, then undo.",
      },
      {
        term: "state",
        def_mn: "Одоогийн байдал. Буцахдаа яг хуучин байдалдаа орох ёстой.",
        def_en: "Where you currently are. Undoing must restore it exactly.",
      },
    ],
    mistakes: [
      {
        wrong: "cur.push_back(v[i]); permute(...);",
        fix: "cur.push_back(v[i]); permute(...); cur.pop_back();",
        why_mn:
          "Буцааж авахгүй бол `cur` улам л уртсаад, хариунууд нь утгагүй болно.",
        why_en:
          "Without the undo, `cur` only ever grows and the answers turn to nonsense.",
      },
      {
        wrong: "n = 20 дээр бүх сэлгэмж / All permutations of 20 items",
        fix: "n ≤ 10 орчимд л / Only for n around 10 or less",
        why_mn:
          "20! нь 2 квинтиллион. Ухран буцах нь бага n дээр л ажиллана — хязгаарыг нь хараарай.",
        why_en:
          "20! is about two quintillion. Backtracking only works for small n — check the limits.",
      },
    ],
    quiz: {
      question_mn: "Ухран буцахад «буцааж авах» алхам яагаад чухал вэ?",
      question_en: "Why does backtracking need the undo step?",
      choices: [
        "Санах ой хэмнэхийн тулд / To save memory",
        "Дараагийн салаа цэвэр төлөвөөс эхлэхийн тулд / So the next branch starts from a clean state",
        "Програмыг хурдасгахын тулд / To make the program faster",
      ],
      answer: 1,
      explain_mn:
        "Буцаахгүй бол өмнөх сонголтууд үлдэж, дараагийн салаа буруу байрнаас эхэлнэ.",
      explain_en:
        "Without it the previous choices linger, and the next branch explores from the wrong place.",
    },
    challenge_mn:
      "1-ээс n хүртэлх тооноос k ширхэгийг сонгох бүх хослолыг хэвлэ.",
    challenge_en: "Print every way of choosing k numbers from 1 to n.",
  },
  {
    slug: "dp-intro",
    unit: 10,
    title_mn: "Динамик програмчлал",
    title_en: "Dynamic Programming",
    goal_mn: "Дахин давтагдах бодолтыг санаж хадгалж, рекурсийг хурдасгах.",
    goal_en: "Remember repeated work instead of doing it again.",
    intro_mn:
      "Фибоначчийг рекурсээр бодоход f(30) нь 1.6 сая гаруй дуудалт хийдэг — учир нь ижил утгыг дахин дахин боддог. Хариултуудаа массивт хадгалж, дахин хэрэгтэй болбол шууд харвал 30 дуудалт л болно. Энэ л бүх динамик програмчлалын үндэс.",
    intro_en:
      "Computing Fibonacci by plain recursion, f(30) makes over 1.6 million calls — because it works out the same values again and again. Store each answer in an array and look it up next time, and it becomes 30 calls. That single idea is all dynamic programming is.",
    code: `#include <iostream>
#include <vector>
using namespace std;

vector<long long> memo;
long long calls = 0;

long long fib(int n) {
    calls++;
    if (n <= 1) return n;
    if (memo[n] != -1) return memo[n];
    memo[n] = fib(n - 1) + fib(n - 2);
    return memo[n];
}

int main() {
    memo.assign(31, -1);
    cout << fib(30) << endl;
    cout << calls << endl;
    return 0;
}`,
    output: "832040\n59",
    lines: [
      {
        code: "memo.assign(31, -1);",
        note_mn:
          "-1 нь «хараахан бодоогүй» гэсэн тэмдэг. Фибоначчийн утга хэзээ ч сөрөг байхгүй тул аюулгүй.",
        note_en:
          '-1 means "not worked out yet". Fibonacci values are never negative, so it is a safe marker.',
      },
      {
        code: "if (memo[n] != -1) return memo[n];",
        note_mn:
          "Өмнө нь бодсон бол шууд буцаана. Энэ ГАНЦ мөр 1.6 сая дуудалтыг 59 болгож байна.",
        note_en:
          "Already known, so return it. This ONE line turns 1.6 million calls into 59.",
      },
      {
        code: "memo[n] = fib(n - 1) + fib(n - 2);",
        note_mn: "Бодоод ХАДГАЛНА. Хадгалахаа мартвал бүх ашиг алга.",
        note_en:
          "Work it out and STORE it. Forget the storing and the gain vanishes.",
      },
      {
        code: "vector<long long> memo;",
        note_mn:
          "`long long` — фибоначчи хурдан өсдөг. f(47) аль хэдийн `int`-ээс хэтэрнэ.",
        note_en:
          "`long long` because Fibonacci grows fast — f(47) already overflows an `int`.",
      },
    ],
    terms: [
      {
        term: "memoization",
        def_mn: "Бодсон хариугаа санаж хадгалах.",
        def_en: "Remembering an answer you already worked out.",
      },
      {
        term: "overlapping subproblems",
        def_mn: "Ижил дэд бодлого олон дахин гарч ирэх. DP-ийн үндсэн болзол.",
        def_en:
          "The same smaller problem coming up many times. The condition DP needs.",
      },
    ],
    mistakes: [
      {
        wrong: "memo-г 0-ээр дүүргэх / Filling the memo with 0",
        fix: "-1 гэх мэт боломжгүй утгаар / Use an impossible value like -1",
        why_mn:
          "0 бол хүчинтэй хариу байж болно. Тэгвэл «бодсон» ба «бодоогүй»-г ялгаж чадахгүй.",
        why_en:
          '0 can be a real answer, so you can no longer tell "known" from "unknown".',
      },
      {
        wrong: "Хадгалаад буцаахаа мартах / Storing but forgetting to return",
        fix: "return memo[n];",
        why_mn: "Хадгалаад буцаахгүй бол функц хог утга буцаана.",
        why_en:
          "Storing without returning leaves the function handing back rubbish.",
      },
    ],
    quiz: {
      question_mn: "Санах ойд хадгалах (memo) юуг өөрчилдөг вэ?",
      question_en: "What does memoising actually change?",
      choices: [
        "Хариуг илүү нарийвчлалтай болгодог / It makes the answer more accurate",
        "Кодыг богиносгодог / It makes the code shorter",
        "Ижил бодолтыг дахин хийхээс сэргийлдэг / It stops the same work being repeated",
      ],
      answer: 2,
      explain_mn: "Хариу нь ижил хэвээр — зөвхөн ажлын хэмжээ асар багасна.",
      explain_en: "The answer is identical. Only the amount of work collapses.",
    },
    challenge_mn:
      "Memo ашиглалгүй fib(30)-ыг бодоод дуудалтыг тоол. Дараа нь memo нэмээд харьцуул.",
    challenge_en:
      "Compute fib(30) without the memo and count the calls. Then add the memo and compare.",
  },
  {
    slug: "dp-1d",
    unit: 10,
    title_mn: "Нэг мөр DP",
    title_en: "One-dimensional DP",
    goal_mn: "Хүснэгтийг зүүнээс баруун тийш дүүргэж хариу гаргах.",
    goal_en: "Fill a table from left to right to reach the answer.",
    intro_mn:
      "Рекурсгүйгээр ч DP хийж болно: хамгийн жижиг тохиолдлоос эхлээд хүснэгтээ дараалан дүүргэнэ. Шат өөд гарах бодлого сонгодог жишээ — нэг алхамд 1 эсвэл 2 шат гарч болно, n шатанд хэдэн янзаар гарах вэ?",
    intro_en:
      "You can do DP without recursion: start from the smallest case and fill a table in order. Climbing stairs is the classic — you take 1 or 2 steps at a time, so in how many ways can you climb n stairs?",
    code: `#include <iostream>
#include <vector>
using namespace std;

int main() {
    int n = 6;
    vector<long long> ways(n + 1, 0);

    ways[0] = 1;
    ways[1] = 1;
    for (int i = 2; i <= n; i++) {
        ways[i] = ways[i - 1] + ways[i - 2];
    }

    for (int i = 0; i <= n; i++) cout << ways[i] << " ";
    cout << endl;
    cout << ways[n] << endl;
    return 0;
}`,
    output: "1 1 2 3 5 8 13 \n13",
    lines: [
      {
        code: "ways[0] = 1;",
        note_mn:
          "Хамгийн жижиг тохиолдол: 0 шат гарахад «юу ч хийхгүй» гэсэн нэг л арга бий.",
        note_en:
          "The smallest case: there is exactly one way to climb no stairs — do nothing.",
      },
      {
        code: "ways[i] = ways[i - 1] + ways[i - 2];",
        note_mn:
          "i-р шатанд ирэхийн тулд i-1 эсвэл i-2-оос үсэрсэн байна. Тэдгээрийн аргууд нэмэгдэнэ.",
        note_en:
          "To be on stair i you came from i-1 or i-2, so the ways add together.",
      },
      {
        code: "for (int i = 2; i <= n; i++) {",
        note_mn:
          "Зүүнээс баруун тийш. Хэрэгтэй утгууд аль хэдийн бодогдсон байна.",
        note_en:
          "Left to right, so the values you need are already worked out.",
      },
    ],
    terms: [
      {
        term: "bottom-up",
        def_mn: "Жижигээс нь эхэлж хүснэгт дүүргэх арга.",
        def_en: "Filling the table from the smallest case upwards.",
      },
      {
        term: "recurrence",
        def_mn: "Нэг нүдийг өмнөх нүднүүдээр илэрхийлсэн дүрэм.",
        def_en: "The rule that builds one cell from earlier cells.",
      },
    ],
    mistakes: [
      {
        wrong: "ways[0]-ыг тохируулахгүй орхих / Leaving ways[0] unset",
        fix: "ways[0] = 1;",
        why_mn:
          "Суурь утгууд буруу бол хүснэгт бүхэлдээ буруу болно. Хамгийн түгээмэл DP-ийн алдаа.",
        why_en:
          "Wrong starting values poison the whole table. The most common DP mistake there is.",
      },
      {
        wrong: "for (int i = n; i >= 2; i--)",
        fix: "for (int i = 2; i <= n; i++)",
        why_mn: "Буруу чиглэлд явбал `ways[i-1]` хараахан бодогдоогүй байна.",
        why_en: "Going the wrong way, `ways[i-1]` has not been worked out yet.",
      },
    ],
    quiz: {
      question_mn: "DP хүснэгтийг дүүргэх дараалал яагаад чухал вэ?",
      question_en: "Why does the order of filling a DP table matter?",
      choices: [
        "Хэрэгтэй нүд нь өмнө нь бодогдсон байх ёстой / The cells you rely on must already be filled",
        "Санах ой хэмнэхийн тулд / To save memory",
        "Хүснэгт эрэмбэлэгдсэн байх ёстой / The table has to end up sorted",
      ],
      answer: 0,
      explain_mn:
        "Нэг нүд өмнөх нүднүүдээс хамаардаг тул тэднийг эхэлж бодох ёстой.",
      explain_en:
        "A cell is built from earlier cells, so those must be computed first.",
    },
    challenge_mn:
      "Шат бүрд торгууль байна. n шат гарахад хамгийн бага нийт торгуулийг ол.",
    challenge_en:
      "Each stair has a cost. Find the cheapest total cost to climb n stairs.",
  },
  {
    slug: "dp-grid",
    unit: 10,
    title_mn: "Хүснэгт дээрх DP",
    title_en: "DP on a Grid",
    goal_mn: "Хоёр хэмжээст хүснэгт дээр зам тоолох.",
    goal_en: "Count paths across a two-dimensional grid.",
    intro_mn:
      "Зөвхөн БАРУУН эсвэл ДООШ явж болох хүснэгтийн зүүн дээд булангаас баруун доод булан руу хэдэн зам байх вэ? Нэг мөр DP-ийн яг тэр санаа, зөвхөн хоёр хэмжээст болсон: нүд бүрд зүүн талаас нь эсвэл дээрээс нь ирнэ.",
    intro_en:
      "Moving only RIGHT or DOWN, how many paths cross a grid from the top-left to the bottom-right? It is the same idea as one-dimensional DP with one more dimension: you reach a cell either from the left or from above.",
    code: `#include <iostream>
#include <vector>
using namespace std;

int main() {
    int rows = 3, cols = 4;
    vector<vector<long long>> paths(rows, vector<long long>(cols, 0));

    for (int r = 0; r < rows; r++) {
        for (int c = 0; c < cols; c++) {
            if (r == 0 && c == 0) {
                paths[r][c] = 1;
            } else {
                long long fromUp = (r > 0) ? paths[r - 1][c] : 0;
                long long fromLeft = (c > 0) ? paths[r][c - 1] : 0;
                paths[r][c] = fromUp + fromLeft;
            }
        }
    }

    for (int r = 0; r < rows; r++) {
        for (int c = 0; c < cols; c++) cout << paths[r][c] << " ";
        cout << endl;
    }
    return 0;
}`,
    output: "1 1 1 1 \n1 2 3 4 \n1 3 6 10",
    lines: [
      {
        code: "paths[r][c] = 1;",
        note_mn: "Эхлэл нүд. Тэнд очих ганцхан «зам» бий — хөдлөхгүй байх.",
        note_en:
          "The starting cell. There is exactly one way to be there: don't move.",
      },
      {
        code: "long long fromUp = (r > 0) ? paths[r - 1][c] : 0;",
        note_mn:
          "Эхний мөрөнд дээрээс ирэх зам байхгүй тул 0. Хязгаарыг ингэж шалгана.",
        note_en:
          "On the first row nothing comes from above, so 0. This is how you guard the edges.",
      },
      {
        code: "paths[r][c] = fromUp + fromLeft;",
        note_mn: "Хоёр л зам бий — дээрээс эсвэл зүүнээс. Тэднийг нэмнэ.",
        note_en: "Only two ways in — from above or from the left. Add them.",
      },
      {
        code: "for (int r = 0; r < rows; r++) {",
        note_mn:
          "Мөр мөрөөр нь дээрээс доош. Хэрэгтэй нүднүүд аль хэдийн бэлэн болсон байна.",
        note_en:
          "Row by row from the top, so the cells you need are already done.",
      },
    ],
    terms: [
      {
        term: "grid DP",
        def_mn: "Хоёр хэмжээст хүснэгт дээрх динамик програмчлал.",
        def_en: "Dynamic programming across a two-dimensional table.",
      },
      {
        term: "boundary",
        def_mn: "Эхний мөр, эхний багана — тусад нь шалгах ёстой хэсэг.",
        def_en: "The first row and column — the parts needing their own check.",
      },
    ],
    mistakes: [
      {
        wrong: "paths[r-1][c] -г шалгалтгүй / Reading paths[r-1][c] unguarded",
        fix: "(r > 0) ? paths[r - 1][c] : 0",
        why_mn:
          "r = 0 үед `paths[-1]` нь массиваас гарна. Алдаа заахгүй, хог утга авна.",
        why_en:
          "At r = 0 that reads `paths[-1]`, outside the grid. No error — just rubbish.",
      },
      {
        wrong: "vector<vector<int>>",
        fix: "vector<vector<long long>>",
        why_mn:
          "Замын тоо маш хурдан өснө. 20×20 хүснэгт дээр аль хэдийн `int` хэтэрнэ.",
        why_en:
          "Path counts explode. On a 20×20 grid an `int` has already overflowed.",
      },
    ],
    quiz: {
      question_mn:
        "Зөвхөн баруун ба доош явж болох 2×2 хүснэгтэд хэдэн зам байх вэ?",
      question_en:
        "Moving only right and down, how many paths cross a 2×2 grid?",
      choices: ["4 / 4", "2 / 2", "3 / 3"],
      answer: 1,
      explain_mn: "Баруун-доош, эсвэл доош-баруун. Ердөө хоёр.",
      explain_en: "Right then down, or down then right. Just two.",
    },
    challenge_mn:
      "Зарим нүдэнд хана байна (тэнд орж болохгүй). Хана тойрсон замын тоог ол.",
    challenge_en:
      "Some cells are walls you cannot enter. Count the paths that avoid them.",
  },
  {
    slug: "graphs-intro",
    unit: 11,
    title_mn: "Граф гэж юу вэ",
    title_en: "What a Graph Is",
    goal_mn: "Цэг ба холбоосыг зэргэлдээх жагсаалтаар кодонд оруулах.",
    goal_en: "Put nodes and edges into code as an adjacency list.",
    intro_mn:
      "Граф бол цэгүүд (хот, хүн, нүд) ба тэдгээрийн хоорондох холбоос (зам, найзын холбоо) юм. Зурагтай нь ойлгоход амархан, кодонд оруулахад бага зэрэг бодох хэрэгтэй. Хамгийн түгээмэл арга нь: цэг бүрд хэнтэй холбоотойг нь жагсаах.",
    intro_en:
      "A graph is a set of nodes — cities, people, cells — and the links between them: roads, friendships. It is easy to picture and takes a moment to encode. The usual way: for each node, list who it connects to.",
    code: `#include <iostream>
#include <vector>
using namespace std;

int main() {
    int n = 5;
    vector<vector<int>> adj(n);

    // undirected edges
    adj[0].push_back(1); adj[1].push_back(0);
    adj[0].push_back(2); adj[2].push_back(0);
    adj[1].push_back(3); adj[3].push_back(1);

    for (int v = 0; v < n; v++) {
        cout << v << ":";
        for (int to : adj[v]) cout << " " << to;
        cout << endl;
    }
    return 0;
}`,
    output: "0: 1 2\n1: 0 3\n2: 0\n3: 1\n4:",
    lines: [
      {
        code: "vector<vector<int>> adj(n);",
        note_mn: "Цэг бүрд нэг жагсаалт. `adj[3]` бол 3-р цэгийн хөршүүд.",
        note_en: "One list per node. `adj[3]` holds the neighbours of node 3.",
      },
      {
        code: "adj[0].push_back(1); adj[1].push_back(0);",
        note_mn:
          "Чиглэлгүй холбоосыг ХОЁР ТАЛД нь бичнэ. Нэг талыг нь мартах нь маш түгээмэл алдаа.",
        note_en:
          "An undirected edge is written on BOTH sides. Forgetting one is a very common bug.",
      },
      {
        code: 'for (int to : adj[v]) cout << " " << to;',
        note_mn:
          "Цэгийн хөршүүдээр явна. Граф дээрх бараг бүх алгоритм ингэж эхэлдэг.",
        note_en:
          "Walk a node's neighbours. Nearly every graph algorithm starts like this.",
      },
      {
        code: 'cout << v << ":";',
        note_mn: "4-р цэг хоосон — холбоосгүй цэг бас байж болно.",
        note_en:
          "Node 4 prints empty — a node with no edges is perfectly legal.",
      },
    ],
    terms: [
      {
        term: "node (vertex)",
        def_mn: "Графын нэг цэг.",
        def_en: "One point in the graph.",
      },
      {
        term: "edge",
        def_mn: "Хоёр цэгийг холбосон холбоос.",
        def_en: "A link joining two nodes.",
      },
      {
        term: "adjacency list",
        def_mn: "Цэг бүрд хөршүүдийг нь жагсаасан бүтэц.",
        def_en: "The structure listing each node's neighbours.",
      },
    ],
    mistakes: [
      {
        wrong: "adj[a].push_back(b);",
        fix: "adj[a].push_back(b); adj[b].push_back(a);",
        why_mn:
          "Чиглэлгүй граф дээр нэг талыг нь бичвэл зам нэг зүгт л явна. Хайлт хагас граф олно.",
        why_en:
          "On an undirected graph, writing one side makes the road one-way. Searches then find only half of it.",
      },
      {
        wrong: "vector<vector<int>> adj; adj[0].push_back(1);",
        fix: "vector<vector<int>> adj(n);",
        why_mn: "Хэмжээг нь өгөхгүй бол `adj[0]` гэж байхгүй. Програм сүйрнэ.",
        why_en:
          "Without a size there is no `adj[0]` at all, and the program crashes.",
      },
    ],
    quiz: {
      question_mn: "Чиглэлгүй граф дээр a—b холбоосыг хэрхэн бичих вэ?",
      question_en: "How do you record an undirected edge a—b?",
      choices: [
        "Зөвхөн adj[a]-д b / Only b in adj[a]",
        "adj[a]-д b, adj[b]-д a / b in adj[a] and a in adj[b]",
        "Тусдаа жагсаалтад / In a separate list of its own",
      ],
      answer: 1,
      explain_mn: "Хоёр талаас нь явж болох тул хоёуланд нь бичих ёстой.",
      explain_en:
        "You can travel it in both directions, so it is written on both sides.",
    },
    challenge_mn:
      "n цэг, m холбоос уншаад цэг бүрийн зэргийг (хэдэн холбоостойг) хэвлэ.",
    challenge_en:
      "Read n nodes and m edges, then print the degree of each node — how many edges it has.",
  },
  {
    slug: "dfs",
    unit: 11,
    title_mn: "Гүнзгий хайлт",
    title_en: "Depth-First Search",
    goal_mn: "Графыг рекурсээр тойрч, холбоотой хэсгүүдийг тоолох.",
    goal_en: "Walk a graph recursively and count its connected pieces.",
    intro_mn:
      "Гүнзгий хайлт бол «болтол нь урагшаа яв, тэнхэрвэл буц» гэсэн санаа — яг лабиринт дотор нэг гараа ханан дээр тавиад явахтай адил. Рекурсээр бичихэд маш богино. Ганц зүйлийг мартаж болохгүй: очсон цэгээ ТЭМДЭГЛЭ.",
    intro_en:
      "Depth-first search means: go forward as far as you can, and back up when you cannot — like walking a maze with one hand on the wall. Written recursively it is very short. One thing you must not forget: MARK where you have been.",
    code: `#include <iostream>
#include <vector>
using namespace std;

vector<vector<int>> adj;
vector<bool> seen;

void dfs(int v) {
    seen[v] = true;
    for (int to : adj[v]) {
        if (!seen[to]) {
            dfs(to);
        }
    }
}

int main() {
    int n = 6;
    adj.assign(n, {});
    seen.assign(n, false);

    adj[0].push_back(1); adj[1].push_back(0);
    adj[1].push_back(2); adj[2].push_back(1);
    adj[3].push_back(4); adj[4].push_back(3);

    int groups = 0;
    for (int v = 0; v < n; v++) {
        if (!seen[v]) {
            groups++;
            dfs(v);
        }
    }
    cout << groups << endl;
    return 0;
}`,
    output: "3",
    lines: [
      {
        code: "seen[v] = true;",
        note_mn:
          "ХАМГИЙН ЭХЭНД тэмдэглэнэ. Үүнгүй бол мөчлөгтэй граф дээр хязгааргүй эргэлдэнэ.",
        note_en:
          "Mark it FIRST. Without this, a graph with a cycle loops forever.",
      },
      {
        code: "if (!seen[to]) {",
        note_mn:
          "Зөвхөн очоогүй хөрш рүү явна. Тийм учраас цэг бүр ганц удаа боловсруулагдана.",
        note_en:
          "Only visit a neighbour you have not seen. That is what makes each node handled once.",
      },
      {
        code: "if (!seen[v]) { groups++; dfs(v); }",
        note_mn:
          "Шинэ эхлэл цэг олдвол шинэ бүлэг. 0-1-2 нэг бүлэг, 3-4 нэг, 5 ганцаараа — нийт 3.",
        note_en:
          "A fresh starting point means a new group. 0-1-2, then 3-4, then 5 alone — three in all.",
      },
      {
        code: "adj.assign(n, {});",
        note_mn: "n ширхэг хоосон жагсаалт үүсгэнэ.",
        note_en: "Creates n empty neighbour lists.",
      },
    ],
    terms: [
      {
        term: "DFS",
        def_mn: "Гүн рүү нь эхлээд явдаг хайлт.",
        def_en: "A search that goes deep before it goes wide.",
      },
      {
        term: "connected component",
        def_mn: "Хоорондоо хүрч болох цэгүүдийн бүлэг.",
        def_en: "A group of nodes that can all reach each other.",
      },
    ],
    mistakes: [
      {
        wrong: "dfs дуудсаны ДАРАА тэмдэглэх / Marking AFTER the dfs call",
        fix: "Функцийн эхэнд тэмдэглэх / Mark at the top of the function",
        why_mn:
          "Хожуу тэмдэглэвэл мөчлөг дээр ижил цэг рүү дахин орж, стек дүүрч сүйрнэ.",
        why_en:
          "Marking late lets a cycle re-enter the same node until the stack overflows.",
      },
      {
        wrong: "10^6 цэг дээр рекурсив DFS / Recursive DFS on 10^6 nodes",
        fix: "Стектэй давталттай хувилбар / An iterative version with a stack",
        why_mn:
          "Рекурсийн гүн хэтэрвэл програм сүйрнэ. Жижиг граф дээр л рекурс аюулгүй.",
        why_en:
          "Too much recursion depth crashes the program. Recursive DFS is safe only on smaller graphs.",
      },
    ],
    quiz: {
      question_mn: "DFS дээр `seen` массив юунаас сэргийлдэг вэ?",
      question_en: "What does the `seen` array prevent in DFS?",
      choices: [
        "Санах ой их зарцуулахаас / Using too much memory",
        "Ижил цэг рүү дахин орж хязгааргүй эргэлдэхээс / Re-entering a node and looping forever",
        "Буруу хариу гарахаас / An arithmetic mistake",
      ],
      answer: 1,
      explain_mn:
        "Мөчлөгтэй граф дээр тэмдэглэлгүй бол хоёр цэгийн хооронд эцэс төгсгөлгүй үсэрнэ.",
      explain_en:
        "In a graph with a cycle, without marking you bounce between two nodes forever.",
    },
    challenge_mn: "Хамгийн том холбоотой бүлэгт хэдэн цэг байгааг ол.",
    challenge_en: "Find how many nodes are in the largest connected group.",
  },
  {
    slug: "bfs",
    unit: 11,
    title_mn: "Өргөн хайлт",
    title_en: "Breadth-First Search",
    goal_mn: "Дараалал ашиглан хамгийн богино замын уртыг олох.",
    goal_en: "Use a queue to find the length of the shortest path.",
    intro_mn:
      "Өргөн хайлт нь ойрын цэгүүдийг бүгдийг нь эхэлж үзээд, дараа нь нэг алхам хол руу шилждэг. Яг үүнээс болж ГАЙХАЛТАЙ шинж чанар үүсдэг: жин ижил байх үед BFS хамгийн богино замыг олдог. Тийм учраас хүснэгт дээрх бодлогуудад хамгийн их хэрэглэгддэг.",
    intro_en:
      "Breadth-first search looks at everything one step away, then everything two steps away. That gives it a remarkable property: when every move costs the same, BFS finds the SHORTEST path. It is the workhorse of grid problems for exactly that reason.",
    code: `#include <iostream>
#include <vector>
#include <queue>
using namespace std;

int main() {
    int rows = 3, cols = 4;
    vector<vector<int>> dist(rows, vector<int>(cols, -1));

    queue<pair<int,int>> q;
    dist[0][0] = 0;
    q.push({0, 0});

    int dr[4] = {-1, 1, 0, 0};
    int dc[4] = {0, 0, -1, 1};

    while (!q.empty()) {
        pair<int,int> cell = q.front();
        q.pop();
        int r = cell.first, c = cell.second;
        for (int k = 0; k < 4; k++) {
            int nr = r + dr[k], nc = c + dc[k];
            if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;
            if (dist[nr][nc] != -1) continue;
            dist[nr][nc] = dist[r][c] + 1;
            q.push({nr, nc});
        }
    }

    cout << dist[2][3] << endl;
    return 0;
}`,
    output: "5",
    lines: [
      {
        code: "dist[0][0] = 0;",
        note_mn:
          "Эхлэл цэг хүртэлх зай 0. `dist` нь зайг хадгалахаас гадна «очсон уу» гэдгийг бас хэлнэ.",
        note_en:
          "Zero steps to the start. `dist` doubles as the visited marker.",
      },
      {
        code: "int dr[4] = {-1, 1, 0, 0};",
        note_mn:
          "Дөрвөн чиглэл: дээш, доош, зүүн, баруун. `dc` -тэй хосоороо уншина.",
        note_en:
          "The four directions: up, down, left, right. Read together with `dc`.",
      },
      {
        code: "if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;",
        note_mn:
          "Хүснэгтээс гарсан эсэхийг ЭХЛЭЭД шалгана. Дараалал нь эсрэг байвал массиваас гадуур уншина.",
        note_en:
          "Check you are still inside FIRST. The other order reads outside the grid.",
      },
      {
        code: "dist[nr][nc] = dist[r][c] + 1;",
        note_mn:
          "Нэг алхам нэмэгдэнэ. Тэмдэглэхийг дараалалд хийхтэй ЗЭРЭГ хий — эс бөгөөс нэг нүд олон удаа орно.",
        note_en:
          "One more step. Mark it at the same moment you queue it, or a cell gets added many times.",
      },
    ],
    terms: [
      {
        term: "BFS",
        def_mn: "Ойрын цэгүүдийг эхэлж үздэг хайлт. Дараалал ашиглана.",
        def_en: "A search that visits nearby nodes first, using a queue.",
      },
      {
        term: "shortest path",
        def_mn:
          "Хамгийн цөөн алхамтай зам. Жин ижил үед BFS үүнийг баталгаатай олно.",
        def_en:
          "The fewest-steps route. When every step costs the same, BFS is guaranteed to find it.",
      },
    ],
    mistakes: [
      {
        wrong: "Дараалалаас ГАРГАХ үед тэмдэглэх / Marking when you POP",
        fix: "Дараалалд ХИЙХ үед тэмдэглэх / Mark when you PUSH",
        why_mn:
          "Хожуу тэмдэглэвэл нэг нүд олон удаа дараалалд орж, ажил хэд дахин нэмэгдэнэ.",
        why_en:
          "Marking on the way out lets one cell enter the queue many times, multiplying the work.",
      },
      {
        wrong:
          "stack ашиглаад BFS гэж нэрлэх / Calling it BFS while using a stack",
        fix: "queue ашиглах / Use a queue",
        why_mn:
          "Стек бол DFS. Дараалал л «ойроос эхлэх» шинжийг өгдөг бөгөөд богино замын баталгаа тэндээс гардаг.",
        why_en:
          "A stack gives you DFS. Only a queue gives the nearest-first order, and that is where the shortest-path guarantee comes from.",
      },
    ],
    quiz: {
      question_mn: "BFS хамгийн богино замыг хэзээ баталгаатай олох вэ?",
      question_en: "When is BFS guaranteed to find the shortest path?",
      choices: [
        "Алхам бүр ижил зардалтай үед / When every step costs the same",
        "Граф жижиг үед / When the graph is small",
        "Үргэлж / Always, without exception",
      ],
      answer: 0,
      explain_mn:
        "Холбоос өөр өөр жинтэй бол BFS хангалтгүй — Дейкстра хэрэгтэй болно.",
      explain_en:
        "With different edge weights BFS is not enough — you need Dijkstra.",
    },
    challenge_mn:
      "Хана бүхий лабиринт өгөгдөнө. Эхлэлээс төгсгөл хүртэлх хамгийн богино замыг ол. Хүрэхгүй бол -1.",
    challenge_en:
      "Given a maze with walls, find the shortest route from start to finish. Print -1 if it cannot be reached.",
  },
  {
    slug: "dijkstra",
    unit: 11,
    title_mn: "Хамгийн богино зам (жинтэй)",
    title_en: "Shortest Path with Weights",
    goal_mn: "Холбоос бүр өөр зардалтай үед хамгийн богино замыг олох.",
    goal_en: "Find the cheapest route when edges cost different amounts.",
    intro_mn:
      "Энэ бол хүнд сэдэв — BFS болон эрэмбэтэй дараалал хоёрыг сайн ойлгосны дараа унш. Зам бүр өөр урттай бол «хамгийн цөөн холбоос» нь хамгийн богино гэсэн үг биш. Дейкстрагийн алгоритм нь хамгийн ойрын цэгийг байнга сонгож, түүгээр дамжсан замуудыг шинэчилдэг.",
    intro_en:
      "This one is hard — read it after you are comfortable with BFS and the priority queue. When roads have different lengths, fewest-roads no longer means shortest. Dijkstra's algorithm repeatedly takes the nearest unfinished node and improves the routes through it.",
    code: `#include <iostream>
#include <vector>
#include <queue>
using namespace std;

int main() {
    int n = 4;
    vector<vector<pair<int,int>>> adj(n);
    // adj[from] = list of (to, cost)
    adj[0].push_back({1, 1});
    adj[0].push_back({2, 8});
    adj[1].push_back({2, 2});
    adj[2].push_back({3, 3});

    vector<int> dist(n, 1000000000);
    dist[0] = 0;

    priority_queue<pair<int,int>, vector<pair<int,int>>, greater<pair<int,int>>> pq;
    pq.push({0, 0});

    while (!pq.empty()) {
        pair<int,int> top = pq.top();
        pq.pop();
        int d = top.first, v = top.second;
        if (d > dist[v]) continue;
        for (pair<int,int> e : adj[v]) {
            int to = e.first, cost = e.second;
            if (dist[v] + cost < dist[to]) {
                dist[to] = dist[v] + cost;
                pq.push({dist[to], to});
            }
        }
    }

    cout << dist[3] << endl;
    return 0;
}`,
    output: "6",
    lines: [
      {
        code: "vector<int> dist(n, 1000000000);",
        note_mn:
          "«Хараахан хүрээгүй» гэдгийг маш том тоогоор илэрхийлнэ. INT_MAX хэрэглэвэл нэмэхэд хэтэрч болно.",
        note_en:
          'A huge number stands for "not reached yet". Using INT_MAX risks overflow when you add to it.',
      },
      {
        code: "pq.push({0, 0});",
        note_mn:
          "Хосын ЭХНИЙ утга нь зай. Эрэмбэтэй дараалал эхний утгаар нь эрэмбэлдэг тул ингэж бичнэ.",
        note_en:
          "Distance goes FIRST in the pair, because the priority queue orders on the first value.",
      },
      {
        code: "if (d > dist[v]) continue;",
        note_mn:
          "Хуучирсан бичлэг. Илүү сайн зам аль хэдийн олдсон тул алгасна.",
        note_en:
          "A stale entry — a better route was already found, so skip it.",
      },
      {
        code: "if (dist[v] + cost < dist[to]) {",
        note_mn:
          "v-ээр дамжвал богино болох уу? Болвол шинэчилнэ. Үүнийг «сулруулах» гэдэг.",
        note_en:
          "Is going via v shorter? Then improve it. This step is called relaxing an edge.",
      },
    ],
    terms: [
      {
        term: "weighted edge",
        def_mn: "Зардалтай холбоос — урт, цаг, төлбөр.",
        def_en: "An edge with a cost — a length, a time, a price.",
      },
      {
        term: "relaxation",
        def_mn: "Илүү богино зам олдвол зайг шинэчлэх алхам.",
        def_en: "Updating a distance when a shorter route appears.",
      },
    ],
    mistakes: [
      {
        wrong:
          "Сөрөг жинтэй холбоос дээр Дейкстра / Dijkstra with a negative edge",
        fix: "Өөр алгоритм хэрэгтэй / A different algorithm is needed",
        why_mn:
          "Дейкстра «нэг удаа шийдсэн цэгийг дахин хөндөхгүй» гэж таамагладаг. Сөрөг жин үүнийг эвдэнэ.",
        why_en:
          "Dijkstra assumes a finished node stays finished. A negative edge breaks that assumption.",
      },
      {
        wrong: "pq.push({to, dist[to]});",
        fix: "pq.push({dist[to], to});",
        why_mn:
          "Дараалал эхний утгаар эрэмбэлдэг. Солиод бичвэл цэгийн дугаараар эрэмбэлж, алгоритм утгагүй болно.",
        why_en:
          "The queue orders on the first value. Swapped, it sorts by node number and the algorithm means nothing.",
      },
    ],
    quiz: {
      question_mn: "Дейкстрагийн хосын эхний утга яагаад зай байх ёстой вэ?",
      question_en: "Why must distance be the first value in Dijkstra's pair?",
      choices: [
        "Уншихад амар / It is easier to read",
        "Эрэмбэтэй дараалал эхний утгаар эрэмбэлдэг тул / Because the priority queue orders on the first value",
        "Санах ой хэмнэдэг / It saves memory",
      ],
      answer: 1,
      explain_mn:
        "Хамгийн ойрыг эхэлж авах ёстой. Эхний утга нь зай биш бол дараалал буруу зүйлээр эрэмбэлнэ.",
      explain_en:
        "You must always take the nearest node next. If distance is not first, the queue orders by the wrong thing.",
    },
    challenge_mn:
      "n хот, m зам өгөгдөнө. 1-р хотоос бусад бүх хот хүртэлх хамгийн богино зайг хэвлэ.",
    challenge_en:
      "Given n cities and m roads, print the shortest distance from city 1 to every other city.",
  },
  {
    slug: "classes",
    unit: 12,
    title_mn: "Класс ба обьект",
    title_en: "Classes and Objects",
    goal_mn: "Дүрэмтэй бүтэц үүсгэж, дотоод өгөгдлөө хамгаалах.",
    goal_en: "Build a structure with rules that protects its own data.",
    intro_mn:
      "Класс бол дүрэмтэй бүтэц. `struct`-д хэн ч дурын утга оноож болно — оноог -50 болгож болно. Класст өгөгдлөө нуувал зөвхөн зөвшөөрсөн замаар л өөрчлөгдөнө. Бодлого бодоход `struct` ихэвчлэн хангалттай; энэ хичээл нь Cambridge шалгалт болон дараагийн хоёр хичээлийн суурь.",
    intro_en:
      "A class is a struct with rules. Anyone can put anything in a `struct` — including a score of -50. Hiding the data in a class means it only changes through the routes you allow. For contest problems a `struct` is usually enough; this lesson is here for the Cambridge syllabus and for the two lessons that follow.",
    code: `#include <iostream>
#include <string>
using namespace std;

class Student {
private:
    string name;
    int score;

public:
    void set(string n, int s) {
        name = n;
        if (s < 0) s = 0;
        if (s > 100) s = 100;
        score = s;
    }
    int get() {
        return score;
    }
};

int main() {
    Student a;
    a.set("Bat", 150);
    cout << a.get() << endl;

    a.set("Bat", 72);
    cout << a.get() << endl;
    return 0;
}`,
    output: "100\n72",
    lines: [
      {
        code: "private:",
        note_mn:
          "Эндээс доош бичсэн зүйлд ГАДНААС хандаж болохгүй. `a.score` гэвэл компилятор татгалзана.",
        note_en:
          "Everything below this is off limits from OUTSIDE. Writing `a.score` is refused by the compiler.",
      },
      {
        code: "public:",
        note_mn: "Эндээс доош нь гаднаас дуудаж болно.",
        note_en: "Everything below this can be called from outside.",
      },
      {
        code: "if (s > 100) s = 100;",
        note_mn:
          "Энэ бол дүрэм. `struct` дээр ийм хамгаалалт байхгүй тул 150 шууд орно.",
        note_en:
          "This is the rule. A `struct` has no such guard, so 150 would go straight in.",
      },
      {
        code: "class Student {",
        note_mn:
          "`class` -ын гишүүд анхдагчаараа хаалттай. `struct` -ынх нээлттэй. Ялгаа нь ердөө энэ.",
        note_en:
          "A `class` starts private, a `struct` starts public. That is the entire difference.",
      },
    ],
    terms: [
      {
        term: "private",
        def_mn: "Зөвхөн класс дотроос хандах боломжтой.",
        def_en: "Reachable only from inside the class.",
      },
      {
        term: "public",
        def_mn: "Гаднаас хандаж болно.",
        def_en: "Reachable from outside.",
      },
      {
        term: "encapsulation",
        def_mn: "Өгөгдлөө нууж, зөвхөн зөвшөөрсөн замаар өөрчлүүлэх зарчим.",
        def_en: "Hiding data so it can only change through routes you approve.",
      },
    ],
    mistakes: [
      {
        wrong: 'class Student { string name; }; ... s.name = "Bat";',
        fix: "public: гэж бичих / Add public:, or use a struct",
        why_mn:
          "`class` анхдагчаараа хаалттай тул энэ нь компиляцын алдаа өгнө. `struct` дээр ажиллаж байсан код энд ажиллахгүй.",
        why_en:
          "A `class` is private by default, so this fails to compile. Code that worked on a `struct` will not work here.",
      },
      {
        wrong: "Бүх зүйлийг класс болгох / Making everything a class",
        fix: "Ихэнхдээ struct хангалттай / A struct is usually enough",
        why_mn:
          "Тэмцээнд хурд чухал. Хамгаалалт хэрэггүй үед `struct` богино бөгөөд ойлгомжтой.",
        why_en:
          "In a contest speed matters. Where you do not need the guard, a `struct` is shorter and clearer.",
      },
    ],
    quiz: {
      question_mn: "`class` ба `struct`-ийн үндсэн ялгаа юу вэ?",
      question_en: "What is the basic difference between `class` and `struct`?",
      choices: [
        "class нь функц агуулж чадна, struct чадахгүй / A class can hold functions, a struct cannot",
        "class нь илүү хурдан / A class is faster",
        "class нь анхдагчаараа хаалттай, struct нээлттэй / A class starts private, a struct starts public",
      ],
      answer: 2,
      explain_mn:
        "`struct` бас функц агуулж чадна. Ялгаа нь зөвхөн анхдагч хандалт.",
      explain_en:
        "A `struct` can hold functions too. The only difference is the default access.",
    },
    challenge_mn:
      "Дансны үлдэгдэл хадгалдаг класс бич. Мөнгө татахдаа үлдэгдлээс хэтэрвэл татгалзаж, үлдэгдлийг өөрчлөхгүй байг.",
    challenge_en:
      "Write a class holding a bank balance. Withdrawing more than the balance must be refused, leaving the balance unchanged.",
  },
  {
    slug: "class-methods",
    unit: 12,
    title_mn: "Метод ба байгуулагч",
    title_en: "Methods and Constructors",
    goal_mn:
      "Классын дотор функц бичих, обьектыг үүсэх үед нь зөв утгатай болгох.",
    goal_en:
      "Write functions inside a class, and make an object valid the moment it is created.",
    intro_mn:
      "Классын дотор бичсэн функцийг метод гэнэ — тэр нь өөрийн обьектын өгөгдөлд шууд ханддаг. Байгуулагч бол обьект үүсэх үед автоматаар ажилладаг онцгой метод. Түүний ач холбогдол нь: «утга оноохоо мартсан» гэсэн алдаа гарах боломжгүй болно.",
    intro_en:
      'A function written inside a class is a method — it reaches its own object\'s data directly. A constructor is a special method that runs automatically when the object is created. Its value: "I forgot to fill that in" stops being possible.',
    code: `#include <iostream>
#include <string>
using namespace std;

class Rect {
private:
    int w, h;

public:
    Rect(int width, int height) {
        w = width;
        h = height;
    }
    int area() {
        return w * h;
    }
    int perimeter() {
        return 2 * (w + h);
    }
};

int main() {
    Rect r(3, 4);
    cout << r.area() << endl;
    cout << r.perimeter() << endl;

    Rect small(2, 2);
    cout << small.area() << endl;
    return 0;
}`,
    output: "12\n14\n4",
    lines: [
      {
        code: "Rect(int width, int height) {",
        note_mn:
          "Байгуулагч. Нэр нь классын нэртэй ЯГ адилхан, буцаах төрөлгүй.",
        note_en:
          "The constructor. Its name matches the class exactly, and it has no return type.",
      },
      {
        code: "Rect r(3, 4);",
        note_mn:
          "Обьект үүсэхэд байгуулагч шууд ажиллана. `w` ба `h` хоосон үлдэх боломжгүй.",
        note_en:
          "Creating the object runs the constructor. `w` and `h` cannot be left empty.",
      },
      {
        code: "int area() {",
        note_mn:
          "Метод. `w`, `h`-г аргументаар авах шаардлагагүй — өөрийнх нь өгөгдөл.",
        note_en:
          "A method. It needs no arguments for `w` and `h` — they are its own data.",
      },
      {
        code: "Rect small(2, 2);",
        note_mn:
          "Обьект бүр өөрийн `w`, `h`-тэй. `r` ба `small` хоорондоо огт хамааралгүй.",
        note_en:
          "Each object has its own `w` and `h`. `r` and `small` are entirely separate.",
      },
    ],
    terms: [
      {
        term: "method",
        def_mn: "Классын дотор бичигдсэн, обьектын өгөгдөлд ханддаг функц.",
        def_en: "A function inside a class that reaches its object's data.",
      },
      {
        term: "constructor",
        def_mn:
          "Обьект үүсэх үед автоматаар ажиллах метод. Классын нэртэй ижил нэртэй.",
        def_en:
          "A method that runs automatically when an object is created. Named after the class.",
      },
    ],
    mistakes: [
      {
        wrong: "void Rect(int w, int h) { ... }",
        fix: "Rect(int w, int h) { ... }",
        why_mn:
          "Байгуулагчид буцаах төрөл БАЙХГҮЙ. `void` бичвэл энэ нь энгийн метод болж, обьект үүсэхэд ажиллахаа болино.",
        why_en:
          "A constructor has NO return type. Adding `void` turns it into an ordinary method that never runs on creation.",
      },
      {
        wrong:
          "Байгуулагчтай атлаа Rect r; гэх / Rect r; when a constructor takes arguments",
        fix: "Rect r(3, 4);",
        why_mn:
          "Аргументтай байгуулагч тодорхойлбол аргументгүй хувилбар алга болно. Компилятор татгалзана.",
        why_en:
          "Defining a constructor with arguments removes the no-argument one. The compiler refuses.",
      },
    ],
    quiz: {
      question_mn: "Байгуулагч хэзээ ажилладаг вэ?",
      question_en: "When does a constructor run?",
      choices: [
        "Обьект үүсэх үед автоматаар / Automatically, when the object is created",
        "Гараар дуудахад / Only when you call it by name",
        "Програм дуусахад / When the program ends",
      ],
      answer: 0,
      explain_mn:
        "Тийм учраас обьект үргэлж зөв утгатай эхэлдэг — «оноохоо мартсан» гэсэн алдаа гарахгүй.",
      explain_en:
        "That is why an object always starts valid — forgetting to fill it in becomes impossible.",
    },
    challenge_mn:
      "Тойргийн радиусыг байгуулагчаар авч, талбай ба урттай нь буцаадаг метод бүхий класс бич.",
    challenge_en:
      "Write a Circle class taking its radius in the constructor, with methods for area and circumference.",
  },
  {
    slug: "operator-overload",
    unit: 12,
    title_mn: "Оператор тодорхойлох",
    title_en: "Defining an Operator",
    goal_mn: "`operator<` бичиж, өөрийн төрлөө `sort`-оор эрэмбэлүүлэх.",
    goal_en: "Write `operator<` so `sort` can order your own type.",
    intro_mn:
      "Энэ бол энэ бүлгийн хамгийн ашигтай хичээл. `sort` нь хоёр элементийн аль нь өмнө байхыг мэдэх ёстой. Тусдаа comparator бичихийн оронд төрөл дотроо `operator<` тодорхойлвол `sort`, `set`, `priority_queue` бүгд ямар ч нэмэлт зүйлгүйгээр ажиллана.",
    intro_en:
      "This is the lesson in this unit that actually pays off. `sort` has to know which of two items comes first. Instead of a separate comparator, define `operator<` inside the type and `sort`, `set` and `priority_queue` all just work.",
    code: `#include <iostream>
#include <vector>
#include <algorithm>
#include <string>
using namespace std;

struct Student {
    string name;
    int score;

    bool operator<(const Student& other) const {
        return score > other.score;
    }
};

int main() {
    vector<Student> v = {{"Bat", 70}, {"Suvd", 95}, {"Tuul", 82}};
    sort(v.begin(), v.end());
    for (const Student& s : v) {
        cout << s.name << " " << s.score << endl;
    }
    return 0;
}`,
    output: "Suvd 95\nTuul 82\nBat 70",
    lines: [
      {
        code: "bool operator<(const Student& other) const {",
        note_mn:
          "«Би нөгөөгөөсөө өмнө байх ёстой юу?» Сүүлийн `const` нь энэ функц юуг ч өөрчлөхгүй гэсэн амлалт.",
        note_en:
          '"Do I come before the other one?" The trailing `const` promises this changes nothing.',
      },
      {
        code: "return score > other.score;",
        note_mn:
          "`>` тэмдэг тул өндөр оноо түрүүлнэ. Оператор нь `<` боловч дотор нь юу ч бичиж болно.",
        note_en:
          "A `>` here puts higher scores first. The operator is `<` but the rule inside is yours.",
      },
      {
        code: "sort(v.begin(), v.end());",
        note_mn:
          "Гурав дахь аргумент БАЙХГҮЙ. `sort` өөрөө `operator<` -г олж ашиглана.",
        note_en:
          "No third argument. `sort` finds and uses `operator<` by itself.",
      },
      {
        code: "const Student& other",
        note_mn:
          "`const&` — хуулбарлахгүй, өөрчлөхгүй. Эрэмбэлэхэд сая удаа дуудагдаж болзошгүй тул чухал.",
        note_en:
          "`const&` — no copy, no change. It matters because sorting may call this a million times.",
      },
    ],
    terms: [
      {
        term: "operator overloading",
        def_mn: "Өөрийн төрөлд `<`, `+` зэрэг тэмдгийн утгыг тодорхойлох.",
        def_en: "Giving symbols like `<` or `+` a meaning for your own type.",
      },
      {
        term: "strict weak ordering",
        def_mn:
          "`sort`-ын шаарддаг дүрэм. Тэнцүү элемент дээр ЗААВАЛ false буцаах ёстой.",
        def_en: "The rule `sort` requires. Equal items must always give false.",
      },
    ],
    mistakes: [
      {
        wrong: "return score >= other.score;",
        fix: "return score > other.score;",
        why_mn:
          "Тэнцүү үед `true` буцаавал `sort` массиваас гарч сүйрч болно. Энэ бол ажиллах үеийн сүйрэл, компиляцын алдаа биш.",
        why_en:
          "Returning true for equals can send `sort` off the end of the array. It crashes at run time, with no compiler warning.",
      },
      {
        wrong: "bool operator<(Student other) {",
        fix: "bool operator<(const Student& other) const {",
        why_mn:
          "Хуулбараар авбал эрэмбэлэлт бүрд нэмэлт хуулбар үүснэ. Сүүлийн `const`-гүй бол `const` обьект дээр ажиллахгүй.",
        why_en:
          "Taking a copy adds a copy per comparison, and without the trailing `const` it will not work on a const object.",
      },
    ],
    quiz: {
      question_mn:
        "`operator<` тодорхойлсны дараа `sort(v.begin(), v.end())` -д юу хэрэгтэй вэ?",
      question_en:
        "Once `operator<` is defined, what does `sort(v.begin(), v.end())` need?",
      choices: [
        "Comparator функц заавал өгөх / A comparator function, always",
        "Юу ч нэмэх шаардлагагүй / Nothing more at all",
        "Эхлээд эрэмбэлэгдсэн байх / The vector to be sorted already",
      ],
      answer: 1,
      explain_mn:
        "`sort` нь өөрийн төрлийн `operator<` -г автоматаар олдог. `set`, `priority_queue` бас адилхан.",
      explain_en:
        "`sort` finds your type's `operator<` on its own — and so do `set` and `priority_queue`.",
    },
    challenge_mn:
      "Оноогоор буурахаар, оноо тэнцвэл нэрээр өсөхөөр эрэмбэлдэг `operator<` бич.",
    challenge_en:
      "Write an `operator<` that orders by score descending, and by name ascending when scores tie.",
  },
);

// Attach the Python rendering of each lesson (kept in its own file so this
// one stays about the curriculum rather than syntax), and the reference
// sections (kept separate for the same reason — they are the longest part).
for (const lesson of LESSONS) {
  const variant = PYTHON_VARIANTS[lesson.slug];
  if (variant) lesson.python = variant;

  const sections = LESSON_SECTIONS[lesson.slug];
  if (sections) lesson.sections = sections;
}

export function findLesson(slug: string): Lesson | undefined {
  return LESSONS.find((l) => l.slug === slug);
}

export function lessonIndex(slug: string): number {
  return LESSONS.findIndex((l) => l.slug === slug);
}
