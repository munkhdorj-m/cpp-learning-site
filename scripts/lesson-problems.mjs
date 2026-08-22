// Practice problems for the Learn lessons that had none.
//
// Each lesson in the course should have something to solve straight after
// reading it. These are deliberately small: the point is to use the one idea
// the lesson just taught, not to be clever.
//
// `tags` decides which lesson a problem is filed under — see lib/problem-topics.ts.
// Expected outputs are NOT written here: the seeder compiles `reference_cpp`
// and runs it, so the answers cannot disagree with the statement.

export const LESSON_PROBLEMS = [
  // ─────────── Your First Program ───────────
  {
    slug: "say-hello-cpp",
    title_mn: "Сайн уу, C++!",
    title_en: "Hello, C++!",
    statement_mn: "Дэлгэцэн дээр яг `Hello, C++!` гэж хэвлэ.",
    statement_en: "Print exactly `Hello, C++!` on the screen.",
    input_format_mn: "Оролт байхгүй.",
    input_format_en: "No input.",
    output_format_mn: "Нэг мөр: `Hello, C++!`",
    output_format_en: "One line: `Hello, C++!`",
    tags: ["intro"],
    samples: [{ input: "" }],
    extra_inputs: [],
    reference_cpp: `#include <iostream>
int main(){ std::cout << "Hello, C++!\\n"; }`,
  },
  {
    slug: "three-line-message",
    title_mn: "Гурван мөр",
    title_en: "Three Lines",
    statement_mn:
      "Дараах гурван мөрийг яг энэ дарааллаар хэвлэ:\n\n```\nMy name is Bat\nI am 14 years old\nI am learning C++\n```",
    statement_en:
      "Print these three lines, in this order:\n\n```\nMy name is Bat\nI am 14 years old\nI am learning C++\n```",
    input_format_mn: "Оролт байхгүй.",
    input_format_en: "No input.",
    output_format_mn: "Гурван мөр.",
    output_format_en: "Three lines.",
    tags: ["intro"],
    samples: [{ input: "" }],
    extra_inputs: [],
    reference_cpp: `#include <iostream>
int main(){
    std::cout << "My name is Bat\\n";
    std::cout << "I am 14 years old\\n";
    std::cout << "I am learning C++\\n";
}`,
  },
  {
    slug: "small-square-of-stars",
    title_mn: "Одон дөрвөлжин",
    title_en: "Square of Stars",
    statement_mn:
      "3 мөр, мөр бүрд 3 од (`*`) байх дөрвөлжин хэвлэ. Давталт хэрэглэх шаардлагагүй — гурван удаа хэвлэхэд хангалттай.",
    statement_en:
      "Print a square of 3 rows, each row containing 3 stars (`*`). You do not need a loop — three print statements is enough.",
    input_format_mn: "Оролт байхгүй.",
    input_format_en: "No input.",
    output_format_mn: "Гурван мөр, тус бүр `***`.",
    output_format_en: "Three lines, each `***`.",
    tags: ["intro"],
    samples: [{ input: "" }],
    extra_inputs: [],
    reference_cpp: `#include <iostream>
int main(){
    std::cout << "***\\n";
    std::cout << "***\\n";
    std::cout << "***\\n";
}`,
  },

  // ─────────── Printing More ───────────
  {
    slug: "print-with-tabs",
    title_mn: "Табаар тусгаарлах",
    title_en: "Separate with Tabs",
    statement_mn:
      "`Name`, `Age`, `City` гэсэн гурван үгийг таб (`\\t`) тэмдэгтээр тусгаарлан нэг мөрөнд хэвлэ.",
    statement_en:
      "Print the three words `Name`, `Age`, `City` on one line, separated by tab characters (`\\t`).",
    input_format_mn: "Оролт байхгүй.",
    input_format_en: "No input.",
    output_format_mn: "Нэг мөр, табаар тусгаарласан гурван үг.",
    output_format_en: "One line with the three words separated by tabs.",
    tags: ["printing"],
    samples: [{ input: "" }],
    extra_inputs: [],
    reference_cpp: `#include <iostream>
int main(){ std::cout << "Name\\tAge\\tCity\\n"; }`,
  },
  {
    slug: "print-a-quote",
    title_mn: "Хашилт хэвлэх",
    title_en: "Print a Quote",
    statement_mn:
      'Яг дараах мөрийг хэвлэ (хашилт нь гарах ёстой):\n\n```\nShe said "hello" and left\n```',
    statement_en:
      'Print exactly this line, with the quote marks showing:\n\n```\nShe said "hello" and left\n```',
    input_format_mn: "Оролт байхгүй.",
    input_format_en: "No input.",
    output_format_mn: "Нэг мөр.",
    output_format_en: "One line.",
    tags: ["printing"],
    samples: [{ input: "" }],
    extra_inputs: [],
    reference_cpp: `#include <iostream>
int main(){ std::cout << "She said \\"hello\\" and left\\n"; }`,
  },
  {
    slug: "label-and-value",
    title_mn: "Шошго ба утга",
    title_en: "Label and Value",
    statement_mn:
      "Бүхэл тоо `n` уншиж, `The answer is n` хэлбэрээр хэвлэ. Жишээ нь `n = 42` бол `The answer is 42` гэж гарна.",
    statement_en:
      "Read an integer `n` and print `The answer is n`. For example, if `n = 42` the output is `The answer is 42`.",
    input_format_mn: "Нэг бүхэл тоо.",
    input_format_en: "A single integer.",
    output_format_mn: "Нэг мөр.",
    output_format_en: "One line.",
    tags: ["printing"],
    samples: [{ input: "42\n" }],
    extra_inputs: ["0\n", "-7\n", "1000\n", "1\n"],
    reference_cpp: `#include <iostream>
int main(){ long long n; std::cin >> n; std::cout << "The answer is " << n << "\\n"; }`,
  },

  // ─────────── Variables ───────────
  {
    slug: "swap-two-numbers",
    title_mn: "Хоёр тоог солих",
    title_en: "Swap Two Numbers",
    statement_mn:
      "Хоёр бүхэл тоо уншаад, эсрэг дарааллаар нь хэвлэ. Гуравдахь хувьсагч ашиглан утгыг нь сольж үзээрэй.",
    statement_en:
      "Read two integers and print them in the opposite order. Try doing it by swapping them with a third variable.",
    input_format_mn: "Нэг мөрөнд хоёр бүхэл тоо `a` ба `b`.",
    input_format_en: "Two integers `a` and `b` on one line.",
    output_format_mn: "`b` ба `a`-г зайгаар тусгаарлан хэвлэ.",
    output_format_en: "Print `b` then `a`, separated by a space.",
    tags: ["swap"],
    samples: [{ input: "3 8\n" }],
    extra_inputs: ["-5 5\n", "0 0\n", "100 1\n", "7 7\n", "-1 -9\n"],
    reference_cpp: `#include <iostream>
int main(){ long long a,b; std::cin>>a>>b; long long t=a; a=b; b=t; std::cout<<a<<" "<<b<<"\\n"; }`,
  },
  {
    slug: "age-next-year",
    title_mn: "Ирэх жилийн нас",
    title_en: "Age Next Year",
    statement_mn:
      "Насыг уншаад, одоогийн нас болон ирэх жилийн насыг хоёр мөрөнд хэвлэ.",
    statement_en:
      "Read an age and print the current age and next year's age, on two lines.",
    input_format_mn: "Нэг бүхэл тоо — нас.",
    input_format_en: "A single integer — the age.",
    output_format_mn: "Хоёр мөр: одоогийн нас, дараа нь нас дээр нэмэгдсэн 1.",
    output_format_en: "Two lines: the age, then the age plus one.",
    tags: ["variables"],
    samples: [{ input: "14\n" }],
    extra_inputs: ["0\n", "7\n", "99\n", "13\n"],
    reference_cpp: `#include <iostream>
int main(){ long long a; std::cin>>a; long long next=a+1; std::cout<<a<<"\\n"<<next<<"\\n"; }`,
  },
  {
    slug: "rectangle-from-variables",
    title_mn: "Тэгш өнцөгтийн талбай",
    title_en: "Rectangle Area",
    statement_mn:
      "Тэгш өнцөгтийн өргөн, өндрийг уншаад талбайг нь ол. Өргөн, өндрийг тус тусад нь хувьсагчид хадгал.",
    statement_en:
      "Read the width and height of a rectangle and print its area. Store the width and height in their own variables.",
    input_format_mn: "Хоёр бүхэл тоо: өргөн, өндөр.",
    input_format_en: "Two integers: width and height.",
    output_format_mn: "Талбайг нэг мөрөнд хэвлэ.",
    output_format_en: "Print the area on one line.",
    tags: ["variables"],
    samples: [{ input: "4 5\n" }],
    extra_inputs: ["1 1\n", "10 10\n", "7 3\n", "100 250\n", "0 9\n"],
    reference_cpp: `#include <iostream>
int main(){ long long w,h; std::cin>>w>>h; std::cout<<w*h<<"\\n"; }`,
  },

  // ─────────── Other Types ───────────
  {
    slug: "average-of-two-decimals",
    title_mn: "Хоёр тооны дундаж",
    title_en: "Average of Two",
    statement_mn:
      "Хоёр бүхэл тоо уншаад дундажийг нь **аравтын 2 оронтой** хэвлэ. Дундаж бүхэл биш байж болохыг санаарай.",
    statement_en:
      "Read two integers and print their average to **2 decimal places**. Remember the average may not be a whole number.",
    input_format_mn: "Хоёр бүхэл тоо.",
    input_format_en: "Two integers.",
    output_format_mn: "Дундаж, аравтын 2 оронтой.",
    output_format_en: "The average, with 2 digits after the point.",
    tags: ["floating-point"],
    samples: [{ input: "3 4\n" }],
    extra_inputs: ["10 10\n", "-3 3\n", "1 2\n", "7 8\n", "0 5\n"],
    reference_cpp: `#include <cstdio>
int main(){ long long a,b; scanf("%lld %lld",&a,&b); printf("%.2f\\n",(a+b)/2.0); }`,
  },
  {
    slug: "letter-to-code",
    title_mn: "Үсгийн код",
    title_en: "Letter to Code",
    statement_mn:
      "Нэг том латин үсэг уншаад, түүний ASCII кодыг хэвлэ. Жишээ нь `A` бол 65.",
    statement_en:
      "Read one uppercase Latin letter and print its ASCII code. For example, `A` is 65.",
    input_format_mn: "Нэг тэмдэгт.",
    input_format_en: "A single character.",
    output_format_mn: "Нэг бүхэл тоо.",
    output_format_en: "A single integer.",
    tags: ["integer"],
    samples: [{ input: "A\n" }],
    extra_inputs: ["Z\n", "M\n", "B\n", "Q\n"],
    reference_cpp: `#include <iostream>
int main(){ char c; std::cin>>c; std::cout<<(int)c<<"\\n"; }`,
  },
  {
    slug: "product-too-big-for-int",
    title_mn: "Том үржвэр",
    title_en: "A Product Too Big",
    statement_mn:
      "Хоёр бүхэл тоо уншаад үржвэрийг нь хэвлэ. Тоонууд нь 2 тэрбум хүртэл байж болох тул зөв төрөл сонгоорой.",
    statement_en:
      "Read two integers and print their product. The values can be up to 2 billion, so choose a type that can hold the answer.",
    input_format_mn: "Хоёр бүхэл тоо `a`, `b` (|a|, |b| ≤ 2 000 000 000).",
    input_format_en: "Two integers `a` and `b` (|a|, |b| ≤ 2 000 000 000).",
    output_format_mn: "Үржвэрийг нэг мөрөнд.",
    output_format_en: "The product, on one line.",
    tags: ["big-numbers"],
    samples: [{ input: "100000 100000\n" }],
    extra_inputs: [
      "2000000000 2\n",
      "-1500000000 3\n",
      "0 123456789\n",
      "46341 46341\n",
    ],
    reference_cpp: `#include <iostream>
int main(){ long long a,b; std::cin>>a>>b; std::cout<<a*b<<"\\n"; }`,
  },

  // ─────────── Reading Input ───────────
  {
    slug: "read-four-and-add",
    title_mn: "Дөрвөн тооны нийлбэр",
    title_en: "Add Four Numbers",
    statement_mn: "Дөрвөн бүхэл тоо уншаад нийлбэрийг нь хэвлэ.",
    statement_en: "Read four integers and print their sum.",
    input_format_mn:
      "Дөрвөн бүхэл тоо. Нэг мөрөнд ч, тус тусдаа ч байж болно.",
    input_format_en:
      "Four integers. They may be on one line or on separate lines.",
    output_format_mn: "Нийлбэр.",
    output_format_en: "The sum.",
    tags: ["basic-io"],
    samples: [{ input: "1 2 3 4\n" }],
    extra_inputs: ["10\n20\n30\n40\n", "-1 -2 -3 -4\n", "0 0 0 0\n", "5 5 5 5\n"],
    reference_cpp: `#include <iostream>
int main(){ long long a,b,c,d; std::cin>>a>>b>>c>>d; std::cout<<a+b+c+d<<"\\n"; }`,
  },
  {
    slug: "read-three-print-backwards",
    title_mn: "Урвуу дарааллаар",
    title_en: "Print Them Backwards",
    statement_mn:
      "Гурван бүхэл тоо уншаад эсрэг дарааллаар нь нэг мөрөнд хэвлэ.",
    statement_en:
      "Read three integers and print them on one line in the opposite order.",
    input_format_mn: "Гурван бүхэл тоо.",
    input_format_en: "Three integers.",
    output_format_mn: "Гурван тоо, зайгаар тусгаарлан.",
    output_format_en: "The three numbers, separated by spaces.",
    tags: ["basic-io"],
    samples: [{ input: "1 2 3\n" }],
    extra_inputs: ["9 8 7\n", "-1 0 1\n", "5 5 5\n", "100 200 300\n"],
    reference_cpp: `#include <iostream>
int main(){ long long a,b,c; std::cin>>a>>b>>c; std::cout<<c<<" "<<b<<" "<<a<<"\\n"; }`,
  },
  {
    slug: "name-and-age-card",
    title_mn: "Нэр ба нас",
    title_en: "Name and Age",
    statement_mn:
      "Нэг үг (нэр) болон бүхэл тоо (нас) уншаад `<нэр> is <нас>` гэж хэвлэ.",
    statement_en:
      "Read one word (a name) and an integer (an age), then print `<name> is <age>`.",
    input_format_mn: "Нэг үг, дараа нь нэг бүхэл тоо.",
    input_format_en: "A word, then an integer.",
    output_format_mn: "Нэг мөр.",
    output_format_en: "One line.",
    tags: ["basic-io"],
    samples: [{ input: "Bat 14\n" }],
    extra_inputs: ["Saraa 12\n", "Tuya 8\n", "Nomin 17\n", "Bold 40\n"],
    reference_cpp: `#include <iostream>
#include <string>
int main(){ std::string n; long long a; std::cin>>n>>a; std::cout<<n<<" is "<<a<<"\\n"; }`,
  },

  // ─────────── Operators and Expressions ───────────
  {
    slug: "apply-compound-operators",
    title_mn: "Богино операторууд",
    title_en: "Compound Operators",
    statement_mn:
      "Бүхэл тоо `n` уншаад дараах үйлдлүүдийг ЭНЭ дарааллаар хийж, эцсийн утгыг хэвлэ:\n\n```\nn += 10\nn *= 2\nn -= 5\n```",
    statement_en:
      "Read an integer `n`, apply these operations in THIS order, then print the final value:\n\n```\nn += 10\nn *= 2\nn -= 5\n```",
    input_format_mn: "Нэг бүхэл тоо.",
    input_format_en: "A single integer.",
    output_format_mn: "Эцсийн утга.",
    output_format_en: "The final value.",
    tags: ["compound-assignment"],
    samples: [{ input: "5\n" }],
    extra_inputs: ["0\n", "-10\n", "100\n", "1\n", "-3\n"],
    reference_cpp: `#include <iostream>
int main(){ long long n; std::cin>>n; n+=10; n*=2; n-=5; std::cout<<n<<"\\n"; }`,
  },
  {
    slug: "prefix-and-postfix",
    title_mn: "Урд ба ард",
    title_en: "Prefix and Postfix",
    statement_mn:
      "Бүхэл тоо `x` уншина. Дараах гурван утгыг тус тусын мөрөнд хэвлэ:\n\n1. `++x`-ийн утга\n2. дараа нь `x++`-ийн утга\n3. эцэст нь `x`-ийн утга",
    statement_en:
      "Read an integer `x`. Print these three values, each on its own line:\n\n1. the value of `++x`\n2. then the value of `x++`\n3. then the value of `x`",
    input_format_mn: "Нэг бүхэл тоо.",
    input_format_en: "A single integer.",
    output_format_mn: "Гурван мөр.",
    output_format_en: "Three lines.",
    tags: ["increment"],
    samples: [{ input: "1\n" }],
    extra_inputs: ["0\n", "-5\n", "10\n", "99\n"],
    reference_cpp: `#include <iostream>
int main(){
    long long x; std::cin>>x;
    std::cout<<(++x)<<"\\n";
    std::cout<<(x++)<<"\\n";
    std::cout<<x<<"\\n";
}`,
  },
  {
    slug: "which-comes-first",
    title_mn: "Аль нь эхэлж бодогдох вэ",
    title_en: "Which Happens First",
    statement_mn:
      "Гурван бүхэл тоо `a`, `b`, `c` уншаад `a + b * c` ба `(a + b) * c` -ийг хоёр мөрөнд хэвлэ.",
    statement_en:
      "Read three integers `a`, `b`, `c` and print `a + b * c` and `(a + b) * c` on two lines.",
    input_format_mn: "Гурван бүхэл тоо.",
    input_format_en: "Three integers.",
    output_format_mn: "Хоёр мөр.",
    output_format_en: "Two lines.",
    tags: ["operators"],
    samples: [{ input: "2 3 4\n" }],
    extra_inputs: ["1 1 1\n", "-2 5 3\n", "0 7 9\n", "10 10 10\n"],
    reference_cpp: `#include <iostream>
int main(){ long long a,b,c; std::cin>>a>>b>>c;
    std::cout<<(a+b*c)<<"\\n"<<((a+b)*c)<<"\\n"; }`,
  },

  // ─────────── Type Conversions ───────────
  {
    slug: "two-kinds-of-division",
    title_mn: "Хуваалтын хоёр төрөл",
    title_en: "Two Kinds of Division",
    statement_mn:
      "Хоёр бүхэл тоо `a`, `b` уншина. Эхний мөрөнд бүхэл хуваалт `a / b`, хоёрдугаар мөрөнд бодит хуваалтыг аравтын 2 оронтой хэвлэ.",
    statement_en:
      "Read two integers `a` and `b`. Print the integer division `a / b` on the first line, and the real division to 2 decimal places on the second.",
    input_format_mn: "Хоёр бүхэл тоо (`b` тэг биш).",
    input_format_en: "Two integers (`b` is not zero).",
    output_format_mn: "Хоёр мөр.",
    output_format_en: "Two lines.",
    tags: ["type-conversion"],
    samples: [{ input: "7 2\n" }],
    extra_inputs: ["10 4\n", "9 3\n", "1 8\n", "100 7\n", "-7 2\n"],
    reference_cpp: `#include <cstdio>
int main(){ long long a,b; scanf("%lld %lld",&a,&b);
    printf("%lld\\n", a/b); printf("%.2f\\n", (double)a/b); }`,
  },
  {
    slug: "cut-the-decimals",
    title_mn: "Бутархайг таслах",
    title_en: "Cut the Decimals",
    statement_mn:
      "Бутархайтай тоо уншаад бүхэл болгож хэвлэ. **Дугуйруулахгүй**, зөвхөн бутархай хэсгийг нь хая.",
    statement_en:
      "Read a decimal number and print it as a whole number. Do **not** round — just cut off the fractional part.",
    input_format_mn: "Нэг бутархай тоо (эерэг).",
    input_format_en: "One decimal number (positive).",
    output_format_mn: "Нэг бүхэл тоо.",
    output_format_en: "One integer.",
    tags: ["cast"],
    samples: [{ input: "9.99\n" }],
    extra_inputs: ["0.4\n", "3.0\n", "12.75\n", "100.999\n"],
    reference_cpp: `#include <cstdio>
int main(){ double x; scanf("%lf",&x); printf("%lld\\n",(long long)x); }`,
  },
  {
    slug: "score-as-percent",
    title_mn: "Хувь болгох",
    title_en: "Score as a Percentage",
    statement_mn:
      "Авсан оноо ба нийт оноог уншаад хувийг нь аравтын 1 оронтой хэвлэ.",
    statement_en:
      "Read the marks scored and the total marks, then print the percentage to 1 decimal place.",
    input_format_mn: "Хоёр бүхэл тоо: авсан оноо, нийт оноо (нийт > 0).",
    input_format_en: "Two integers: marks scored and total marks (total > 0).",
    output_format_mn: "Хувь, аравтын 1 оронтой.",
    output_format_en: "The percentage, to 1 decimal place.",
    tags: ["type-conversion"],
    samples: [{ input: "17 20\n" }],
    extra_inputs: ["1 3\n", "50 50\n", "0 10\n", "45 60\n", "7 9\n"],
    reference_cpp: `#include <cstdio>
int main(){ long long got,total; scanf("%lld %lld",&got,&total);
    printf("%.1f\\n", 100.0*got/total); }`,
  },

  // ─────────── switch and ? : ───────────
  {
    slug: "day-number-to-name",
    title_mn: "Гарагийн нэр",
    title_en: "Day of the Week",
    statement_mn:
      "1-ээс 7 хүртэлх тоо уншаад гарагийн нэрийг хэвлэ: 1 = `Monday` … 7 = `Sunday`.",
    statement_en:
      "Read a number from 1 to 7 and print the day: 1 = `Monday` … 7 = `Sunday`.",
    input_format_mn: "Нэг бүхэл тоо (1–7).",
    input_format_en: "One integer (1–7).",
    output_format_mn: "Гарагийн нэр.",
    output_format_en: "The name of the day.",
    tags: ["switch"],
    samples: [{ input: "3\n" }],
    extra_inputs: ["1\n", "7\n", "5\n", "2\n", "6\n", "4\n"],
    reference_cpp: `#include <iostream>
int main(){
    int d; std::cin>>d;
    switch(d){
        case 1: std::cout<<"Monday\\n"; break;
        case 2: std::cout<<"Tuesday\\n"; break;
        case 3: std::cout<<"Wednesday\\n"; break;
        case 4: std::cout<<"Thursday\\n"; break;
        case 5: std::cout<<"Friday\\n"; break;
        case 6: std::cout<<"Saturday\\n"; break;
        default: std::cout<<"Sunday\\n";
    }
}`,
  },
  {
    slug: "tiny-calculator",
    title_mn: "Бяцхан тооны машин",
    title_en: "Tiny Calculator",
    statement_mn:
      "`a`, оператор (`+`, `-`, `*`), `b` уншаад үр дүнг хэвлэ. Операторыг `switch`-ээр шалгаж үзээрэй.",
    statement_en:
      "Read `a`, an operator (`+`, `-`, `*`) and `b`, then print the result. Try choosing the operator with a `switch`.",
    input_format_mn: "Бүхэл тоо, тэмдэг, бүхэл тоо.",
    input_format_en: "An integer, a character, an integer.",
    output_format_mn: "Үр дүн.",
    output_format_en: "The result.",
    tags: ["switch"],
    samples: [{ input: "6 * 7\n" }],
    extra_inputs: ["10 + 5\n", "10 - 25\n", "-3 * -3\n", "0 + 0\n", "9 - 9\n"],
    reference_cpp: `#include <iostream>
int main(){
    long long a,b; char op; std::cin>>a>>op>>b;
    switch(op){
        case '+': std::cout<<a+b<<"\\n"; break;
        case '-': std::cout<<a-b<<"\\n"; break;
        default:  std::cout<<a*b<<"\\n";
    }
}`,
  },
  {
    slug: "adult-or-child",
    title_mn: "Том хүн үү, хүүхэд үү",
    title_en: "Adult or Child",
    statement_mn:
      "Нас уншаад 18-аас их буюу тэнцүү бол `adult`, эсрэг тохиолдолд `child` гэж хэвлэ. Гурвалсан оператор (`? :`) ашиглан нэг мөрөнд бичиж үзээрэй.",
    statement_en:
      "Read an age and print `adult` if it is 18 or more, otherwise `child`. Try writing it on one line with the ternary operator (`? :`).",
    input_format_mn: "Нэг бүхэл тоо.",
    input_format_en: "One integer.",
    output_format_mn: "`adult` эсвэл `child`.",
    output_format_en: "`adult` or `child`.",
    tags: ["ternary"],
    samples: [{ input: "20\n" }],
    extra_inputs: ["18\n", "17\n", "0\n", "65\n", "13\n"],
    reference_cpp: `#include <iostream>
int main(){ int a; std::cin>>a; std::cout<<(a>=18?"adult":"child")<<"\\n"; }`,
  },

  // ─────────── Controlling a Loop ───────────
  {
    slug: "skip-the-threes",
    title_mn: "Гуравт хуваагдахыг алгасах",
    title_en: "Skip the Threes",
    statement_mn:
      "`n` уншаад 1-ээс `n` хүртэлх тоонуудыг нэг мөрөнд хэвлэ, гэхдээ 3-т хуваагдах тоог алгас. `continue` ашиглаж үзээрэй.",
    statement_en:
      "Read `n` and print the numbers from 1 to `n` on one line, skipping every multiple of 3. Try using `continue`.",
    input_format_mn: "Нэг бүхэл тоо `n` (1 ≤ n ≤ 100).",
    input_format_en: "One integer `n` (1 ≤ n ≤ 100).",
    output_format_mn: "Тоонууд зайгаар тусгаарлагдан нэг мөрөнд.",
    output_format_en: "The numbers on one line, separated by spaces.",
    tags: ["break-continue"],
    samples: [{ input: "10\n" }],
    extra_inputs: ["1\n", "3\n", "20\n", "5\n", "15\n"],
    reference_cpp: `#include <iostream>
int main(){
    int n; std::cin>>n;
    bool first=true;
    for(int i=1;i<=n;i++){
        if(i%3==0) continue;
        if(!first) std::cout<<" ";
        std::cout<<i; first=false;
    }
    std::cout<<"\\n";
}`,
  },
  {
    slug: "add-until-zero",
    title_mn: "Тэг гартал нэмэх",
    title_en: "Add Until Zero",
    statement_mn:
      "Тоонуудыг дараалан уншаад 0 ирэх хүртэл нийлбэрийг ол. 0-ийг нийлбэрт оруулахгүй. `break` ашиглаж үзээрэй.",
    statement_en:
      "Keep reading numbers and adding them until a 0 arrives. Do not count the 0 itself. Try using `break`.",
    input_format_mn: "Бүхэл тоонууд, төгсгөлд нь 0.",
    input_format_en: "Integers, ending with a 0.",
    output_format_mn: "Нийлбэр.",
    output_format_en: "The sum.",
    tags: ["sentinel"],
    samples: [{ input: "3 4 5 0\n" }],
    extra_inputs: ["0\n", "10 -10 0\n", "1 1 1 1 1 0\n", "100 200 300 0\n"],
    reference_cpp: `#include <iostream>
int main(){
    long long x, sum=0;
    while(std::cin>>x){ if(x==0) break; sum+=x; }
    std::cout<<sum<<"\\n";
}`,
  },
  {
    slug: "halve-until-one",
    title_mn: "Нэг болтол хагаслах",
    title_en: "Halve Until One",
    statement_mn:
      "`n` уншаад 1 болтол нь дахин дахин хоёрт хуваа (бүхэл хуваалт). Хэдэн удаа хуваасныг хэвлэ.",
    statement_en:
      "Read `n` and keep dividing it by two (integer division) until it reaches 1. Print how many divisions that took.",
    input_format_mn: "Нэг бүхэл тоо `n` (1 ≤ n ≤ 1 000 000).",
    input_format_en: "One integer `n` (1 ≤ n ≤ 1 000 000).",
    output_format_mn: "Хуваалтын тоо.",
    output_format_en: "The number of divisions.",
    tags: ["do-while"],
    samples: [{ input: "20\n" }],
    extra_inputs: ["1\n", "2\n", "1024\n", "7\n", "1000000\n"],
    reference_cpp: `#include <iostream>
int main(){
    long long n; std::cin>>n; int steps=0;
    while(n>1){ n/=2; steps++; }
    std::cout<<steps<<"\\n";
}`,
  },

  // ─────────── Reading a Whole Line ───────────
  {
    slug: "echo-whole-line",
    title_mn: "Мөрийг бүтнээр нь",
    title_en: "Echo the Whole Line",
    statement_mn:
      "Зай агуулсан бүтэн мөр уншаад яг тэр чигээр нь хэвлэ.",
    statement_en: "Read a whole line, spaces included, and print it back exactly.",
    input_format_mn: "Нэг мөр бичвэр.",
    input_format_en: "One line of text.",
    output_format_mn: "Ижил мөр.",
    output_format_en: "The same line.",
    tags: ["getline"],
    samples: [{ input: "hello there my friend\n" }],
    extra_inputs: ["one\n", "a b c d e\n", "Ulaanbaatar is the capital\n"],
    reference_cpp: `#include <iostream>
#include <string>
int main(){ std::string s; std::getline(std::cin,s); std::cout<<s<<"\\n"; }`,
  },
  {
    slug: "count-the-words",
    title_mn: "Үг тоолох",
    title_en: "Count the Words",
    statement_mn:
      "Бүтэн мөр уншаад доторх үгийн тоог хэвлэ. Үгс нэг зайгаар тусгаарлагдана.",
    statement_en:
      "Read a whole line and print how many words it contains. Words are separated by single spaces.",
    input_format_mn: "Нэг мөр бичвэр.",
    input_format_en: "One line of text.",
    output_format_mn: "Үгийн тоо.",
    output_format_en: "The number of words.",
    tags: ["whole-line"],
    samples: [{ input: "the quick brown fox\n" }],
    extra_inputs: ["hello\n", "a b c d e f g\n", "two words\n"],
    reference_cpp: `#include <iostream>
#include <sstream>
#include <string>
int main(){
    std::string line; std::getline(std::cin,line);
    std::istringstream in(line); std::string w; int n=0;
    while(in>>w) n++;
    std::cout<<n<<"\\n";
}`,
  },
  {
    slug: "number-then-line",
    title_mn: "Тоо, дараа нь мөр",
    title_en: "A Number, Then a Line",
    statement_mn:
      "Эхлээд бүхэл тоо `n`, дараа нь бүтэн мөр уншина. Тэр мөрийг `n` удаа тус тусын мөрөнд хэвлэ.\n\nАнхаар: тоо уншсаны дараа `cin.ignore()` хэрэгтэй болно.",
    statement_en:
      "First read an integer `n`, then read a whole line. Print that line `n` times, each on its own line.\n\nWatch out: after reading the number you will need `cin.ignore()`.",
    input_format_mn: "Нэг бүхэл тоо `n` (1 ≤ n ≤ 10), дараа нь нэг мөр.",
    input_format_en: "An integer `n` (1 ≤ n ≤ 10), then one line.",
    output_format_mn: "`n` мөр.",
    output_format_en: "`n` lines.",
    tags: ["getline"],
    samples: [{ input: "3\ngood morning\n" }],
    extra_inputs: ["1\nhello world\n", "5\na b\n", "2\nUlaanbaatar city\n"],
    reference_cpp: `#include <iostream>
#include <string>
int main(){
    int n; std::cin>>n; std::cin.ignore();
    std::string s; std::getline(std::cin,s);
    for(int i=0;i<n;i++) std::cout<<s<<"\\n";
}`,
  },

  // ─────────── String Tools ───────────
  {
    slug: "first-and-last-letter",
    title_mn: "Эхний ба сүүлийн үсэг",
    title_en: "First and Last Letter",
    statement_mn:
      "Нэг үг уншаад эхний болон сүүлийн тэмдэгтийг зайгаар тусгаарлан хэвлэ.",
    statement_en:
      "Read a word and print its first and last character, separated by a space.",
    input_format_mn: "Нэг үг (зайгүй).",
    input_format_en: "One word, with no spaces.",
    output_format_mn: "Хоёр тэмдэгт.",
    output_format_en: "Two characters.",
    tags: ["substring"],
    samples: [{ input: "programming\n" }],
    extra_inputs: ["a\n", "hello\n", "Ulaanbaatar\n", "cpp\n"],
    reference_cpp: `#include <iostream>
#include <string>
int main(){ std::string s; std::cin>>s;
    std::cout<<s[0]<<" "<<s[s.size()-1]<<"\\n"; }`,
  },
  {
    slug: "cut-out-a-piece",
    title_mn: "Хэсэг таслах",
    title_en: "Cut Out a Piece",
    statement_mn:
      "Үг, эхлэх байрлал `a`, урт `n` уншаад тэр хэсгийг хэвлэ. Байрлал 0-оос эхэлнэ.",
    statement_en:
      "Read a word, a start position `a` and a length `n`, then print that piece. Positions start at 0.",
    input_format_mn: "Нэг үг, дараа нь хоёр бүхэл тоо `a` ба `n`.",
    input_format_en: "A word, then two integers `a` and `n`.",
    output_format_mn: "Тасалж авсан хэсэг.",
    output_format_en: "The piece you cut out.",
    tags: ["substring"],
    samples: [{ input: "programming 3 4\n" }],
    extra_inputs: [
      "hello 0 1\n",
      "Ulaanbaatar 0 5\n",
      "abcdef 2 3\n",
      "computer 4 4\n",
    ],
    reference_cpp: `#include <iostream>
#include <string>
int main(){ std::string s; int a,n; std::cin>>s>>a>>n;
    std::cout<<s.substr(a,n)<<"\\n"; }`,
  },
  {
    slug: "add-two-number-strings",
    title_mn: "Мөрөөр бичсэн хоёр тоо",
    title_en: "Add Two Number Strings",
    statement_mn:
      "Хоёр тоог **бичвэр** хэлбэрээр уншаад нийлбэрийг нь тоогоор хэвлэ. `stoi` тустай байх болно.",
    statement_en:
      "Read two numbers as **text** and print their sum as a number. `stoi` will help.",
    input_format_mn: "Хоёр үг, тус бүр нь тоо.",
    input_format_en: "Two words, each one a number.",
    output_format_mn: "Нийлбэр.",
    output_format_en: "The sum.",
    tags: ["string-convert"],
    samples: [{ input: "42 8\n" }],
    extra_inputs: ["0 0\n", "100 250\n", "7 -3\n", "999 1\n"],
    reference_cpp: `#include <iostream>
#include <string>
int main(){ std::string a,b; std::cin>>a>>b;
    std::cout<<(std::stoi(a)+std::stoi(b))<<"\\n"; }`,
  },

  // ─────────── Functions / More About Functions ───────────
  {
    slug: "largest-of-three-function",
    title_mn: "Гурвын хамгийн их нь",
    title_en: "Largest of Three",
    statement_mn:
      "Гурван бүхэл тоо уншаад хамгийн ихийг нь хэвлэ. Хоёр тооны их нь буцаадаг функц бичээд түүнийгээ хоёр удаа дуудаж үзээрэй.",
    statement_en:
      "Read three integers and print the largest. Try writing a function that returns the larger of two numbers, and calling it twice.",
    input_format_mn: "Гурван бүхэл тоо.",
    input_format_en: "Three integers.",
    output_format_mn: "Хамгийн их утга.",
    output_format_en: "The largest value.",
    tags: ["function"],
    samples: [{ input: "3 9 5\n" }],
    extra_inputs: ["1 1 1\n", "-5 -2 -9\n", "100 50 100\n", "0 -1 1\n"],
    reference_cpp: `#include <iostream>
long long bigger(long long a, long long b){ return a>b?a:b; }
int main(){ long long a,b,c; std::cin>>a>>b>>c;
    std::cout<<bigger(bigger(a,b),c)<<"\\n"; }`,
  },
  {
    slug: "count-vowels-function",
    title_mn: "Эгшиг тоолох функц",
    title_en: "Count the Vowels",
    statement_mn:
      "Нэг үг уншаад доторх эгшгийн (`a e i o u`) тоог хэвлэ. Тоолох ажлыг функц болгож бичээрэй.",
    statement_en:
      "Read a word and print how many vowels (`a e i o u`) it contains. Put the counting in a function.",
    input_format_mn: "Нэг үг, жижиг үсгээр.",
    input_format_en: "One word, in lowercase.",
    output_format_mn: "Эгшгийн тоо.",
    output_format_en: "The number of vowels.",
    tags: ["function"],
    samples: [{ input: "programming\n" }],
    extra_inputs: ["rhythm\n", "aeiou\n", "hello\n", "ulaanbaatar\n"],
    reference_cpp: `#include <iostream>
#include <string>
int vowels(const std::string& s){
    int n=0;
    for(size_t i=0;i<s.size();i++){
        char c=s[i];
        if(c=='a'||c=='e'||c=='i'||c=='o'||c=='u') n++;
    }
    return n;
}
int main(){ std::string s; std::cin>>s; std::cout<<vowels(s)<<"\\n"; }`,
  },
  {
    slug: "swap-using-reference",
    title_mn: "Лавлагаагаар солих",
    title_en: "Swap Using a Reference",
    statement_mn:
      "Хоёр тоо уншаад, тэдгээрийг **функц ашиглан** сольж, дараа нь хэвлэ. Функц эх хувьсагчийг өөрчлөх ёстой тул `&` хэрэгтэй болно.",
    statement_en:
      "Read two numbers, swap them **using a function**, then print them. The function must change the originals, so you will need `&`.",
    input_format_mn: "Хоёр бүхэл тоо.",
    input_format_en: "Two integers.",
    output_format_mn: "Солигдсоны дараах хоёр тоо.",
    output_format_en: "The two numbers after the swap.",
    tags: ["reference-parameter"],
    samples: [{ input: "1 2\n" }],
    extra_inputs: ["-4 4\n", "0 99\n", "7 7\n", "100 -100\n"],
    reference_cpp: `#include <iostream>
void swapValues(long long& a, long long& b){ long long t=a; a=b; b=t; }
int main(){ long long a,b; std::cin>>a>>b; swapValues(a,b);
    std::cout<<a<<" "<<b<<"\\n"; }`,
  },
  {
    slug: "smallest-and-largest-by-reference",
    title_mn: "Бага ба их нь",
    title_en: "Smallest and Largest",
    statement_mn:
      "Гурван тоо уншаад хамгийн бага, хамгийн их утгыг нэг мөрөнд хэвлэ. Хоёр хариуг лавлагаа параметрээр буцаадаг нэг функц бичиж үзээрэй.",
    statement_en:
      "Read three numbers and print the smallest and the largest on one line. Try writing a single function that returns both through reference parameters.",
    input_format_mn: "Гурван бүхэл тоо.",
    input_format_en: "Three integers.",
    output_format_mn: "Хамгийн бага, дараа нь хамгийн их.",
    output_format_en: "The smallest, then the largest.",
    tags: ["reference-parameter"],
    samples: [{ input: "5 2 9\n" }],
    extra_inputs: ["1 1 1\n", "-3 -7 -1\n", "0 100 50\n", "8 8 2\n"],
    reference_cpp: `#include <iostream>
void findRange(long long a, long long b, long long c,
               long long& lo, long long& hi){
    lo = a; if(b<lo) lo=b; if(c<lo) lo=c;
    hi = a; if(b>hi) hi=b; if(c>hi) hi=c;
}
int main(){
    long long a,b,c,lo,hi; std::cin>>a>>b>>c;
    findRange(a,b,c,lo,hi);
    std::cout<<lo<<" "<<hi<<"\\n";
}`,
  },

  // ─────────── Structs ───────────
  {
    slug: "one-student-record",
    title_mn: "Нэг сурагчийн бичлэг",
    title_en: "One Student Record",
    statement_mn:
      "Сурагчийн нэр, анги, дундаж оноог уншаад `<нэр> (grade <анги>) <дундаж>` хэлбэрээр хэвлэ. Дундажийг аравтын 1 оронтой хэвлэ. Гурван утгыг `struct`-д хадгалж үзээрэй.",
    statement_en:
      "Read a student's name, grade and average, then print `<name> (grade <grade>) <average>`. Print the average to 1 decimal place. Try holding the three values in a `struct`.",
    input_format_mn: "Нэг үг, бүхэл тоо, бутархай тоо.",
    input_format_en: "A word, an integer and a decimal number.",
    output_format_mn: "Нэг мөр.",
    output_format_en: "One line.",
    tags: ["struct"],
    samples: [{ input: "Bat 8 92.5\n" }],
    extra_inputs: ["Saraa 10 88\n", "Tuya 7 100\n", "Bold 12 61.25\n"],
    reference_cpp: `#include <cstdio>
#include <iostream>
#include <string>
struct Student { std::string name; int grade; double average; };
int main(){
    Student s; std::cin>>s.name>>s.grade>>s.average;
    std::cout<<s.name<<" (grade "<<s.grade<<") ";
    printf("%.1f\\n", s.average);
}`,
  },
  {
    slug: "top-of-the-class",
    title_mn: "Ангийн тэргүүн",
    title_en: "Top of the Class",
    statement_mn:
      "`n` сурагчийн нэр, оноог уншаад хамгийн өндөр оноотойн нэрийг хэвлэ. Оноо давхцахгүй.",
    statement_en:
      "Read `n` students, each a name and a mark, then print the name of the one with the highest mark. No two marks are equal.",
    input_format_mn:
      "Эхний мөрөнд `n` (1 ≤ n ≤ 50). Дараагийн `n` мөрөнд нэр ба оноо.",
    input_format_en:
      "The first line has `n` (1 ≤ n ≤ 50). The next `n` lines each have a name and a mark.",
    output_format_mn: "Хамгийн өндөр оноотой сурагчийн нэр.",
    output_format_en: "The name of the student with the highest mark.",
    tags: ["struct"],
    samples: [{ input: "3\nBat 78\nTuya 91\nBold 43\n" }],
    extra_inputs: [
      "1\nAnu 55\n",
      "4\nA 10\nB 20\nC 30\nD 25\n",
      "2\nSaraa 100\nOyun 99\n",
    ],
    reference_cpp: `#include <iostream>
#include <string>
#include <vector>
struct Student { std::string name; long long mark; };
int main(){
    int n; std::cin>>n;
    std::vector<Student> v(n);
    for(int i=0;i<n;i++) std::cin>>v[i].name>>v[i].mark;
    int best=0;
    for(int i=1;i<n;i++) if(v[i].mark>v[best].mark) best=i;
    std::cout<<v[best].name<<"\\n";
}`,
  },
  {
    slug: "distance-between-points",
    title_mn: "Хоёр цэгийн зай",
    title_en: "Distance Between Points",
    statement_mn:
      "Хоёр цэгийн координатыг уншаад хоорондох зайг аравтын 3 оронтой хэвлэ. Цэг бүрийг `struct`-д хадгалж үзээрэй.",
    statement_en:
      "Read the coordinates of two points and print the distance between them to 3 decimal places. Try holding each point in a `struct`.",
    input_format_mn: "Дөрвөн бүхэл тоо: `x1 y1 x2 y2`.",
    input_format_en: "Four integers: `x1 y1 x2 y2`.",
    output_format_mn: "Зай, аравтын 3 оронтой.",
    output_format_en: "The distance, to 3 decimal places.",
    tags: ["struct"],
    samples: [{ input: "0 0 3 4\n" }],
    extra_inputs: ["1 1 1 1\n", "-2 -3 4 5\n", "0 0 1 1\n", "10 0 0 10\n"],
    reference_cpp: `#include <cstdio>
#include <cmath>
struct Point { double x, y; };
int main(){
    Point a,b;
    scanf("%lf %lf %lf %lf",&a.x,&a.y,&b.x,&b.y);
    double dx=a.x-b.x, dy=a.y-b.y;
    printf("%.3f\\n", sqrt(dx*dx+dy*dy));
}`,
  },
];
