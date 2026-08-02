// Python versions of every lesson.
//
// The teaching around each lesson (goal, intro, key words, quiz) is about the
// idea, not the syntax, so it is shared. Only the worked example, its output,
// the line-by-line notes and the language-specific mistakes differ — those
// live here, keyed by lesson slug.

import type { LessonVariant } from "./lessons";

export const PYTHON_VARIANTS: Record<string, LessonVariant> = {
  "hello-world": {
    code: `print("Hello, World!")`,
    output: "Hello, World!",
    lines: [
      {
        code: 'print("Hello, World!")',
        note_mn:
          "Python-д энэ л хангалттай. `print` нь дэлгэц рүү хэвлээд шинэ мөр рүү шилжинэ. C++ шиг `#include`, `main` бичих шаардлагагүй.",
        note_en:
          "In Python this is the whole program. `print` writes to the screen and moves to a new line. No `#include` or `main` needed.",
      },
    ],
    mistakes: [
      {
        wrong: "print(Hello, World!)",
        fix: 'print("Hello, World!")',
        why_mn: "Бичвэрийг заавал хашилтанд хийнэ.",
        why_en: "Text must be inside quotes.",
      },
      {
        wrong: 'Print("Hello")',
        fix: 'print("Hello")',
        why_mn: "Python том/жижиг үсгийг ялгадаг. `print` бүхэлдээ жижиг үсэг.",
        why_en: "Python is case-sensitive — `print` is all lowercase.",
      },
    ],
    terms: [
      {
        term: "print()",
        def_mn: "Дэлгэц рүү хэвлэх функц. Хаалт дотор хэвлэх зүйлээ бичнэ.",
        def_en: "The function that writes to the screen. What to show goes in the brackets.",
      },
    ],
    quiz: {
      question_mn: "Python дээр дэлгэц рүү хэвлэхийн тулд юу ашиглах вэ?",
      question_en: "What do you use to print to the screen in Python?",
      choices: ["print()", "cout <<", "echo"],
      answer: 0,
      explain_mn: "Python-д print() ашиглана. cout бол C++-ийнх.",
      explain_en: "Python uses print(). cout belongs to C++.",
    },
  },

  printing: {
    code: `print("My name is Bat")
print("I am", 14, "years old")
print(2 + 3)`,
    output: "My name is Bat\nI am 14 years old\n5",
    lines: [
      {
        code: 'print("I am", 14, "years old")',
        note_mn:
          "Таслалаар зааглавал `print` тэдгээрийн хооронд зайг ӨӨРӨӨ тавина. Тиймээс `\"I am \"` гэж зай нэмэх шаардлагагүй.",
        note_en:
          "Separate values with commas and `print` puts a space between them for you — so you don't need to add one inside the quotes.",
      },
      {
        code: "print(2 + 3)",
        note_mn: "Хашилтгүй тул эхлээд бодоод 5 гэж хэвлэнэ.",
        note_en: "No quotes, so it works out the sum first and prints 5.",
      },
    ],
    mistakes: [
      {
        wrong: 'print("2 + 3")',
        fix: "print(2 + 3)",
        why_mn: "Хашилттай бол `2 + 3` гэсэн бичвэр гарна, 5 биш.",
        why_en: "With quotes you get the text `2 + 3`, not the answer.",
      },
    ],
    quiz: {
      question_mn: "print(2 + 3) юу хэвлэх вэ?",
      question_en: "What does print(2 + 3) print?",
      choices: ["5", "2 + 3", "23"],
      answer: 0,
      explain_mn: "Хашилтгүй учир эхлээд бодоод 5 гаргана.",
      explain_en: "There are no quotes, so it works out the sum and prints 5.",
    },
  },

  comments: {
    code: `# This line is a note. It does nothing.
print("Hi")   # notes can sit after code too

"""
A longer note
across several lines
"""`,
    output: "Hi",
    lines: [
      {
        code: "# This line is a note. It does nothing.",
        note_mn: "Python-д тайлбарыг `#` тэмдгээр эхэлнэ (C++ дээрх `//` шиг).",
        note_en: "In Python a comment starts with `#` (the equivalent of `//`).",
      },
      {
        code: '"""',
        note_mn:
          "Гурван хашилт хооронд хэдэн ч мөр бичиж болно. Ихэвчлэн тайлбар болгон ашиглана.",
        note_en:
          "Triple quotes span as many lines as you like — commonly used as a block comment.",
      },
    ],
  },

  variables: {
    code: `age = 14
next_year = age + 1

print("Now:", age)
print("Next year:", next_year)

age = 20              # the box can be refilled
print("Later:", age)`,
    output: "Now: 14\nNext year: 15\nLater: 20",
    lines: [
      {
        code: "age = 14",
        note_mn:
          "Python-д төрөл бичихгүй. Утга нь бүхэл тоо гэдгийг Python өөрөө ойлгоно.",
        note_en:
          "No type is written. Python works out for itself that this is a whole number.",
      },
      {
        code: "next_year = age + 1",
        note_mn: "`age` доторх 14-ийг аваад 1 нэмж, шинэ нэрэнд хадгална.",
        note_en: "Takes the 14 inside `age`, adds 1 and stores it under a new name.",
      },
      {
        code: "age = 20              # the box can be refilled",
        note_mn: "Хуучин нэр дээр шинэ утга оноож болно.",
        note_en: "You can put a new value into a name you already used.",
      },
    ],
    mistakes: [
      {
        wrong: "my age = 14",
        fix: "my_age = 14",
        why_mn: "Нэрэнд зай байж болохгүй. Python-д ихэвчлэн `_` ашиглана.",
        why_en: "Names cannot contain spaces — Python usually uses `_`.",
      },
      {
        wrong: 'print("Age: " + age)',
        fix: 'print("Age:", age)',
        why_mn:
          "Бичвэр дээр тоог шууд `+`-аар нэмж болохгүй. Таслал ашигла.",
        why_en:
          "You cannot `+` a number onto text in Python — use a comma instead.",
      },
    ],
    terms: [
      {
        term: "=",
        def_mn: "Тэнцүү гэсэн үг БИШ. Баруун талын утгыг зүүн талын нэрэнд хий гэсэн үг.",
        def_en: "Does NOT mean equals. It means put the right-hand value into the name on the left.",
      },
      {
        term: "Төрөл / Type",
        def_mn: "Python-д төрлийг бичихгүй — утгаас нь өөрөө таана.",
        def_en: "In Python you never write the type — it is worked out from the value.",
      },
    ],
    quiz: {
      question_mn: "x = 5 дараа нь x = x + 3 бол x хэд вэ?",
      question_en: "After x = 5 then x = x + 3, what is x?",
      choices: ["8", "5", "3"],
      answer: 0,
      explain_mn: "5 дээр 3 нэмээд буцаагаад x-д хийсэн тул 8.",
      explain_en: "It adds 3 to 5 and puts the result back into x, so 8.",
    },
  },

  types: {
    code: `count = 7          # int
price = 19.5       # float
grade = "A"        # str
passed = True      # bool
name = "Saraa"

print(name, "got", grade)
print("Price:", price)
print("Passed?", passed)`,
    output: "Saraa got A\nPrice: 19.5\nPassed? True",
    lines: [
      {
        code: "price = 19.5       # float",
        note_mn: "Бутархай тоог `float` гэнэ. Тусад нь зарлах шаардлагагүй.",
        note_en: "A decimal is called a `float`. Nothing extra to declare.",
      },
      {
        code: 'grade = "A"        # str',
        note_mn:
          "Python-д ганц үсэг ч гэсэн `str` (мөр) байна. C++ шиг `char` төрөл байхгүй.",
        note_en:
          "Even a single letter is a `str` — Python has no separate `char` type.",
      },
      {
        code: "passed = True      # bool",
        note_mn:
          "`True` ба `False` том үсгээр эхэлнэ. Хэвлэхэд 1/0 биш `True`/`False` гарна.",
        note_en:
          "`True` and `False` start with a capital letter, and they print as words, not 1/0.",
      },
    ],
    mistakes: [
      {
        wrong: "passed = true",
        fix: "passed = True",
        why_mn: "Python-д `True`/`False` том үсгээр эхэлдэг.",
        why_en: "In Python these are capitalised: `True` and `False`.",
      },
    ],
    quiz: {
      question_mn: "Өндрийг (1.62) ямар төрлөөр хадгалах вэ?",
      question_en: "Which type stores a height like 1.62?",
      choices: ["float", "int", "str"],
      answer: 0,
      explain_mn: "Бутархайтай тул float.",
      explain_en: "It has a decimal part, so float.",
    },
  },

  input: {
    code: `a = int(input())
b = int(input())
print("Sum =", a + b)`,
    output: "(input: 4\\n6)\nSum = 10",
    lines: [
      {
        code: "a = int(input())",
        note_mn:
          "`input()` хэрэглэгчийн бичсэнийг БИЧВЭР болгон авна. `int(...)` түүнийг тоо болгоно — энэ алхмыг мартвал нэмэх үед алдаа гарна.",
        note_en:
          "`input()` reads what the user types as TEXT. `int(...)` turns it into a number — forget this and adding will go wrong.",
      },
      {
        code: 'print("Sum =", a + b)',
        note_mn: "Одоо `a` ба `b` жинхэнэ тоо тул нийлбэр зөв гарна.",
        note_en: "Now `a` and `b` really are numbers, so the sum is correct.",
      },
    ],
    mistakes: [
      {
        wrong: "a = input()\nb = input()\nprint(a + b)   # '46'",
        fix: "a = int(input())\nb = int(input())\nprint(a + b)   # 10",
        why_mn:
          "`int()`-гүй бол хоёр бичвэр наалдаж “46” болно. Энэ бол Python-ы хамгийн түгээмэл эхлэгчийн алдаа.",
        why_en:
          "Without `int()` the two texts get joined into '46'. This is the classic Python beginner bug.",
      },
    ],
    terms: [
      {
        term: "int(input())",
        def_mn: "input() бичвэр өгдөг тул тоо болгохын тулд int()-ээр ороож өгнө.",
        def_en: "input() gives text, so wrap it in int() to get a number.",
      },
    ],
    quiz: {
      question_mn: "Хэрэглэгч 4 бичихэд a = input() дараа a + a юу өгөх вэ?",
      question_en: "If the user types 4, what does a = input() then a + a give?",
      choices: ["44 — бичвэр наалдана / text joined", "8", "Алдаа / An error"],
      answer: 0,
      explain_mn: "input() бичвэр өгдөг тул int()-гүй бол наалдана.",
      explain_en: "input() returns text, so without int() the two just join.",
    },
  },

  math: {
    code: `a = 7
b = 2

print(a + b)    # 9
print(a - b)    # 5
print(a * b)    # 14
print(a / b)    # 3.5  <-- always a decimal
print(a // b)   # 3    whole-number division
print(a % b)    # 1    remainder
print(a ** 2)   # 49   power`,
    output: "9\n5\n14\n3.5\n3\n1\n49",
    lines: [
      {
        code: "print(a / b)    # 3.5  <-- always a decimal",
        note_mn:
          "C++-ээс ЯЛГААТАЙ: Python-д `/` үргэлж бутархай хариу өгнө, 7/2 = 3.5.",
        note_en:
          "DIFFERENT from C++: in Python `/` always gives a decimal, so 7/2 is 3.5.",
      },
      {
        code: "print(a // b)   # 3    whole-number division",
        note_mn: "Бүхэл хариу хэрэгтэй бол `//` ашиглана.",
        note_en: "Use `//` when you want the whole-number answer.",
      },
      {
        code: "print(a % b)    # 1    remainder",
        note_mn: "`%` үлдэгдэл — тэгш/сондгой шалгахад хэрэглэнэ.",
        note_en: "`%` is the remainder — handy for checking odd/even.",
      },
    ],
    mistakes: [
      {
        wrong: "half = 7 / 2   # 3.5, not 3",
        fix: "half = 7 // 2  # 3",
        why_mn: "Бүхэл хариу хүсвэл `//`. Энэ нь C++-ийн эсрэг талдаа.",
        why_en: "Want a whole number? Use `//` — this is the opposite of C++.",
      },
    ],
    quiz: {
      question_mn: "Python дээр 7 / 2 юу өгөх вэ?",
      question_en: "In Python, what does 7 / 2 give?",
      choices: ["3.5", "3", "4"],
      answer: 0,
      explain_mn: "Python-д / үргэлж бутархай өгнө. Бүхэл хариу бол //.",
      explain_en: "In Python / always gives a decimal. Use // for the whole number.",
    },
  },

  "if-else": {
    code: `n = int(input())

if n > 0:
    print("Positive")
elif n < 0:
    print("Negative")
else:
    print("Zero")`,
    output: "(input: -5)\nNegative",
    lines: [
      {
        code: "if n > 0:",
        note_mn:
          "Хаалт хэрэггүй, харин төгсгөлд ХОЁР ЦЭГ `:` заавал тавина.",
        note_en:
          "No brackets round the condition, but it MUST end with a colon `:`.",
      },
      {
        code: '    print("Positive")',
        note_mn:
          "Python-д `{ }` биш ЗАЙ (ихэвчлэн 4) кодын блокийг заана. Зайг зөв тавихгүй бол алдаа гарна.",
        note_en:
          "Python uses INDENTATION (usually 4 spaces) instead of `{ }` to mark a block. Get it wrong and the program errors.",
      },
      {
        code: "elif n < 0:",
        note_mn: "`elif` нь C++-ийн `else if`-ийн богино хэлбэр.",
        note_en: "`elif` is Python's shorter spelling of `else if`.",
      },
    ],
    mistakes: [
      {
        wrong: "if n > 0\n    print(n)",
        fix: "if n > 0:\n    print(n)",
        why_mn: "Хоёр цэг `:` мартвал болохгүй.",
        why_en: "The colon `:` is required.",
      },
      {
        wrong: 'if n > 0:\nprint("yes")',
        fix: 'if n > 0:\n    print("yes")',
        why_mn: "Блок доторх мөрийг заавал зайгаар дотогшлуулна.",
        why_en: "Lines inside the block must be indented.",
      },
    ],
    terms: [
      {
        term: ":",
        def_mn: "if, for, while, def-ийн төгсгөлд заавал хоёр цэг тавина.",
        def_en: "A colon must end every if, for, while and def line.",
      },
      {
        term: "Догол мөр / Indentation",
        def_mn: "Python-д зай нь блокийг заана — { } байхгүй.",
        def_en: "Python uses spaces to mark a block — there are no braces.",
      },
    ],
    quiz: {
      question_mn: "Python-д блокийг юугаар заана вэ?",
      question_en: "What marks a block of code in Python?",
      choices: [
        "Догол мөр (зай) / Indentation",
        "{ } хаалт / Curly braces",
        "Цэгтэй таслал / Semicolons",
      ],
      answer: 0,
      explain_mn: "Зайгаар дотогшлуулснаар блок үүснэ.",
      explain_en: "Indenting the lines is what creates the block.",
    },
  },

  conditions: {
    code: `age = 14
has_ticket = True

if age >= 12 and has_ticket:
    print("You may enter")

if age < 6 or age > 65:
    print("Free entry")
else:
    print("Pay full price")`,
    output: "You may enter\nPay full price",
    lines: [
      {
        code: "if age >= 12 and has_ticket:",
        note_mn:
          "Python-д `&&`-ийн оронд `and` гэж бичнэ — уншихад амархан.",
        note_en: "Python writes `and` instead of `&&` — easier to read aloud.",
      },
      {
        code: "if age < 6 or age > 65:",
        note_mn: "`||`-ийн оронд `or`. Мөн `!`-ийн оронд `not`.",
        note_en: "`or` instead of `||`, and `not` instead of `!`.",
      },
    ],
    mistakes: [
      {
        wrong: "if age >= 12 && has_ticket:",
        fix: "if age >= 12 and has_ticket:",
        why_mn: "Python `&&`, `||`-ийг ойлгохгүй. `and`, `or` ашигла.",
        why_en: "Python does not understand `&&` or `||` — use `and` / `or`.",
      },
    ],
    quiz: {
      question_mn: "Python-д ба (AND)-ийг хэрхэн бичих вэ?",
      question_en: "How do you write AND in Python?",
      choices: ["and", "&&", "AND"],
      answer: 0,
      explain_mn: "Python and, or, not гэсэн үгсийг ашиглана.",
      explain_en: "Python uses the words and, or and not.",
    },
  },

  "for-loop": {
    code: `for i in range(1, 6):
    print(i, end=" ")
print()`,
    output: "1 2 3 4 5",
    lines: [
      {
        code: "for i in range(1, 6):",
        note_mn:
          "`range(1, 6)` нь 1, 2, 3, 4, 5 гаргана — ТӨГСГӨЛИЙН тоо ОРОХГҮЙ. 6 хүртэл гэж бодоорой.",
        note_en:
          "`range(1, 6)` gives 1, 2, 3, 4, 5 — the END number is NOT included. Read it as 'up to but not including 6'.",
      },
      {
        code: '    print(i, end=" ")',
        note_mn:
          "`end=\" \"` нь мөр таслахын оронд зай тавина. Үгүй бол тоо бүр шинэ мөрөнд гарна.",
        note_en:
          'By default `print` starts a new line; `end=" "` puts a space instead.',
      },
    ],
    mistakes: [
      {
        wrong: "for i in range(1, 5):   # stops at 4",
        fix: "for i in range(1, 6):   # includes 5",
        why_mn: "`range` төгсгөлийн тоог оруулдаггүй.",
        why_en: "`range` never includes the end value.",
      },
    ],
    terms: [
      {
        term: "range(a, b)",
        def_mn: "a-аас эхэлж b-ээс ӨМНӨ зогсоно. b орохгүй.",
        def_en: "Starts at a and stops BEFORE b — b itself is not included.",
      },
    ],
    quiz: {
      question_mn: "for i in range(1, 4) бол i ямар утгууд авах вэ?",
      question_en: "In for i in range(1, 4), which values does i take?",
      choices: ["1, 2, 3", "1, 2, 3, 4", "0, 1, 2, 3"],
      answer: 0,
      explain_mn: "range төгсгөлийн тоог оруулдаггүй.",
      explain_en: "range never includes the end value.",
    },
  },

  "while-loop": {
    code: `n = 3
while n > 0:
    print(n, end=" ")
    n -= 1            # without this it never ends
print("Go!")`,
    output: "3 2 1 Go!",
    lines: [
      {
        code: "while n > 0:",
        note_mn: "Нөхцөл + хоёр цэг. Давталт бүрийн өмнө шалгана.",
        note_en: "Condition plus a colon. Checked before each round.",
      },
      {
        code: "    n -= 1            # without this it never ends",
        note_mn:
          "`n -= 1` нь `n = n - 1`. Python-д `n--` БАЙХГҮЙ — энэ бол C++-ээс шилжихэд гардаг алдаа.",
        note_en:
          "`n -= 1` means `n = n - 1`. Python has NO `n--` — a common slip when coming from C++.",
      },
    ],
    mistakes: [
      {
        wrong: "n--",
        fix: "n -= 1",
        why_mn: "Python-д `--` оператор байхгүй.",
        why_en: "Python has no `--` operator.",
      },
    ],
    quiz: {
      question_mn: "Python-д n-ийг 1-ээр хорогдуулахын тулд юу бичих вэ?",
      question_en: "How do you decrease n by 1 in Python?",
      choices: ["n -= 1", "n--", "n =- 1"],
      answer: 0,
      explain_mn: "Python-д -- оператор байхгүй.",
      explain_en: "Python has no -- operator.",
    },
  },

  "putting-it-together": {
    code: `n = int(input())

total = 0
for _ in range(n):
    x = int(input())
    if x % 2 == 0:
        total += x

print("Even sum =", total)`,
    output: "(input: 5\\n1 2 3 4 6)\nEven sum = 12",
    lines: [
      {
        code: "total = 0",
        note_mn: "Давталтын ГАДНА байрлана — үгүй бол утга бүрт дахин 0 болно.",
        note_en: "Lives OUTSIDE the loop, or it would reset every round.",
      },
      {
        code: "for _ in range(n):",
        note_mn:
          "Тоолуурыг ашиглахгүй бол `_` гэж нэрлэдэг заншилтай.",
        note_en:
          "When you never use the counter, Python convention is to name it `_`.",
      },
      {
        code: "        total += x",
        note_mn: "`total += x` нь `total = total + x`-ийн богино хэлбэр.",
        note_en: "`total += x` is short for `total = total + x`.",
      },
    ],
  },

  strings: {
    code: `name = "Bat"

print(len(name))       # 3
print(name[0])         # B
print(name + "aa")     # Bataa

for ch in name:
    print(ch, end="-")
print()`,
    output: "3\nB\nBataa\nB-a-t-",
    lines: [
      {
        code: "print(len(name))       # 3",
        note_mn: "Python-д урт нь `len(name)` — цэгтэй бичлэг биш.",
        note_en: "In Python the length is `len(name)`, not `name.length()`.",
      },
      {
        code: "print(name[0])         # B",
        note_mn: "Дугаарлалт 0-оос эхлэх нь C++-тэй ижил.",
        note_en: "Counting starts at 0, exactly as in C++.",
      },
      {
        code: "for ch in name:",
        note_mn:
          "Python-д үсэг бүрийг ШУУД эргэж болно — дугаар бодох шаардлагагүй.",
        note_en:
          "Python can walk the letters directly — no index arithmetic needed.",
      },
    ],
    mistakes: [
      {
        wrong: 'name = "Bat"\nname[0] = "C"',
        fix: 'name = "Cat"',
        why_mn:
          "Python-д мөрийг өөрчилж болохгүй. Шинэ мөр үүсгэнэ.",
        why_en:
          "Python strings cannot be changed in place — build a new one instead.",
      },
    ],
  },

  getline: {
    code: `line = input()
first = line.split()[0]

print("Word:", first)
print("Whole line:", line)`,
    output: "(input: Bat Erdene Suh)\nWord: Bat\nWhole line: Bat Erdene Suh",
    lines: [
      {
        code: "line = input()",
        note_mn:
          "Python-д `input()` бүтэн мөрийг зайтай нь хамт уншина — C++ шиг `getline` хэрэггүй.",
        note_en:
          "In Python `input()` already reads the whole line, spaces included — no `getline` needed.",
      },
      {
        code: "first = line.split()[0]",
        note_mn:
          "`split()` мөрийг зайгаар хувааж жагсаалт болгоно. `[0]` эхний үгийг авна.",
        note_en:
          "`split()` breaks the line into a list at each space; `[0]` takes the first word.",
      },
    ],
    mistakes: [
      {
        wrong: "a, b = input(), input()   # two separate lines",
        fix: "a, b = input().split()     # one line, two words",
        why_mn:
          "Нэг мөрөнд хоёр утга байвал `split()` ашиглана.",
        why_en:
          "When both values are on one line, split that line instead of reading twice.",
      },
    ],
    quiz: {
      question_mn: "Python-д зайтай бүтэн мөрийг юугаар унших вэ?",
      question_en: "How do you read a whole line with spaces in Python?",
      choices: ["input()", "getline(cin, s)", "cin >> s"],
      answer: 0,
      explain_mn: "input() бүтэн мөрийг зайтай нь хамт уншдаг.",
      explain_en: "input() already reads the whole line, spaces included.",
    },
  },

  arrays: {
    code: `score = [70, 85, 90, 60, 100]

print(score[0])     # 70  (first)
print(score[-1])    # 100 (last)

score[1] = 88       # change one slot

for s in score:
    print(s, end=" ")
print()`,
    output: "70\n100\n70 88 90 60 100",
    lines: [
      {
        code: "score = [70, 85, 90, 60, 100]",
        note_mn:
          "Python-д үүнийг ЖАГСААЛТ (list) гэнэ. Хэмжээг урьдчилж зарлахгүй.",
        note_en:
          "Python calls this a LIST. You never declare a size up front.",
      },
      {
        code: "print(score[-1])    # 100 (last)",
        note_mn:
          "Сөрөг дугаар нь ард талаас тоолно: `-1` сүүлчийнх. C++-д байхгүй давуу тал.",
        note_en:
          "Negative indexes count from the end: `-1` is the last item. C++ has no such shortcut.",
      },
      {
        code: "for s in score:",
        note_mn: "Утга бүрийг шууд эргэнэ — дугаар хэрэггүй.",
        note_en: "Walks the values directly — no index needed.",
      },
    ],
    mistakes: [
      {
        wrong: "score = [70, 85]\nprint(score[2])",
        fix: "print(score[1])   # last one",
        why_mn:
          "2 утгатай жагсаалтын дугаарууд 0, 1. `score[2]` алдаа өгнө.",
        why_en:
          "A 2-item list has indexes 0 and 1 — `score[2]` raises an error.",
      },
    ],
    terms: [
      {
        term: "Жагсаалт / List",
        def_mn: "Python-д массивыг жагсаалт гэнэ. Хэмжээг урьдчилж зарлахгүй.",
        def_en: "Python calls an array a list. You never declare its size.",
      },
      {
        term: "a[-1]",
        def_mn: "Сөрөг дугаар ард талаас тоолно: -1 бол сүүлчийнх.",
        def_en: "Negative indexes count from the end: -1 is the last item.",
      },
    ],
    quiz: {
      question_mn: "a = [10, 20, 30] бол a[-1] юу вэ?",
      question_en: "For a = [10, 20, 30], what is a[-1]?",
      choices: ["30", "10", "Алдаа / An error"],
      answer: 0,
      explain_mn: "-1 нь сүүлчийн утгыг өгнө.",
      explain_en: "-1 gives the last item.",
    },
  },

  "array-loops": {
    code: `n = int(input())
a = [int(x) for x in input().split()]

total = 0
best = a[0]
for x in a:
    total += x
    if x > best:
        best = x

print("Sum:", total)
print("Max:", best)
print("Avg:", total / n)`,
    output: "(input: 4\\n3 9 2 6)\nSum: 20\nMax: 9\nAvg: 5.0",
    lines: [
      {
        code: "a = [int(x) for x in input().split()]",
        note_mn:
          "Нэг мөрөнд: мөрийг хувааж, хэсэг бүрийг тоо болгож жагсаалт үүсгэнэ. Үүнийг list comprehension гэнэ.",
        note_en:
          "One line: split the input, turn each piece into a number, collect into a list. This is called a list comprehension.",
      },
      {
        code: "best = a[0]",
        note_mn: "Хамгийн ихийг ЭХНИЙ утгаар эхлүүлнэ, 0-оор биш.",
        note_en: "Seed the maximum with the FIRST value, not 0.",
      },
      {
        code: 'print("Avg:", total / n)',
        note_mn:
          "Python-д `/` бутархай өгдөг тул `(double)` шиг хөрвүүлэлт хэрэггүй.",
        note_en:
          "`/` already gives a decimal in Python, so no cast is needed here.",
      },
    ],
    mistakes: [
      {
        wrong: "best = 0",
        fix: "best = a[0]",
        why_mn: "Бүх тоо сөрөг бол 0 гэсэн буруу хариу гарна.",
        why_en: "With all-negative numbers, 0 would be a wrong answer.",
      },
    ],
  },

  "nested-loops": {
    code: `for row in range(1, 5):
    for col in range(row):
        print("*", end="")
    print()`,
    output: "*\n**\n***\n****",
    lines: [
      {
        code: "for row in range(1, 5):",
        note_mn: "ГАДНА давталт = мөрүүд (1-ээс 4).",
        note_en: "The OUTER loop is the rows, 1 through 4.",
      },
      {
        code: "    for col in range(row):",
        note_mn:
          "`range(row)` нь 0-оос эхлээд `row` ширхэг тоо гаргана — яг тухайн мөрийн одны тоо.",
        note_en:
          "`range(row)` produces exactly `row` values, which is how many stars that line needs.",
      },
      {
        code: "    print()",
        note_mn:
          "Хоосон `print()` мөр таслана. Дотоод давталттай ижил түвшинд байхыг анхаар.",
        note_en:
          "An empty `print()` breaks the line. Note its indentation matches the inner loop, not the stars.",
      },
    ],
    mistakes: [
      {
        wrong: 'for i in range(3):\n  for i in range(3):',
        fix: "for i in range(3):\n  for j in range(3):",
        why_mn: "Хоёр давталт ижил нэр ашиглаж болохгүй.",
        why_en: "Two loops cannot share a counter name.",
      },
    ],
  },

  functions: {
    code: `def square(x):
    return x * x

def greet(name):
    print("Hello, " + name + "!")

print(square(5))    # 25
print(square(9))    # 81
greet("Saraa")`,
    output: "25\n81\nHello, Saraa!",
    lines: [
      {
        code: "def square(x):",
        note_mn:
          "`def` = функц зарлана. Төрөл бичихгүй, төгсгөлд хоёр цэг тавина.",
        note_en:
          "`def` starts a function. No types are written, and it ends with a colon.",
      },
      {
        code: "    return x * x",
        note_mn: "Хариуг буцаана. C++-тэй ижил.",
        note_en: "Hands the answer back, exactly as in C++.",
      },
      {
        code: "def greet(name):",
        note_mn:
          "`return` байхгүй функц зүгээр л ажил хийнэ — C++-ийн `void`-той адил.",
        note_en:
          "A function with no `return` just performs an action — Python's version of `void`.",
      },
    ],
    mistakes: [
      {
        wrong: "def square(x):\n    x * x",
        fix: "def square(x):\n    return x * x",
        why_mn: "`return` мартвал функц `None` буцаана.",
        why_en: "Without `return` the function hands back `None`.",
      },
    ],
  },

  vectors: {
    code: `v = []

v.append(10)
v.append(20)
v.append(30)

print(len(v))    # 3
print(v[1])      # 20

for x in v:
    print(x, end=" ")
print()`,
    output: "3\n20\n10 20 30",
    lines: [
      {
        code: "v = []",
        note_mn:
          "Хоосон жагсаалт. Python-д жагсаалт нь анхнаасаа уян хатан тул тусад нь “вектор” гэж байхгүй.",
        note_en:
          "An empty list. Python lists already grow, so there is no separate 'vector' type.",
      },
      {
        code: "v.append(10)",
        note_mn: "`append` нь C++-ийн `push_back`-тэй яг адил.",
        note_en: "`append` is exactly C++'s `push_back`.",
      },
      {
        code: "print(len(v))    # 3",
        note_mn: "`len(v)` нь одоогийн уртыг өгнө.",
        note_en: "`len(v)` gives the current length.",
      },
    ],
    mistakes: [
      {
        wrong: "v = []\nv[0] = 5",
        fix: "v = []\nv.append(5)",
        why_mn: "Хоосон жагсаалтад `v[0]` байхгүй. Эхлээд `append` хийнэ.",
        why_en: "An empty list has no slot 0 yet — `append` first.",
      },
    ],
    quiz: {
      question_mn: "Python жагсаалтад утга нэмэхийн тулд юу ашиглах вэ?",
      question_en: "How do you add a value to a Python list?",
      choices: ["v.append(x)", "v.push_back(x)", "v.add(x)"],
      answer: 0,
      explain_mn: "append нь C++-ийн push_back-тэй адил.",
      explain_en: "append is Python's version of push_back.",
    },
  },
};
