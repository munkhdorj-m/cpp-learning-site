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
nums = list(map(int, input().split()))

total = 0
for x in nums:
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
  operators: {
    code: `score = 10

score = score + 5     # the long way
score += 5            # same thing, shorter
score += 1            # Python has NO ++

print(score)

x = 1
y = x
x += 1
print(x, y)`,
    output: "21\n2 1",
    lines: [
      {
        code: "score += 5",
        note_mn:
          "`+=`, `-=`, `*=`, `//=` бүгд ажиллана. Энэ хэсэг C++-тэй яг адилхан.",
        note_en:
          "`+=`, `-=`, `*=`, `//=` all work. This part is identical to C++.",
      },
      {
        code: "score += 1            # Python has NO ++",
        note_mn:
          "Python-д `++` БАЙХГҮЙ. `score++` гэж бичвэл `SyntaxError` гарна. Нэг нэмэхийн тулд `+= 1`.",
        note_en:
          "Python has NO `++`. Writing `score++` is a `SyntaxError`. To add one, use `+= 1`.",
      },
      {
        code: "y = x",
        note_mn:
          "C++-ийн `y = x++` шиг «эхлээд өг, дараа нь өсгө» гэсэн заль Python-д байхгүй. Хоёр мөрөнд тусад нь бич — уншихад ч ойлгомжтой.",
        note_en:
          "Python has no `y = x++` trick that assigns then increments. Write the two steps separately — it reads better anyway.",
      },
    ],
    mistakes: [
      {
        wrong: "score++",
        fix: "score += 1",
        why_mn: "`++` нь Python-д огт байхгүй тул `SyntaxError` шидэнэ.",
        why_en: "`++` simply does not exist in Python, so it is a `SyntaxError`.",
      },
    ],
    terms: [
      {
        term: "+=",
        def_mn: "Одоогийн утга дээр нэмж, буцаан онооно.",
        def_en: "Adds to the current value and stores it back.",
      },
    ],
  },
  "type-conversion": {
    code: `total = 7
count = 2

print(total // count)        # 3   — whole-number division
print(total / count)         # 3.5 — Python's / always divides fully
print(float(total) / count)  # 3.5 — same, said explicitly

price = 9.99
print(int(price))            # 9 — cuts, does not round
print(round(price))          # 10 — this one rounds`,
    output: "3\n3.5\n3.5\n9\n10",
    lines: [
      {
        code: "print(total / count)",
        note_mn:
          "Энд C++-ээс хамгийн их ялгаатай: Python-д `/` нь ямар ч тохиолдолд бутархай өгнө. Хөрвүүлэх шаардлагагүй.",
        note_en:
          "The biggest difference from C++: in Python `/` always divides fully. No cast is needed.",
      },
      {
        code: "print(int(price))",
        note_mn:
          "`int()` нь таслаад хаяна, дугуйруулахгүй — C++-ийн `(int)` -тэй адил.",
        note_en:
          "`int()` cuts and throws away, it does not round — exactly like C++'s `(int)`.",
      },
      {
        code: "print(round(price))",
        note_mn: "Дугуйруулах бол `round()`. C++-д `<cmath>`-аас `round` авдаг.",
        note_en: "To round, use `round()`. C++ takes `round` from `<cmath>`.",
      },
    ],
    mistakes: [
      {
        wrong: 'n = int("3.7")',
        fix: 'n = int(float("3.7"))',
        why_mn:
          "`int()` бутархай БИЧВЭРийг шууд авахгүй — `ValueError` шидэнэ. Эхлээд `float` болго.",
        why_en:
          "`int()` will not take decimal TEXT — it raises `ValueError`. Turn it into a `float` first.",
      },
    ],
    terms: [
      {
        term: "int(x)",
        def_mn: "Бүхэл тоо болгоно. Бутархайг таслаад хаяна.",
        def_en: "Turns it into a whole number, cutting the fraction away.",
      },
    ],
  },
  switch: {
    code: `day = 3

if day == 1:
    print("Monday")
elif day == 2:
    print("Tuesday")
elif day == 3:
    print("Wednesday")
else:
    print("another day")

age = 20
label = "adult" if age >= 18 else "child"
print(label)`,
    output: "Wednesday\nadult",
    lines: [
      {
        code: "elif day == 2:",
        note_mn:
          "Python-д `switch` БАЙХГҮЙ. `elif` гинжээр орлуулна — `else if`-ийн богино хэлбэр.",
        note_en:
          "Python has NO `switch`. A chain of `elif` replaces it — short for `else if`.",
      },
      {
        code: 'label = "adult" if age >= 18 else "child"',
        note_mn:
          "C++-ийн `? :`-ийн оронд ингэж бичнэ. Нөхцөл ДУНДАА байгаа нь өгүүлбэр шиг уншигдана.",
        note_en:
          "This replaces C++'s `? :`. The condition sits in the MIDDLE, which reads like a sentence.",
      },
      {
        code: "if day == 1:",
        note_mn:
          "`break` шаардлагагүй — нэг салаа ажиллаад л дуусна. C++-ийн `switch`-ийн уналт энд байхгүй.",
        note_en:
          "No `break` needed — one branch runs and that is it. There is no fall-through to forget.",
      },
    ],
    mistakes: [
      {
        wrong: 'label = age >= 18 ? "adult" : "child"',
        fix: 'label = "adult" if age >= 18 else "child"',
        why_mn: "Python-д `? :` байхгүй. `SyntaxError` гарна.",
        why_en: "Python has no `? :`. It is a `SyntaxError`.",
      },
    ],
    terms: [
      {
        term: "elif",
        def_mn: "`else if`-ийн богино хэлбэр. Хэдэн ч удаа давтаж болно.",
        def_en: "Short for `else if`. Chain as many as you like.",
      },
    ],
  },
  "loop-control": {
    code: `# Python has no do-while; this is the usual stand-in
while True:
    print("runs at least once")
    break

for n in range(1, 11):
    if n % 2 == 0:
        continue          # skip the evens
    if n > 7:
        break             # stop after 7
    print(n, end=" ")
print()`,
    output: "runs at least once\n1 3 5 7",
    lines: [
      {
        code: "while True:",
        note_mn:
          "Python-д `do…while` БАЙХГҮЙ. «Дор хаяж нэг удаа» гэдгийг `while True` + `break`-ээр хийдэг.",
        note_en:
          "Python has NO `do…while`. \"At least once\" is written as `while True` with a `break`.",
      },
      {
        code: "continue          # skip the evens",
        note_mn: "`continue` ба `break` хоёул C++-тэй яг адилхан ажиллана.",
        note_en: "`continue` and `break` behave exactly as they do in C++.",
      },
      {
        code: 'print(n, end=" ")',
        note_mn:
          "`end=\" \"` нь мөр таслахын оронд зай тавина. `print()` дараа нь мөрийг таслана.",
        note_en:
          "`end=\" \"` puts a space instead of a line break. The bare `print()` afterwards ends the line.",
      },
    ],
    mistakes: [
      {
        wrong: "do:\n    ...\nwhile i < 1",
        fix: "while True:\n    ...\n    if i >= 1: break",
        why_mn: "`do` гэдэг түлхүүр үг Python-д байхгүй — `SyntaxError`.",
        why_en: "There is no `do` keyword in Python — it is a `SyntaxError`.",
      },
    ],
    terms: [
      {
        term: "while True",
        def_mn: "Төгсгөлгүй давталт. Дотроос нь `break`-ээр гарна.",
        def_en: "A loop with no end. You leave it with `break`.",
      },
    ],
  },
  "string-tools": {
    code: `s = "Ulaanbaatar"

print(len(s))          # 11
print(s[0:5])          # Ulaan
print(s.find("baatar"))# 5

num = "42"
n = int(num) + 1
print(n)               # 43`,
    output: "11\nUlaan\n5\n43",
    lines: [
      {
        code: "print(len(s))",
        note_mn: "`s.size()` биш `len(s)`. Python-д урт нь функц.",
        note_en: "`len(s)`, not `s.size()`. In Python the length is a function.",
      },
      {
        code: "print(s[0:5])",
        note_mn:
          "`substr(0, 5)` биш зүсэлт `s[0:5]`. ЭХЛЭЛ орно, ТӨГСГӨЛ ОРОХГҮЙ — 0,1,2,3,4.",
        note_en:
          "A slice `s[0:5]`, not `substr(0, 5)`. The start is included, the end is NOT — 0,1,2,3,4.",
      },
      {
        code: "n = int(num) + 1",
        note_mn: "`stoi` биш `int()`. Хөрвүүлж чадахгүй бол `ValueError` шидэнэ.",
        note_en: "`int()`, not `stoi`. If it cannot convert, it raises `ValueError`.",
      },
    ],
    mistakes: [
      {
        wrong: "s[0:5] нь 6 тэмдэгт гэж бодох / expecting s[0:5] to give 6 characters",
        fix: "s[0:5] нь 5 тэмдэгт / s[0:5] gives 5 characters",
        why_mn:
          "Зүсэлтийн төгсгөл ОРОХГҮЙ. Энэ бол Python-ы хамгийн түгээмэл нэгээр алдах алдаа.",
        why_en:
          "The end of a slice is EXCLUDED. This is the most common off-by-one in Python.",
      },
    ],
    terms: [
      {
        term: "slice",
        def_mn: "`s[a:b]` — a-аас b-1 хүртэлх хэсэг.",
        def_en: "`s[a:b]` — the piece from a up to b-1.",
      },
    ],
  },
  "function-details": {
    code: `def add_tax(price):
    return price * 1.1        # numbers cannot be changed in place

def power(base, exp=2):       # exp is 2 if you omit it
    result = 1
    for _ in range(exp):
        result *= base
    return result

p = 100
p = add_tax(p)                # take the answer back
print(round(p))

print(power(5))
print(power(2, 10))`,
    output: "110\n25\n1024",
    lines: [
      {
        code: "def add_tax(price):",
        note_mn:
          "Python-д `&` байхгүй. Тоо, мөр зэрэг нь ӨӨРЧЛӨГДӨХГҮЙ тул функц дотроос нь солих боломжгүй — хариуг нь буцааж авах ёстой.",
        note_en:
          "There is no `&` in Python. Numbers and strings cannot be changed in place, so you must take the answer back.",
      },
      {
        code: "def power(base, exp=2):",
        note_mn:
          "Анхдагч утга C++-тэй яг адилхан ажиллана. `power(5)` гэвэл `exp` нь 2 болно.",
        note_en:
          "Default arguments work exactly as in C++. `power(5)` gets `exp` as 2.",
      },
      {
        code: "for _ in range(exp):",
        note_mn:
          "`_` нь «энэ утга надад хэрэггүй» гэсэн заншилтай нэр.",
        note_en:
          "`_` is the conventional name for \"I do not need this value\".",
      },
    ],
    mistakes: [
      {
        wrong: "add_tax(p)\nprint(p)",
        fix: "p = add_tax(p)\nprint(p)",
        why_mn:
          "Тоо өөрчлөгдөхгүй тул `p` хэвээрээ үлдэнэ. Алдаа заахгүй — зүгээр л юу ч болохгүй.",
        why_en:
          "Numbers do not change in place, so `p` is untouched. Nothing errors — nothing simply happens.",
      },
    ],
    terms: [
      {
        term: "immutable",
        def_mn: "Өөрчлөгдөхгүй. Тоо, мөр, кортеж ийм байдаг.",
        def_en: "Cannot be changed. Numbers, strings and tuples are like this.",
      },
    ],
  },
  structs: {
    code: `class Student:
    def __init__(self, name, grade):
        self.name = name
        self.grade = grade

s = Student("Bat", 9)
print(s.name, s.grade)

best = s                 # NOT a copy — both names point at the same object
best.grade = 10
print(s.grade)`,
    output: "Bat 9\n10",
    lines: [
      {
        code: "class Student:",
        note_mn:
          "Python-д `struct` байхгүй. Хамгийн ойрхон нь жижиг класс.",
        note_en:
          "Python has no `struct`. The nearest thing is a small class.",
      },
      {
        code: "self.name = name",
        note_mn:
          "`self` бол «энэ обьект». Талбар бүрийн өмнө заавал бичнэ.",
        note_en:
          "`self` means \"this object\". Every field is written with it in front.",
      },
      {
        code: "best = s",
        note_mn:
          "C++-ЭЭС ЯЛГААТАЙ. C++-д бүх талбар хуулагдана; Python-д хоёр нэр НЭГ обьектыг заана. `best`-ийг өөрчлөхөд `s` бас өөрчлөгдөнө.",
        note_en:
          "DIFFERENT FROM C++. C++ copies every field; Python makes both names point at the SAME object. Change `best` and `s` changes too.",
      },
    ],
    mistakes: [
      {
        wrong: "best = s   # хуулбар гэж бодов / expecting a copy",
        fix: "import copy\nbest = copy.copy(s)",
        why_mn:
          "Python-д оноолт хуулбарладаггүй. Жинхэнэ хуулбар хэрэгтэй бол `copy` модулийг ашигла.",
        why_en:
          "Assignment does not copy in Python. For a real copy, use the `copy` module.",
      },
    ],
    terms: [
      {
        term: "self",
        def_mn: "Метод доторх «энэ обьект».",
        def_en: "\"This object\", inside a method.",
      },
    ],
  },
  complexity: {
    code: `v = [4, 8, 15, 16, 23, 42]
n = len(v)

steps = 0
for i in range(n):
    steps += 1
print("one loop:", steps)

steps = 0
for i in range(n):
    for j in range(n):
        steps += 1
print("two loops:", steps)`,
    output: "one loop: 6\ntwo loops: 36",
    lines: [
      {
        code: "for i in range(n):",
        note_mn: "Нэг давталт — n удаа. Үүнийг O(n) гэдэг.",
        note_en: "One loop runs n times. We call that O(n).",
      },
      {
        code: "    for j in range(n):",
        note_mn:
          "Давталт дотор давталт — n × n удаа, O(n²). n=1000 бол нэг сая алхам.",
        note_en:
          "A loop inside a loop is n × n — O(n²). With n=1000 that is a million steps.",
      },
      {
        code: "steps = 0",
        note_mn:
          "Python-д тоолуур хэтрэхээс айх шаардлагагүй — бүхэл тоо хязгааргүй өснө.",
        note_en:
          "No overflow to worry about here — Python integers grow without limit.",
      },
    ],
    mistakes: [
      {
        wrong: "n = 100000 дээр хоёр давхар давталт / a double loop when n = 100000",
        fix: "Нэг давталт эсвэл эрэмбэлэлт / one pass, or a sort",
        why_mn:
          "Python нь C++-ээс УДААН. C++ дээр багтдаг O(n²) энд ихэвчлэн багтахгүй.",
        why_en:
          "Python is SLOWER than C++. An O(n²) that fits in C++ often will not fit here.",
      },
    ],
    terms: [
      {
        term: "O(n²)",
        def_mn: "Хоёр давхар давталт. n хоёр дахин ихсэхэд ажил дөрөв дахин нэмэгдэнэ.",
        def_en: "Two nested loops. Double n and the work goes up four times.",
      },
    ],
  },
  "arrays-in-functions": {
    code: `def add_one(v):
    for i in range(len(v)):
        v[i] = v[i] + 1        # changes the caller's list

def total(v):
    s = 0
    for x in v:
        s += x
    return s

nums = [1, 2, 3]
add_one(nums)
print(nums[0], nums[1], nums[2])
print(total(nums))`,
    output: "2 3 4\n9",
    lines: [
      {
        code: "def add_one(v):",
        note_mn:
          "Python-д `&` бичих шаардлагагүй — жагсаалт анхнаасаа хуулагдахгүй дамждаг.",
        note_en:
          "No `&` is needed in Python — a list is handed over without being copied.",
      },
      {
        code: "        v[i] = v[i] + 1",
        note_mn:
          "Нүдийг ШУУД өөрчилж байна. Функцээс гарсны дараа ч өөрчлөлт үлдэнэ.",
        note_en:
          "This changes the cell itself, and the change survives the function returning.",
      },
      {
        code: "    for x in v:",
        note_mn:
          "Зөвхөн уншиж байгаа тул `x` нүдний хуулбар байх нь асуудалгүй.",
        note_en:
          "Here we only read, so `x` being a copy of the value does not matter.",
      },
    ],
    mistakes: [
      {
        wrong: "for x in v:\n    x = x + 1",
        fix: "for i in range(len(v)):\n    v[i] = v[i] + 1",
        why_mn:
          "`x` бол нүдний хуулбар. Түүнийг өөрчлөхөд жагсаалт хэвээрээ үлдэнэ — C++-ийн `int&`-гүй давталттай яг ижил алдаа.",
        why_en:
          "`x` is a copy of the value. Changing it leaves the list untouched — the same trap as a C++ loop without `int&`.",
      },
    ],
    terms: [
      {
        term: "by reference",
        def_mn: "Жагсаалт, толь бичиг ингэж дамждаг — хуулбар үүсэхгүй.",
        def_en: "How lists and dictionaries are handed over — no copy is made.",
      },
    ],
  },
  "fast-io": {
    code: `import sys

nums = []
for line in sys.stdin:
    for word in line.split():
        nums.append(int(word))

print(len(nums), sum(nums))`,
    output: "(input: 10 20 5 15 10)\n5 60",
    lines: [
      {
        code: "import sys",
        note_mn:
          "`sys.stdin` нь оролтыг бүхэлд нь уншихад хэрэгтэй. Импортоо мартвал `NameError` гарна.",
        note_en:
          "`sys.stdin` is what you read the whole input through. Forget the import and you get `NameError`.",
      },
      {
        code: "for line in sys.stdin:",
        note_mn:
          "Оролт дуустал мөр мөрөөр уншина. C++-ийн `while (cin >> x)` -тэй ижил үүрэгтэй.",
        note_en:
          "Reads line by line until the input ends — the job C++ gives to `while (cin >> x)`.",
      },
      {
        code: "print(len(nums), sum(nums))",
        note_mn:
          "`sum` нь бэлэн байдаг. Python-д давталт бичихээсээ өмнө бэлэн функц байгаа эсэхийг хараарай.",
        note_en:
          "`sum` is built in. In Python, check for a ready-made function before writing the loop.",
      },
    ],
    mistakes: [
      {
        wrong: "for line in sys.stdin:   # import sys алга / no import sys",
        fix: "import sys",
        why_mn: "`sys` импортгүй бол эхний мөрөнд л `NameError` шидэнэ.",
        why_en: "Without importing `sys` it raises `NameError` on the very first line.",
      },
    ],
    terms: [
      {
        term: "sys.stdin",
        def_mn: "Оролтын урсгал. Мөр мөрөөр нь эргэж болно.",
        def_en: "The input stream. You can loop over it line by line.",
      },
    ],
  },
  "sorting-tools": {
    code: `v = [5, 2, 9, 1]
v.sort()
print(v)

students = [("Bat", 70), ("Suvd", 95), ("Tuul", 82)]
students.sort(key=lambda s: -s[1])
for name, score in students:
    print(name, end=" ")
print()`,
    output: "[1, 2, 5, 9]\nSuvd Tuul Bat",
    lines: [
      {
        code: "v.sort()",
        note_mn:
          "Жагсаалтыг ӨӨРИЙГ нь эрэмбэлнэ. Шинэ жагсаалт хэрэгтэй бол `sorted(v)`.",
        note_en:
          "Sorts the list in place. If you want a new list instead, use `sorted(v)`.",
      },
      {
        code: "students.sort(key=lambda s: -s[1])",
        note_mn:
          "Python-д харьцуулагч биш ТҮЛХҮҮР өгнө: «юугаар нь эрэмбэлэх вэ». Буурахаар бол хасах тэмдэг тавина.",
        note_en:
          "Python takes a KEY, not a comparator: \"sort by what?\". A minus sign flips it to descending.",
      },
      {
        code: "for name, score in students:",
        note_mn: "Кортежийг шууд задалж авч болно — C++-д илүү бичлэг шаардана.",
        note_en: "A tuple can be unpacked straight into two names, which C++ makes you spell out.",
      },
    ],
    mistakes: [
      {
        wrong: "v = v.sort()",
        fix: "v.sort()",
        why_mn:
          "`sort()` юу ч буцаадаггүй тул `v` нь `None` болно. Дараагийн мөрөнд `TypeError` гарна.",
        why_en:
          "`sort()` returns nothing, so `v` becomes `None`, and the next line raises `TypeError`.",
      },
    ],
    terms: [
      {
        term: "key=",
        def_mn: "Юугаар эрэмбэлэхийг хэлдэг функц.",
        def_en: "A function saying what to sort by.",
      },
    ],
  },
  "binary-search": {
    code: `def bsearch(v, target):
    lo, hi = 0, len(v) - 1
    while lo <= hi:
        mid = (lo + hi) // 2
        if v[mid] == target:
            return mid
        if v[mid] < target:
            lo = mid + 1
        else:
            hi = mid - 1
    return -1

v = [4, 8, 15, 16, 23, 42]
print(bsearch(v, 23))
print(bsearch(v, 5))`,
    output: "4\n-1",
    lines: [
      {
        code: "mid = (lo + hi) // 2",
        note_mn:
          "`//` заавал хэрэгтэй. `/` бичвэл `mid` бутархай болж, индекс болгон ашиглахад `TypeError` гарна.",
        note_en:
          "The `//` is essential. With `/`, `mid` becomes a fraction and using it as an index raises `TypeError`.",
      },
      {
        code: "        lo = mid + 1",
        note_mn: "`mid` шалгагдсан тул давхар оруулахгүй. C++-тэй ижил логик.",
        note_en: "`mid` has been checked, so it is left out. Same logic as in C++.",
      },
      {
        code: "    while lo <= hi:",
        note_mn: "`<=` — ганц элемент үлдсэн ч шалгах ёстой.",
        note_en: "`<=` because a range of one still needs checking.",
      },
    ],
    mistakes: [
      {
        wrong: "mid = (lo + hi) / 2",
        fix: "mid = (lo + hi) // 2",
        why_mn:
          "Python-д `/` үргэлж бутархай өгнө. `v[2.5]` гэж хандаж болохгүй.",
        why_en:
          "In Python `/` always gives a fraction, and `v[2.5]` is not a valid index.",
      },
    ],
    terms: [
      {
        term: "bisect",
        def_mn:
          "Python-д бэлэн модуль бий: `bisect.bisect_left(v, x)`. Тэмцээнд ашиглаж болно.",
        def_en:
          "Python ships a module for this: `bisect.bisect_left(v, x)`. It is contest-legal.",
      },
    ],
  },
  "binary-search-answer": {
    code: `def enough(boards, length, k):
    pieces = 0
    for b in boards:
        pieces += b // length
    return pieces >= k

boards = [8, 12, 5]
k = 4

lo, hi, best = 1, 12, 0
while lo <= hi:
    mid = (lo + hi) // 2
    if enough(boards, mid, k):
        best = mid
        lo = mid + 1
    else:
        hi = mid - 1

print(best)`,
    output: "5",
    lines: [
      {
        code: "        pieces += b // length",
        note_mn: "Бүхэл хуваалт `//`. Үлдэгдэл нь хаягдана.",
        note_en: "Whole-number division with `//`. The remainder is scrap.",
      },
      {
        code: "        best = mid",
        note_mn: "Болж байвал санаж аваад илүү ихийг оролдоно.",
        note_en: "If it works, remember it and try for more.",
      },
      {
        code: "lo, hi, best = 1, 12, 0",
        note_mn:
          "Python-д хэд хэдэн хувьсагчийг нэг мөрөнд онооно. `lo = 1` — 0 урттай хэсэг гэж байхгүй.",
        note_en:
          "Python assigns several names on one line. `lo = 1` because a piece of length 0 makes no sense.",
      },
    ],
    mistakes: [
      {
        wrong: "lo = 0",
        fix: "lo = 1",
        why_mn: "`b // 0` нь `ZeroDivisionError` шидэж програмыг зогсооно.",
        why_en: "`b // 0` raises `ZeroDivisionError` and stops the program.",
      },
    ],
    terms: [
      {
        term: "monotonic",
        def_mn: "Нэг чигт өөрчлөгдөх. Энэ арга ажиллах болзол.",
        def_en: "Changing in one direction only — the condition this method needs.",
      },
    ],
  },
  "prefix-sums": {
    code: `v = [3, 1, 4, 1, 5, 9]
n = len(v)

p = [0] * (n + 1)
for i in range(n):
    p[i + 1] = p[i] + v[i]

print(p[4] - p[1])     # v[1..3] = 1 + 4 + 1
print(p[6] - p[0])     # everything`,
    output: "6\n23",
    lines: [
      {
        code: "p = [0] * (n + 1)",
        note_mn:
          "Нэгээр урт. `p[0] = 0` нь «юу ч аваагүй» — хасалтыг цэвэрхэн болгоно.",
        note_en:
          "One longer than the list. `p[0] = 0` means \"nothing yet\", which keeps the subtraction clean.",
      },
      {
        code: "    p[i + 1] = p[i] + v[i]",
        note_mn: "Өмнөх нийлбэр дээр энэ элементийг нэмнэ.",
        note_en: "The previous total plus this element.",
      },
      {
        code: "print(p[4] - p[1])",
        note_mn:
          "Дүрэм: v[a..b] = p[b+1] - p[a]. Python-д нийлбэр хэтрэх аюул байхгүй.",
        note_en:
          "The rule: v[a..b] is p[b+1] - p[a]. In Python there is no overflow to fear.",
      },
    ],
    mistakes: [
      {
        wrong: "p[b] - p[a]",
        fix: "p[b + 1] - p[a]",
        why_mn: "b дугаар элементийг өөрийг нь оруулах ёстой.",
        why_en: "Element b itself has to be included.",
      },
    ],
    terms: [
      {
        term: "prefix sum",
        def_mn: "Эхнээс тухайн байрлал хүртэлх нийлбэр.",
        def_en: "The total from the start up to a position.",
      },
    ],
  },
  "stack-queue": {
    code: `from collections import deque

def balanced(s):
    st = []
    for c in s:
        if c == "(":
            st.append(c)
        elif c == ")":
            if not st:
                return False
            st.pop()
    return len(st) == 0

print("yes" if balanced("(()())") else "no")
print("yes" if balanced("(()") else "no")

line = deque()
line.append("Bat")
line.append("Suvd")
print(line[0])
line.popleft()
print(line[0])`,
    output: "yes\nno\nBat\nSuvd",
    lines: [
      {
        code: "st.append(c)",
        note_mn:
          "Python-д тусдаа стек байхгүй — энгийн жагсаалт `append`/`pop`-той нь стек болно.",
        note_en:
          "Python has no separate stack — a plain list with `append` and `pop` is one.",
      },
      {
        code: "st.pop()",
        note_mn:
          "C++-ЭЭС ЯЛГААТАЙ: Python-ы `pop()` утгыг БУЦААНА, зөвхөн хаядаггүй.",
        note_en:
          "DIFFERENT FROM C++: Python's `pop()` RETURNS the value, it does not only remove it.",
      },
      {
        code: "line.popleft()",
        note_mn:
          "Дараалалд `deque` хэрэглэ. Жагсаалтын `pop(0)` нь бүх зүйлийг шилжүүлдэг тул удаан.",
        note_en:
          "Use a `deque` for a queue. A list's `pop(0)` shifts everything along and is slow.",
      },
    ],
    mistakes: [
      {
        wrong: "line.pop(0)",
        fix: "line.popleft()   # deque",
        why_mn:
          "Жагсаалтаас эхний элементийг авах нь O(n). Том дараалал дээр програм удаашрана.",
        why_en:
          "Taking the front of a list is O(n). On a big queue that is what makes the program too slow.",
      },
    ],
    terms: [
      {
        term: "deque",
        def_mn: "Хоёр захаас нь хурдан нэмж хасдаг дараалал.",
        def_en: "A queue you can add to and take from at both ends, quickly.",
      },
    ],
  },
  "priority-queue": {
    code: `import heapq

big = []
heapq.heappush(big, -5)
heapq.heappush(big, -1)
heapq.heappush(big, -9)
print(-big[0])
heapq.heappop(big)
print(-big[0])

small = []
for x in (5, 1, 9):
    heapq.heappush(small, x)
print(small[0])`,
    output: "9\n5\n1",
    lines: [
      {
        code: "import heapq",
        note_mn:
          "Python-ы эрэмбэтэй дараалал. Энгийн жагсаалтыг овоолго болгон ажиллуулна.",
        note_en:
          "Python's priority queue. It works a plain list as a heap.",
      },
      {
        code: "heapq.heappush(big, -5)",
        note_mn:
          "ЭСРЭГЭЭР: `heapq` нь ҮРГЭЛЖ ХАМГИЙН БАГЫГ дээрээ барина. Хамгийн ихийг авахын тулд утгыг сөрөг болгож хийдэг заншилтай.",
        note_en:
          "THE OPPOSITE OF C++: `heapq` always keeps the SMALLEST on top. To get the largest, the trick is to store negatives.",
      },
      {
        code: "print(small[0])",
        note_mn: "`small[0]` бол дээд тал. `top()` гэсэн функц байхгүй.",
        note_en: "`small[0]` is the top. There is no `top()` function.",
      },
    ],
    mistakes: [
      {
        wrong: "heapq нь хамгийн ихийг өгнө гэж бодох / expecting heapq to give the largest",
        fix: "Сөрөг болгож хий / push negatives",
        why_mn:
          "C++-ийн `priority_queue` анхдагчаараа хамгийн их, Python-ы `heapq` хамгийн бага. Яг эсрэг.",
        why_en:
          "C++'s `priority_queue` defaults to largest, Python's `heapq` to smallest. Exactly opposite.",
      },
    ],
    terms: [
      {
        term: "heapq",
        def_mn: "Хамгийн БАГА нь дээрээ байдаг овоолго.",
        def_en: "A heap that keeps the SMALLEST on top.",
      },
    ],
  },
  "two-pointers": {
    code: `v = [1, 3, 4, 7, 11]
target = 10

lo, hi = 0, len(v) - 1
found = False
while lo < hi:
    s = v[lo] + v[hi]
    if s == target:
        print(v[lo], v[hi])
        found = True
        break
    if s < target:
        lo += 1
    else:
        hi -= 1

if not found:
    print("none")`,
    output: "3 7",
    lines: [
      {
        code: "lo, hi = 0, len(v) - 1",
        note_mn: "Хоёр заагч — хамгийн бага ба хамгийн их дээр.",
        note_en: "Two pointers — one on the smallest, one on the largest.",
      },
      {
        code: "    if s < target:",
        note_mn: "Бага байвал зүүн заагчийг баруун тийш зөөнө.",
        note_en: "Too small, so move the left pointer right.",
      },
      {
        code: "while lo < hi:",
        note_mn: "`<` — нэг элементийг өөртэй нь хослуулж болохгүй.",
        note_en: "`<`, so an element is never paired with itself.",
      },
    ],
    mistakes: [
      {
        wrong: "Эрэмбэлэгдээгүй жагсаалт дээр / on an unsorted list",
        fix: "v.sort() эхлээд / v.sort() first",
        why_mn: "Эрэмбэгүй бол «их байвал багасга» гэсэн шийдвэр утгагүй.",
        why_en: "Unsorted, \"too big, shrink it\" is not a valid move.",
      },
    ],
    terms: [
      {
        term: "two pointers",
        def_mn: "Хоёр индекс нэг жагсаалт дээр зэрэг хөдлөх арга.",
        def_en: "Two indices moving along one list together.",
      },
    ],
  },
  greedy: {
    code: `def coins(amount, values):
    used = 0
    for v in values:
        while amount >= v:
            amount -= v
            used += 1
    return used

mnt = [500, 100, 50, 10]
print(coins(680, mnt))

odd = [4, 3, 1]
print(coins(6, odd))        # greedy: 4+1+1 = 3 coins
print("best is 2 (3+3)")`,
    output: "6\n3\nbest is 2 (3+3)",
    lines: [
      {
        code: "    for v in values:",
        note_mn: "Утгууд ИХЭЭС БАГА руу эрэмбэлэгдсэн байх ёстой.",
        note_en: "The values must be in order, largest first.",
      },
      {
        code: "            amount -= v",
        note_mn: "`amount = amount - v`-ийн богино хэлбэр.",
        note_en: "Short for `amount = amount - v`.",
      },
      {
        code: "print(coins(6, odd))",
        note_mn:
          "4, 3, 1 дэвсгэртээр 6-г шуналтаар 3 зоос болгоно. Гэтэл 3 + 3 = 2 зоос хангалттай.",
        note_en:
          "With coins 4, 3, 1 greedy makes 6 from three coins. But 3 + 3 needs only two.",
      },
    ],
    mistakes: [
      {
        wrong: "Шуналт арга үргэлж зөв гэж үзэх / assuming greedy is always right",
        fix: "Эсрэг жишээ хайх / hunt for a counterexample",
        why_mn: "Монголын дэвсгэрт дээр ажиллана, {4,3,1} дээр ажиллахгүй.",
        why_en: "It works for real money and fails on coins {4,3,1}.",
      },
    ],
    terms: [
      {
        term: "greedy",
        def_mn: "Одоогийн хамгийн сайныг сонгож, эргэж эргэлзэхгүй арга.",
        def_en: "Taking the locally best option and never reconsidering.",
      },
    ],
  },
  backtracking: {
    code: `def permute(v, used, cur):
    if len(cur) == len(v):
        print("".join(str(x) for x in cur), end=" ")
        return
    for i in range(len(v)):
        if used[i]:
            continue
        used[i] = True
        cur.append(v[i])

        permute(v, used, cur)

        cur.pop()
        used[i] = False

permute([1, 2, 3], [False] * 3, [])
print()`,
    output: "123 132 213 231 312 321",
    lines: [
      {
        code: "        cur.append(v[i])",
        note_mn: "Сонголт хийж байна.",
        note_en: "Making a choice.",
      },
      {
        code: "        cur.pop()",
        note_mn:
          "БУЦААЖ АВЧ БАЙНА. Үүнийг мартвал дараагийн салаа буруу төлөвөөс эхэлнэ.",
        note_en:
          "UNDOING it. Forget this and the next branch starts from a wrong state.",
      },
      {
        code: 'print("".join(str(x) for x in cur), end=" ")',
        note_mn:
          "`join` нь жагсаалтыг нэг мөр болгоно. Эхлээд `str()`-ээр тоо бүрийг бичвэр болгох ёстой.",
        note_en:
          "`join` glues a list into one string. Each number has to be made text with `str()` first.",
      },
    ],
    mistakes: [
      {
        wrong: "permute(v, used, cur)   # cur.pop() алга / no cur.pop()",
        fix: "cur.pop() after the call",
        why_mn: "Буцааж авахгүй бол `cur` уртсаад л явна.",
        why_en: "Without the undo, `cur` only ever grows.",
      },
    ],
    terms: [
      {
        term: "backtracking",
        def_mn: "Сонго → гүнзгийр → буцааж ав.",
        def_en: "Choose, go deeper, then undo.",
      },
    ],
  },
  "dp-intro": {
    code: `calls = 0
memo = {}

def fib(n):
    global calls
    calls += 1
    if n <= 1:
        return n
    if n in memo:
        return memo[n]
    memo[n] = fib(n - 1) + fib(n - 2)
    return memo[n]

print(fib(30))
print(calls)`,
    output: "832040\n59",
    lines: [
      {
        code: "memo = {}",
        note_mn:
          "Python-д толь бичиг хэрэглэхэд амар: `-1`-ээр дүүргэх шаардлагагүй, `in`-ээр шалгана.",
        note_en:
          "A dictionary is easier here: no filling with `-1`, you just ask `in`.",
      },
      {
        code: "    if n in memo:",
        note_mn:
          "Өмнө бодсон бол шууд буцаана. Энэ ГАНЦ шалгалт 1.6 сая дуудалтыг 59 болгож байна.",
        note_en:
          "Already known, so return it. This ONE check turns 1.6 million calls into 59.",
      },
      {
        code: "    global calls",
        note_mn:
          "Функц доторх гадаад хувьсагчийг ӨӨРЧЛӨХ гэж байвал `global` гэж зарлана. Зөвхөн уншихад хэрэггүй.",
        note_en:
          "To CHANGE an outside variable from inside a function you must declare it `global`. Reading it needs nothing.",
      },
    ],
    mistakes: [
      {
        wrong: "calls += 1   # global алга / no global",
        fix: "global calls",
        why_mn:
          "`global`-гүй бол Python шинэ дотоод хувьсагч гэж үзээд `UnboundLocalError` шидэнэ.",
        why_en:
          "Without `global`, Python treats it as a new local and raises `UnboundLocalError`.",
      },
    ],
    terms: [
      {
        term: "memoization",
        def_mn: "Бодсон хариугаа санаж хадгалах.",
        def_en: "Remembering an answer you already worked out.",
      },
      {
        term: "lru_cache",
        def_mn:
          "Python-д `functools.lru_cache` нь үүнийг автоматаар хийдэг.",
        def_en: "Python's `functools.lru_cache` does all of this for you.",
      },
    ],
  },
  "dp-1d": {
    code: `n = 6
ways = [0] * (n + 1)

ways[0] = 1
ways[1] = 1
for i in range(2, n + 1):
    ways[i] = ways[i - 1] + ways[i - 2]

print(*ways)
print(ways[n])`,
    output: "1 1 2 3 5 8 13\n13",
    lines: [
      {
        code: "ways[0] = 1",
        note_mn: "Хамгийн жижиг тохиолдол: 0 шат гарах ганц арга бий.",
        note_en: "The smallest case: exactly one way to climb no stairs.",
      },
      {
        code: "    ways[i] = ways[i - 1] + ways[i - 2]",
        note_mn: "i-р шатанд i-1 эсвэл i-2-оос ирнэ.",
        note_en: "You reach stair i from i-1 or from i-2.",
      },
      {
        code: "print(*ways)",
        note_mn:
          "`*` нь жагсаалтыг задалж, элемент бүрийг тусад нь дамжуулна — хооронд нь зай тавьж хэвлэнэ.",
        note_en:
          "The `*` unpacks the list into separate arguments, so they print space-separated.",
      },
    ],
    mistakes: [
      {
        wrong: "ways = [0] * n",
        fix: "ways = [0] * (n + 1)",
        why_mn:
          "`ways[n]` рүү хандах тул n+1 нүд хэрэгтэй. Үгүй бол `IndexError`.",
        why_en:
          "You index `ways[n]`, so you need n+1 cells. Otherwise `IndexError`.",
      },
    ],
    terms: [
      {
        term: "bottom-up",
        def_mn: "Жижигээс нь эхэлж хүснэгт дүүргэх арга.",
        def_en: "Filling the table from the smallest case upwards.",
      },
    ],
  },
  "dp-grid": {
    code: `rows, cols = 3, 4
paths = [[0] * cols for _ in range(rows)]

for r in range(rows):
    for c in range(cols):
        if r == 0 and c == 0:
            paths[r][c] = 1
        else:
            from_up = paths[r - 1][c] if r > 0 else 0
            from_left = paths[r][c - 1] if c > 0 else 0
            paths[r][c] = from_up + from_left

for row in paths:
    print(*row)`,
    output: "1 1 1 1\n1 2 3 4\n1 3 6 10",
    lines: [
      {
        code: "paths = [[0] * cols for _ in range(rows)]",
        note_mn:
          "Мөр бүрийг ТУСАД нь үүсгэнэ. `[[0]*cols]*rows` гэвэл бүх мөр нэг л жагсаалт болно.",
        note_en:
          "Each row is built SEPARATELY. `[[0]*cols]*rows` would make every row the same list.",
      },
      {
        code: "            from_up = paths[r - 1][c] if r > 0 else 0",
        note_mn:
          "Python-д `paths[-1]` нь СҮҮЛИЙН мөрийг өгнө — алдаа заахгүй, чимээгүй буруу хариу гарна. Тийм учраас `if r > 0` заавал хэрэгтэй.",
        note_en:
          "In Python `paths[-1]` is the LAST row — no error, just a silently wrong answer. That is why the `if r > 0` guard matters more here than in C++.",
      },
      {
        code: "    print(*row)",
        note_mn: "Мөр бүрийг зайгаар тусгаарлан хэвлэнэ.",
        note_en: "Prints one row, space-separated.",
      },
    ],
    mistakes: [
      {
        wrong: "paths[r - 1][c]   # шалгалтгүй / unguarded",
        fix: "paths[r - 1][c] if r > 0 else 0",
        why_mn:
          "r = 0 үед сөрөг индекс сүүлийн мөрийг уншиж, буруу хариуг чимээгүйхэн өгнө.",
        why_en:
          "At r = 0 the negative index reads the last row and quietly produces a wrong answer.",
      },
    ],
    terms: [
      {
        term: "negative index",
        def_mn: "Python-д `a[-1]` бол сүүлийн элемент. Алдаа биш.",
        def_en: "In Python `a[-1]` is the last element. It is not an error.",
      },
    ],
  },
  "graphs-intro": {
    code: `n = 5
adj = [[] for _ in range(n)]

adj[0].append(1); adj[1].append(0)
adj[0].append(2); adj[2].append(0)
adj[1].append(3); adj[3].append(1)

for v in range(n):
    print(str(v) + ":", *adj[v])`,
    output: "0: 1 2\n1: 0 3\n2: 0\n3: 1\n4:",
    lines: [
      {
        code: "adj = [[] for _ in range(n)]",
        note_mn:
          "Цэг бүрд ТУСДАА хоосон жагсаалт. `[[]] * n` гэвэл бүгд нэг жагсаалт болно.",
        note_en:
          "A SEPARATE empty list per node. `[[]] * n` would make them all the same list.",
      },
      {
        code: "adj[0].append(1); adj[1].append(0)",
        note_mn: "Чиглэлгүй холбоосыг хоёр талд нь бичнэ.",
        note_en: "An undirected edge is written on both sides.",
      },
      {
        code: 'print(str(v) + ":", *adj[v])',
        note_mn: "Хоосон жагсаалтыг задлахад юу ч хэвлэгдэхгүй — 4-р цэг хоосон гарна.",
        note_en: "Unpacking an empty list prints nothing, which is why node 4 comes out bare.",
      },
    ],
    mistakes: [
      {
        wrong: "adj = [[]] * n",
        fix: "adj = [[] for _ in range(n)]",
        why_mn:
          "Эхнийх нь БҮХ цэгт нэг жагсаалт өгнө. Нэг холбоос нэмэхэд бүх цэгт нэмэгдэнэ.",
        why_en:
          "The first gives EVERY node the same list. Add one edge and every node gets it.",
      },
    ],
    terms: [
      {
        term: "adjacency list",
        def_mn: "Цэг бүрд хөршүүдийг нь жагсаасан бүтэц.",
        def_en: "The structure listing each node's neighbours.",
      },
    ],
  },
  dfs: {
    code: `import sys
sys.setrecursionlimit(10000)

n = 6
adj = [[] for _ in range(n)]
seen = [False] * n

adj[0].append(1); adj[1].append(0)
adj[1].append(2); adj[2].append(1)
adj[3].append(4); adj[4].append(3)

def dfs(v):
    seen[v] = True
    for to in adj[v]:
        if not seen[to]:
            dfs(to)

groups = 0
for v in range(n):
    if not seen[v]:
        groups += 1
        dfs(v)

print(groups)`,
    output: "3",
    lines: [
      {
        code: "sys.setrecursionlimit(10000)",
        note_mn:
          "Python-ы рекурсийн анхдагч хязгаар ойролцоогоор 1000. Граф том бол үүнийг нэмэх ёстой — C++-д ийм тохиргоо байхгүй.",
        note_en:
          "Python's recursion limit is about 1000 by default. On a larger graph you must raise it — C++ has no such setting.",
      },
      {
        code: "    seen[v] = True",
        note_mn: "ХАМГИЙН ЭХЭНД тэмдэглэнэ, эс бөгөөс мөчлөг дээр эргэлдэнэ.",
        note_en: "Mark it FIRST, or a cycle sends it round forever.",
      },
      {
        code: "        groups += 1",
        note_mn: "Шинэ эхлэл цэг = шинэ бүлэг. 0-1-2, 3-4, 5 — нийт 3.",
        note_en: "A fresh start means a new group. 0-1-2, then 3-4, then 5 — three.",
      },
    ],
    mistakes: [
      {
        wrong: "setrecursionlimit алга / no setrecursionlimit",
        fix: "sys.setrecursionlimit(300000)",
        why_mn:
          "Гүн граф дээр `RecursionError` гарна. C++-д ийм асуудал ховор тул амархан мартдаг.",
        why_en:
          "A deep graph raises `RecursionError`. It is easy to forget because C++ rarely hits it.",
      },
    ],
    terms: [
      {
        term: "recursion limit",
        def_mn: "Python-ы дуудалтын гүний хязгаар. Анхдагчаар ~1000.",
        def_en: "Python's cap on call depth. About 1000 by default.",
      },
    ],
  },
  bfs: {
    code: `from collections import deque

rows, cols = 3, 4
dist = [[-1] * cols for _ in range(rows)]

q = deque()
dist[0][0] = 0
q.append((0, 0))

dr = [-1, 1, 0, 0]
dc = [0, 0, -1, 1]

while q:
    r, c = q.popleft()
    for k in range(4):
        nr, nc = r + dr[k], c + dc[k]
        if nr < 0 or nr >= rows or nc < 0 or nc >= cols:
            continue
        if dist[nr][nc] != -1:
            continue
        dist[nr][nc] = dist[r][c] + 1
        q.append((nr, nc))

print(dist[2][3])`,
    output: "5",
    lines: [
      {
        code: "q = deque()",
        note_mn:
          "Жагсаалт биш `deque`. `pop(0)` нь O(n) тул том хүснэгт дээр програм удаашрана.",
        note_en:
          "A `deque`, not a list. A list's `pop(0)` is O(n) and will make a big grid too slow.",
      },
      {
        code: "    r, c = q.popleft()",
        note_mn: "Кортежийг шууд хоёр нэр рүү задална.",
        note_en: "The tuple unpacks straight into two names.",
      },
      {
        code: "        if nr < 0 or nr >= rows or nc < 0 or nc >= cols:",
        note_mn:
          "Хязгаарыг ЭХЛЭЭД шалгана. Python-д сөрөг индекс алдаа заахгүй тул энэ шалгалт бүр ч чухал.",
        note_en:
          "Check the bounds FIRST. It matters even more in Python, where a negative index does not error.",
      },
    ],
    mistakes: [
      {
        wrong: "q = []  ...  q.pop(0)",
        fix: "from collections import deque",
        why_mn: "Жагсаалтын эхнээс авах нь удаан. Том хүснэгт дээр TLE гарна.",
        why_en: "Taking from the front of a list is slow, and gives TLE on a big grid.",
      },
    ],
    terms: [
      {
        term: "deque",
        def_mn: "Хоёр захаас нь хурдан нэмж хасдаг дараалал.",
        def_en: "A queue that is fast at both ends.",
      },
    ],
  },
  dijkstra: {
    code: `import heapq

n = 4
adj = [[] for _ in range(n)]
adj[0].append((1, 1))
adj[0].append((2, 8))
adj[1].append((2, 2))
adj[2].append((3, 3))

INF = float("inf")
dist = [INF] * n
dist[0] = 0

pq = [(0, 0)]
while pq:
    d, v = heapq.heappop(pq)
    if d > dist[v]:
        continue
    for to, cost in adj[v]:
        if dist[v] + cost < dist[to]:
            dist[to] = dist[v] + cost
            heapq.heappush(pq, (dist[to], to))

print(dist[3])`,
    output: "6",
    lines: [
      {
        code: 'INF = float("inf")',
        note_mn:
          "Python-д жинхэнэ хязгааргүй бий. Том тоо сонгох шаардлагагүй бөгөөд нэмэхэд хэтрэхгүй.",
        note_en:
          "Python has a real infinity. No need to pick a big number, and adding to it never overflows.",
      },
      {
        code: "pq = [(0, 0)]",
        note_mn:
          "Кортежийн ЭХНИЙ утга нь зай. `heapq` эхний утгаар нь эрэмбэлдэг.",
        note_en:
          "Distance goes FIRST in the tuple, because `heapq` orders on the first value.",
      },
      {
        code: "    if d > dist[v]:",
        note_mn: "Хуучирсан бичлэгийг алгасна.",
        note_en: "Skip a stale entry.",
      },
    ],
    mistakes: [
      {
        wrong: "heapq.heappush(pq, (to, dist[to]))",
        fix: "heapq.heappush(pq, (dist[to], to))",
        why_mn: "Солиод бичвэл цэгийн дугаараар эрэмбэлж, алгоритм утгагүй болно.",
        why_en: "Swapped, it orders by node number and the algorithm means nothing.",
      },
    ],
    terms: [
      {
        term: "float(\"inf\")",
        def_mn: "Хязгааргүй их. Аль ч тооноос том.",
        def_en: "Infinity. Larger than any number.",
      },
    ],
  },
  classes: {
    code: `class Student:
    def __init__(self):
        self._name = ""
        self._score = 0

    def set(self, n, s):
        self._name = n
        if s < 0:
            s = 0
        if s > 100:
            s = 100
        self._score = s

    def get(self):
        return self._score

a = Student()
a.set("Bat", 150)
print(a.get())

a.set("Bat", 72)
print(a.get())`,
    output: "100\n72",
    lines: [
      {
        code: "        self._score = 0",
        note_mn:
          "Доогуур зураас нь «гаднаас бүү хүр» гэсэн ЗАНШИЛ. Python үүнийг албадан хориглодоггүй — C++-ийн `private`-ээс ялгаатай.",
        note_en:
          "The underscore is a CONVENTION meaning \"do not touch from outside\". Python does not enforce it — unlike C++'s `private`.",
      },
      {
        code: "        if s > 100:",
        note_mn: "Дүрэм нь ижилхэн ажиллана. Утга үргэлж 0-100 хооронд байна.",
        note_en: "The rule works the same. The value always lands between 0 and 100.",
      },
      {
        code: "    def set(self, n, s):",
        note_mn: "Метод бүрийн эхний параметр нь `self` байх ёстой.",
        note_en: "Every method takes `self` as its first parameter.",
      },
    ],
    mistakes: [
      {
        wrong: "a._score = 150",
        fix: "a.set(\"Bat\", 150)",
        why_mn:
          "Python үүнийг ЗӨВШӨӨРНӨ — дүрмийг тойрч гарна. Хамгаалалт нь зөвхөн заншил.",
        why_en:
          "Python ALLOWS this, bypassing the rule. The protection is only a convention.",
      },
    ],
    terms: [
      {
        term: "_name",
        def_mn: "«Дотоод» гэсэн заншлын тэмдэг. Албадлага биш.",
        def_en: "A conventional mark for \"internal\". Not enforced.",
      },
    ],
  },
  "class-methods": {
    code: `class Rect:
    def __init__(self, width, height):
        self.w = width
        self.h = height

    def area(self):
        return self.w * self.h

    def perimeter(self):
        return 2 * (self.w + self.h)

r = Rect(3, 4)
print(r.area())
print(r.perimeter())

small = Rect(2, 2)
print(small.area())`,
    output: "12\n14\n4",
    lines: [
      {
        code: "    def __init__(self, width, height):",
        note_mn:
          "`__init__` бол Python-ы байгуулагч. Нэр нь классын нэртэй ижил БИШ — үргэлж `__init__`.",
        note_en:
          "`__init__` is Python's constructor. It is NOT named after the class — always `__init__`.",
      },
      {
        code: "        self.w = width",
        note_mn: "Талбарыг `self.` -ээр үүсгэнэ. Урьдчилж зарлах шаардлагагүй.",
        note_en: "Fields are made with `self.`. You never declare them ahead of time.",
      },
      {
        code: "print(r.area())",
        note_mn:
          "Дуудахдаа `self` бичихгүй — Python өөрөө дамжуулна.",
        note_en:
          "You do not pass `self` when calling — Python supplies it.",
      },
    ],
    mistakes: [
      {
        wrong: "def area():",
        fix: "def area(self):",
        why_mn:
          "`self` -ийг мартвал `TypeError: area() takes 0 positional arguments but 1 was given`.",
        why_en:
          "Forget `self` and you get `TypeError: area() takes 0 positional arguments but 1 was given`.",
      },
    ],
    terms: [
      {
        term: "__init__",
        def_mn: "Обьект үүсэх үед автоматаар ажиллах метод.",
        def_en: "The method that runs automatically when an object is made.",
      },
    ],
  },
  "operator-overload": {
    code: `class Student:
    def __init__(self, name, score):
        self.name = name
        self.score = score

    def __lt__(self, other):
        return self.score > other.score

v = [Student("Bat", 70), Student("Suvd", 95), Student("Tuul", 82)]
v.sort()
for s in v:
    print(s.name, s.score)`,
    output: "Suvd 95\nTuul 82\nBat 70",
    lines: [
      {
        code: "    def __lt__(self, other):",
        note_mn:
          "`__lt__` бол Python-ы `operator<`. `sort()` үүнийг өөрөө олж хэрэглэнэ.",
        note_en:
          "`__lt__` is Python's `operator<`. `sort()` finds and uses it by itself.",
      },
      {
        code: "        return self.score > other.score",
        note_mn: "`>` тул өндөр оноо түрүүлнэ. C++-тэй яг ижил заль.",
        note_en: "A `>` puts higher scores first — the same trick as in C++.",
      },
      {
        code: "v.sort()",
        note_mn:
          "Practice: Python-д ихэвчлэн `v.sort(key=lambda s: -s.score)` гэж бичдэг. `__lt__` нь эрэмбэ обьектын ӨӨРИЙНХ нь шинж чанар үед тохиромжтой.",
        note_en:
          "In practice Python usually writes `v.sort(key=lambda s: -s.score)`. `__lt__` fits when the ordering is a property of the object itself.",
      },
    ],
    mistakes: [
      {
        wrong: "def __lt__(self, other): return self.score >= other.score",
        fix: "return self.score > other.score",
        why_mn:
          "Тэнцүү үед `True` буцаах нь эрэмбийг тодорхойгүй болгоно. C++-ийн адил дүрэм.",
        why_en:
          "Returning True for equals makes the order undefined — the same rule as in C++.",
      },
    ],
    terms: [
      {
        term: "__lt__",
        def_mn: "«Бага уу?» гэсэн асуултад хариулах тусгай метод.",
        def_en: "The special method answering \"is this less than that?\".",
      },
    ],
  },
};
