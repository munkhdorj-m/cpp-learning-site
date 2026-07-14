-- =====================================================================
-- Seed: 30 starter quests for the Daily Quest system.
-- Run AFTER supabase/migrations/006_quests.sql.
-- Idempotent: ON CONFLICT (slug) DO NOTHING.
-- =====================================================================

-- ---- PREDICT OUTPUT ----
insert into quests (slug, type, prompt_mn, prompt_en, code_snippet, correct_answer, explanation_mn, explanation_en, difficulty, xp_reward, tags) values
('po-hello', 'predict_output',
 'Дараах код юу хэвлэх вэ?', 'What does this code print?',
 E'cout << "Hello" << " " << "World";',
 'Hello World',
 E'``<<`` оператор нь зүүнээс баруун тийш дараалан хэвлэнэ.',
 'The << operator chains outputs left to right.',
 'easy', 5, array['io']),

('po-add', 'predict_output',
 'Энэ кодын гаралт?', 'What does this print?',
 E'int a = 5, b = 3;\ncout << a + b;',
 '8',
 'a болон b-ийн нийлбэр.', 'Sum of a and b.',
 'easy', 5, array['math']),

('po-int-div', 'predict_output',
 'Энэ кодын гаралт?', 'What does this print?',
 E'cout << 7 / 2;',
 '3',
 'Бүхэл тооны хуваалт бутархайг өгөхгүй. 7 / 2 = 3 (үлдэгдэл 1).',
 'Integer division drops the fraction. 7 / 2 = 3 (remainder 1).',
 'easy', 5, array['math']),

('po-double-div', 'predict_output',
 'Гаралт нь?', 'Output?',
 E'cout << 7.0 / 2;',
 '3.5',
 'Хамгийн бага нэг операнд double бол үр дүн нь double.',
 'If at least one operand is double, the result is double.',
 'medium', 10, array['math', 'types']),

('po-modulo', 'predict_output',
 'Гаралт нь?', 'Output?',
 E'cout << 17 % 5;',
 '2',
 '17 = 3 * 5 + 2, тиймээс үлдэгдэл нь 2.',
 '17 = 3 * 5 + 2, so the remainder is 2.',
 'easy', 5, array['math']),

('po-postfix', 'predict_output',
 'Гаралт нь?', 'Output?',
 E'int x = 10;\ncout << x++;\ncout << " ";\ncout << x;',
 '10 11',
 'Постфикс ``x++`` хуучин утгыг хэвлээд дараа нь нэмэгдүүлнэ.',
 'Postfix x++ prints the old value, then increments.',
 'medium', 10, array['operators']),

('po-prefix', 'predict_output',
 'Гаралт нь?', 'Output?',
 E'int x = 10;\ncout << ++x;\ncout << " ";\ncout << x;',
 '11 11',
 'Префикс ``++x`` эхлээд нэмэгдүүлж дараа нь утгыг хэвлэнэ.',
 'Prefix ++x increments first, then prints the new value.',
 'medium', 10, array['operators']),

('po-for', 'predict_output',
 'Гаралт нь?', 'Output?',
 E'for (int i = 0; i < 4; i++)\n    cout << i;',
 '0123',
 '0-ээс эхлээд 4-өөс бага хүртэл буюу 0,1,2,3.',
 'From 0 up to (not including) 4: 0, 1, 2, 3.',
 'easy', 5, array['loops']),

('po-while-sumdig', 'predict_output',
 'Гаралт нь?', 'Output?',
 E'int n = 1234;\nint sum = 0;\nwhile (n > 0) {\n    sum += n % 10;\n    n /= 10;\n}\ncout << sum;',
 '10',
 '1+2+3+4 = 10. Цифрүүдийн нийлбэрийг олно.',
 '1+2+3+4 = 10. Computes the digit sum.',
 'medium', 10, array['loops']),

('po-string-len', 'predict_output',
 'Гаралт нь?', 'Output?',
 E'string s = "merhaba";\ncout << s.length();',
 '7',
 'merhaba нь 7 үсэгтэй.', '"merhaba" has 7 characters.',
 'easy', 5, array['strings']),

