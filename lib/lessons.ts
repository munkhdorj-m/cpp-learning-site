// Beginner C++ curriculum for the Learn section.
//
// Written for absolute beginners (7th–8th grade): one idea per lesson, plain
// language, a worked example explained line by line, the mistakes they will
// actually hit, and a self-check question. Bilingual — Mongolian first,
// because that is the language these students think in.

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
  terms?: Term[];
  mistakes?: Mistake[];
  quiz?: Quiz;
  /** Optional starter the student edits in the playground. */
  challenge_mn?: string;
  challenge_en?: string;
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
        note_mn: "“Бүх зүйл амжилттай боллоо” гэж мэдэгдээд програмыг дуусгана.",
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
        why_mn: "Мөр бүрийн төгсгөлд цэгтэй таслал `;` тавина. Мартвал алдаа гарна.",
        why_en:
          "Every statement ends with a semicolon `;`. Forgetting it is the most common error.",
      },
      {
        wrong: "cout << Hello, World!;",
        fix: 'cout << "Hello, World!";',
        why_mn: "Бичвэрийг заавал давхар хашилтанд `\" \"` хийнэ.",
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
          "Гурван хэсгийг нэг мөрөнд наана: бичвэр, тоо, бичвэр. Зайг анхаар — `\"I am \"` доторх зай хэрэгтэй.",
        note_en:
          "Glues three pieces onto one line: text, number, text. Notice the space inside `\"I am \"` — you need it.",
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
        why_en: 'With quotes you get the text `2 + 3`, not the answer 5.',
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
        note_en: "Between `/*` and `*/` you can write as many lines as you want.",
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
        wrong: 'int my age = 14;',
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
        note_mn: "`double` бутархай тоо хадгална. `int` бол 19.5-ыг 19 болгоно.",
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
        note_mn: "`string` бол үг/өгүүлбэр. Давхар хашилт `\" \"` ашиглана.",
        note_en: 'A `string` is a word or sentence. It uses double quotes `" "`.',
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
    cout << "Enter two numbers: ";
    cin >> a >> b;
    cout << "Sum = " << a + b << endl;
    return 0;
}`,
    output: "Enter two numbers: 4 6\nSum = 10",
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
        wrong: "if (n > 0);\n    cout << \"Positive\";",
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
      question_en: "With `age = 10` and `hasTicket = false`, does the first `if` run?",
      choices: [
        "Үгүй / No",
        "Тийм / Yes",
        "Заримдаа / Sometimes",
      ],
      answer: 0,
      explain_mn: "`&&` хоёуланг шаардана; тасалбар байхгүй тул худал.",
      explain_en: "`&&` needs both to be true, and there is no ticket.",
    },
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
        note_mn:
          "Давталт бүрт `i` өөр утгатай: эхлээд 1, дараа 2 … 5 хүртэл.",
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
        note_en: "The condition is checked BEFORE each round. When false, it stops.",
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
        why_mn:
          "Төгсгөлгүй давталт. Нөхцөлд нөлөөлдөг зүйлийг заавал өөрчил.",
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
      explain_en: "It checks before each round and stops once the condition is false.",
    },
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
      explain_mn: "Давталтын дотор зарласан хувьсагч давталт бүрт шинээр үүснэ.",
      explain_en: "A variable declared inside the loop is created fresh every round.",
    },
    challenge_mn: "Тэгш биш, сондгой тоонуудын нийлбэрийг олж үз.",
    challenge_en: "Change it to add the odd numbers instead.",
  },
];

export function findLesson(slug: string): Lesson | undefined {
  return LESSONS.find((l) => l.slug === slug);
}

export function lessonIndex(slug: string): number {
  return LESSONS.findIndex((l) => l.slug === slug);
}