('po-logic', 'predict_output',
 'Гаралт нь?', 'Output?',
 E'cout << (5 > 3 && 2 < 1);',
 '0',
 '``&&`` нь хоёулаа үнэн байх ёстой. 2 < 1 худал тул нийт худал = 0.',
 '&& needs both sides true. 2 < 1 is false, so the whole thing is 0.',
 'medium', 10, array['logic']),

('po-char-arith', 'predict_output',
 'Гаралт нь?', 'Output?',
 E'char c = ''C'';\ncout << (int)(c - ''A'');',
 '2',
 E'``''C'' - ''A''`` нь ASCII кодуудын зөрөө = 2.',
 E'''C'' - ''A'' is the difference in ASCII codes = 2.',
 'medium', 10, array['types']),

('po-nested', 'predict_output',
 'Гаралт нь?', 'Output?',
 E'int x = 0;\nfor (int i = 0; i < 3; i++)\n    for (int j = 0; j < 2; j++)\n        x++;\ncout << x;',
 '6',
 '3 × 2 = 6 удаа давталт явагдана.',
 '3 × 2 = 6 iterations.',
 'medium', 10, array['loops']),

('po-array-sum', 'predict_output',
 'Гаралт нь?', 'Output?',
 E'int a[] = {1, 2, 3, 4, 5};\nint sum = 0;\nfor (int i = 0; i < 5; i++) sum += a[i];\ncout << sum;',
 '15',
 '1+2+3+4+5 = 15.',
 '1+2+3+4+5 = 15.',
 'easy', 5, array['arrays']),

('po-ifelse', 'predict_output',
 'Гаралт нь?', 'Output?',
 E'int x = 10;\nif (x > 5) cout << "big";\nelse cout << "small";',
 'big',
 '10 > 5 үнэн.', '10 > 5 is true.',
 'easy', 5, array['conditionals']),

-- ---- BUG HUNT ----
('bh-semicolon', 'bug_hunt',
 'Аль мөрөнд алдаа байна вэ?', 'Which line has the bug?',
 E'1| int a = 5\n2| int b = 3;\n3| cout << a + b;\n4| return 0;',
 '0',
 '1-р мөрийн төгсгөлд ``;`` дутуу.', 'Line 1 is missing a semicolon at the end.',
 'easy', 5, array['syntax']),

('bh-equals', 'bug_hunt',
 'Аль мөрөнд алдаа байна вэ?', 'Which line has the bug?',
 E'1| int x = 10;\n2| if (x = 5) {\n3|     cout << "five";\n4| }',
 '1',
 E'2-р мөр ``=`` (оноох) гэснийг ``==`` (тэнцүү үү) гэх ёстой.',
 'Line 2 uses = (assignment) instead of == (equality check).',
 'medium', 10, array['operators']),

('bh-off-by-one', 'bug_hunt',
 'Аль мөрөнд алдаа байна вэ? (Массивын хэмжээ 5)', 'Which line has the bug? (array size is 5)',
 E'1| int a[5] = {1,2,3,4,5};\n2| int sum = 0;\n3| for (int i = 0; i <= 5; i++)\n4|     sum += a[i];',
 '2',
 E'3-р мөрөнд ``i <= 5`` нь массивын хязгаараас гарна. ``i < 5`` байх ёстой.',
 'Line 3 uses i <= 5 which reads past the array. Should be i < 5.',
 'medium', 10, array['arrays', 'loops']),

('bh-missing-return', 'bug_hunt',
 'Аль мөрөнд алдаа байна вэ?', 'Which line has the bug?',
 E'1| int square(int n) {\n2|     int r = n * n;\n3| }\n4| int main() { cout << square(4); }',
 '2',
 '3-р мөрөнд ``return r;`` дутуу. Функц үр дүн буцаах ёстой.',
 'Line 3 is missing return r;. The function must return its result.',
 'medium', 10, array['functions']),

('bh-wrong-var', 'bug_hunt',
 'Аль мөрөнд алдаа байна вэ?', 'Which line has the bug?',
 E'1| int x = 5;\n2| int y = 10;\n3| int sum = x + z;\n4| cout << sum;',
 '2',
 '3-р мөрөнд ``z`` гэсэн хувьсагч зарлагдаагүй. ``y`` байх ёстой.',
 'Line 3 references z which was never declared. Should be y.',
 'easy', 5, array['syntax']),

('bh-include', 'bug_hunt',
 'Аль мөрөнд алдаа байна вэ?', 'Which line has the bug?',
 E'1| #include <iostream>\n2| using namespace std;\n3| int main() {\n4|     string s = "hi";\n5|     cout << s;\n6| }',
 '3',
 E'``string`` ашиглахын тулд ``#include <string>`` нэмэх ёстой.',
 'Using std::string requires #include <string>.',
 'hard', 15, array['headers']),

('bh-while', 'bug_hunt',
 'Аль мөрөнд алдаа байна вэ?', 'Which line has the bug?',
 E'1| int i = 0;\n2| while (i < 5) {\n3|     cout << i;\n4| }',
 '2',
 '3-р мөрөнд ``i++`` дутсан тул мөнхийн давталт болно.',
 'Line 3 is missing i++ — this loop will never terminate.',
 'medium', 10, array['loops']),

('bh-cin', 'bug_hunt',
 'Аль мөрөнд алдаа байна вэ?', 'Which line has the bug?',
 E'1| int n;\n2| cin >> n;\n3| for (i = 0; i < n; i++)\n4|     cout << i;',
 '2',
 E'3-р мөрөнд ``i``-г зарлаагүй. ``int i`` гэх ёстой.',
 'Line 3 uses i without declaring it. Should be int i.',
 'easy', 5, array['syntax']),

-- ---- MULTIPLE CHOICE ----
('mc-header-io', 'multiple_choice',
 E'cin ба cout-г ашиглахад аль header-ийг ``#include`` хийх вэ?',
 'Which header is needed for cin and cout?',
 NULL, '0',
 E'``<iostream>`` нь ``cin``/``cout``-ийг агуулна.', '<iostream> provides cin and cout.',
 'easy', 5, array['headers']),

('mc-bignum', 'multiple_choice',
 E'10^18 хүртэлх бүхэл тоонд аль төрөл тохиромжтой вэ?',
 'Which type holds integers up to 10^18?',
 NULL, '1',
 E'``int`` нь зөвхөн ~2 × 10^9 хүртэл, ``long long`` ~9 × 10^18 хүртэл.',
 'int only goes up to ~2 × 10^9; long long up to ~9 × 10^18.',
 'easy', 5, array['types']),

('mc-modulo-op', 'multiple_choice',
 E'``%`` оператор юу хийдэг вэ?', 'What does the % operator do?',
 NULL, '2',
 'Хуваалтын үлдэгдэл (модуль) тооцоолно.',
 'Computes the remainder of division (modulo).',
 'easy', 5, array['operators']),

('mc-precedence', 'multiple_choice',
 'Аль оператор давамгай (өндөр түрүүлэх эрхтэй) вэ?',
 'Which operator has higher precedence?',
 NULL, '0',
 E'``*`` нь ``+``-ээс түрүүлж бодогддог.',
 '* binds tighter than + (multiplication before addition).',
 'easy', 5, array['operators']),

('mc-div-mixed', 'multiple_choice',
 E'``int / double``-ийн үр дүн ямар төрөлд буух вэ?',
 'What is the result type of int / double?',
 NULL, '1',
 'Аль нэг операнд double бол үр дүн double болно.',
 'If either operand is double, the result is double.',
 'medium', 10, array['types']),

('mc-char-size', 'multiple_choice',
 E'``char``-ийн хэмжээ хэдэн байт вэ?', 'How many bytes is a char?',
 NULL, '0',
 'Стандартаар ``char`` нь үргэлж 1 байт.',
 'A char is always 1 byte by definition.',
 'easy', 5, array['types']),

('mc-bool', 'multiple_choice',
 E'``bool``-ийн боломжит утгууд?', 'Possible values of bool?',
 NULL, '2',
 E'``bool`` нь ``true`` эсвэл ``false`` хоёр л утгатай.',
 'bool has exactly two values: true and false.',
 'easy', 5, array['types']),

('mc-using-ns', 'multiple_choice',
 E'``using namespace std;`` юу хийдэг вэ?',
 'What does "using namespace std;" do?',
 NULL, '1',
 E'Зөвхөн ``std::`` угтварыг бичихгүй байх боломж өгнө. Шинэ функц нэмэхгүй.',
 'Lets you skip the std:: prefix. Does not add new functions.',
 'medium', 10, array['syntax']),

('mc-const', 'multiple_choice',
 'Тогтмол утга зарлахад аль түлхүүр үг хэрэгтэй вэ?',
 'Which keyword declares a constant?',
 NULL, '0',
 E'``const`` нь утгыг өөрчилж болохгүй гэдгийг хорлоно.',
 'const tells the compiler the value must not be changed.',
 'easy', 5, array['syntax'])
on conflict (slug) do nothing;

-- Backfill choices for the MC and bug_hunt quests (jsonb arrays, indexed 0..N).
update quests set
  choices_mn = jsonb_build_array('Мөр 1','Мөр 2','Мөр 3','Мөр 4'),
  choices_en = jsonb_build_array('Line 1','Line 2','Line 3','Line 4')
where type = 'bug_hunt'
  and slug in ('bh-semicolon','bh-equals','bh-off-by-one','bh-missing-return','bh-wrong-var','bh-include','bh-while','bh-cin');

update quests set
  choices_mn = jsonb_build_array('<iostream>','<cmath>','<vector>','<string>'),
  choices_en = jsonb_build_array('<iostream>','<cmath>','<vector>','<string>')
where slug = 'mc-header-io';

update quests set
  choices_mn = jsonb_build_array('int','long long','double','short'),
  choices_en = jsonb_build_array('int','long long','double','short')
where slug = 'mc-bignum';

update quests set
  choices_mn = jsonb_build_array('Хуваалт','Үржвэр','Үлдэгдэл (модуль)','Зэрэг'),
  choices_en = jsonb_build_array('Division','Multiplication','Remainder (modulo)','Power')
where slug = 'mc-modulo-op';

update quests set
  choices_mn = jsonb_build_array('*','+','=','<'),
  choices_en = jsonb_build_array('*','+','=','<')
where slug = 'mc-precedence';

update quests set
  choices_mn = jsonb_build_array('int','double','char','bool'),
  choices_en = jsonb_build_array('int','double','char','bool')
where slug = 'mc-div-mixed';

update quests set
  choices_mn = jsonb_build_array('1','2','4','системээс шалтгаална'),
  choices_en = jsonb_build_array('1','2','4','depends on system')
where slug = 'mc-char-size';

update quests set
  choices_mn = jsonb_build_array('Зөвхөн 0','-1, 0, 1','true, false','any integer'),
  choices_en = jsonb_build_array('Only 0','-1, 0, 1','true, false','any integer')
where slug = 'mc-bool';

update quests set
  choices_mn = jsonb_build_array(
    E'``std`` нэрсийн зайн агуулгыг импортолно',
    E'``std::`` угтварыг хэрэгсэхгүй болгоно',
    'Шинэ функц нэмнэ',
    'Кодыг хурдасгана'),
  choices_en = jsonb_build_array(
    'Imports everything from the std namespace',
    'Lets you skip the std:: prefix',
    'Adds new functions',
    'Makes code run faster')
where slug = 'mc-using-ns';

update quests set
  choices_mn = jsonb_build_array('const','static','final','readonly'),
  choices_en = jsonb_build_array('const','static','final','readonly')
where slug = 'mc-const';
