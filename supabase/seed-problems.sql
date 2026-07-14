-- =====================================================================
-- Seed: 10 starter problems, easy → hard
-- Paste this into Supabase SQL Editor and run.
-- Safe to re-run: uses ON CONFLICT (slug) DO NOTHING.
-- =====================================================================

-- Helper: a function we'll use to insert tests for a slug, to keep the
-- big block below readable. (Created here, dropped at the end.)
create or replace function _seed_add_test(
  p_slug text,
  p_stdin text,
  p_expected text,
  p_is_sample boolean,
  p_order int
) returns void as $$
declare
  v_id uuid;
begin
  select id into v_id from problems where slug = p_slug;
  if v_id is null then return; end if;
  -- Idempotent: skip if a test with same problem + order_idx already exists.
  if exists (select 1 from test_cases where problem_id = v_id and order_idx = p_order) then
    return;
  end if;
  insert into test_cases (problem_id, stdin, expected_stdout, is_sample, order_idx)
  values (v_id, p_stdin, p_expected, p_is_sample, p_order);
end;
$$ language plpgsql;


-- =====================================================================
-- 1. Hello World
-- =====================================================================
insert into problems (slug, title_mn, title_en, statement_mn, statement_en,
  input_format_mn, input_format_en, output_format_mn, output_format_en,
  difficulty, xp_reward, tags, is_public)
values (
  'hello-world',
  'Сайн уу',
  'Hello World',
  E'``Hello, World!`` гэсэн мөрийг хэвлэ.',
  E'Print the string ``Hello, World!``.',
  'Оролт байхгүй.',
  'No input.',
  E'Яг ``Hello, World!`` гэсэн нэг мөр.',
  E'Exactly one line: ``Hello, World!``.',
  'easy', 5, array['intro', 'output'], true
) on conflict (slug) do nothing;

select _seed_add_test('hello-world', '', 'Hello, World!', true, 0);


-- =====================================================================
-- 2. Add Two Numbers
-- =====================================================================
insert into problems (slug, title_mn, title_en, statement_mn, statement_en,
  input_format_mn, input_format_en, output_format_mn, output_format_en,
  constraints_mn, constraints_en, difficulty, xp_reward, tags, is_public)
values (
  'add-two-numbers',
  'Хоёр тоо нэмэх',
  'Add Two Numbers',
  'Хоёр бүхэл тоо a, b өгөгдсөн. Тэдгээрийн нийлбэрийг хэвлэ.',
  'Given two integers a and b, print their sum.',
  'Нэг мөрөнд a, b гэсэн хоёр бүхэл тоо хоосон зайгаар тусгаарлагдан өгөгдөнө.',
  'A single line with two space-separated integers a and b.',
  'Нэг бүхэл тоо — a + b-ийн утга.',
  'A single integer: the value of a + b.',
  E'-10^9 ≤ a, b ≤ 10^9',
  E'-10^9 ≤ a, b ≤ 10^9',
  'easy', 10, array['intro', 'math'], true
) on conflict (slug) do nothing;

select _seed_add_test('add-two-numbers', '3 4',                   '7',          true,  0);
select _seed_add_test('add-two-numbers', '10 20',                 '30',         false, 1);
select _seed_add_test('add-two-numbers', '-5 5',                  '0',          false, 2);
select _seed_add_test('add-two-numbers', '1000000000 1000000000', '2000000000', false, 3);
select _seed_add_test('add-two-numbers', '-1000000000 -1',        '-1000000001',false, 4);


-- =====================================================================
-- 3. Max of Three
-- =====================================================================
insert into problems (slug, title_mn, title_en, statement_mn, statement_en,
  input_format_mn, input_format_en, output_format_mn, output_format_en,
  difficulty, xp_reward, tags, is_public)
values (
  'max-of-three',
  'Гурван тооны их',
  'Max of Three',
  'Гурван бүхэл тоо өгөгдсөн. Хамгийн их утгыг хэвлэ.',
  'You are given three integers. Print the largest one.',
  'Нэг мөрөнд a, b, c гэсэн гурван бүхэл тоо хоосон зайгаар тусгаарлан өгөгдөнө.',
  'A single line with three space-separated integers a, b, c.',
  'Хамгийн их утгыг агуулсан нэг бүхэл тоо.',
  'The largest of the three.',
  'easy', 10, array['intro', 'conditionals'], true
) on conflict (slug) do nothing;

select _seed_add_test('max-of-three', '1 2 3',    '3',  true,  0);
select _seed_add_test('max-of-three', '10 5 8',   '10', false, 1);
select _seed_add_test('max-of-three', '-1 -5 -3', '-1', false, 2);
select _seed_add_test('max-of-three', '7 7 7',    '7',  false, 3);
select _seed_add_test('max-of-three', '100 50 75','100',false, 4);


-- =====================================================================
-- 4. Even or Odd
-- =====================================================================
insert into problems (slug, title_mn, title_en, statement_mn, statement_en,
  input_format_mn, input_format_en, output_format_mn, output_format_en,
  difficulty, xp_reward, tags, is_public)
values (
  'even-or-odd',
  'Тэгш сондгой',
  'Even or Odd',
  E'Бүхэл тоо n өгөгдсөн. Хэрэв тэгш бол ``Even``, сондгой бол ``Odd`` гэж хэвлэ.',
  E'Given an integer n, print ``Even`` if it is even or ``Odd`` if it is odd.',
  'Нэг бүхэл тоо n.',
  'A single integer n.',
  E'``Even`` эсвэл ``Odd`` гэсэн нэг мөр.',
  E'One line: ``Even`` or ``Odd``.',
  'easy', 10, array['intro', 'conditionals'], true
) on conflict (slug) do nothing;

select _seed_add_test('even-or-odd', '4',       'Even', true,  0);
select _seed_add_test('even-or-odd', '7',       'Odd',  false, 1);
select _seed_add_test('even-or-odd', '0',       'Even', false, 2);
select _seed_add_test('even-or-odd', '-3',      'Odd',  false, 3);
select _seed_add_test('even-or-odd', '1000000', 'Even', false, 4);


-- =====================================================================
-- 5. Sum from 1 to N
-- =====================================================================
insert into problems (slug, title_mn, title_en, statement_mn, statement_en,
  input_format_mn, input_format_en, output_format_mn, output_format_en,
  constraints_mn, constraints_en, difficulty, xp_reward, tags, is_public)
values (
  'sum-1-to-n',
  E'1-ээс N хүртэлх нийлбэр',
  'Sum from 1 to N',
  E'n тоо өгөгдсөн. ``1 + 2 + 3 + ... + n`` нийлбэрийг хэвлэ.\n\nЗөвлөмж: n том утгатай үед нийлбэр int хүрэхгүй. ``long long`` ашиглах хэрэгтэй.',
  E'Given n, print the sum ``1 + 2 + 3 + ... + n``.\n\nHint: for large n the sum overflows int. Use ``long long``.',
  'Нэг бүхэл тоо n.',
  'A single integer n.',
  'Нийлбэрийн утга.',
  'The sum.',
  E'1 ≤ n ≤ 10^6',
  E'1 ≤ n ≤ 10^6',
  'easy', 15, array['loops', 'math'], true
) on conflict (slug) do nothing;

select _seed_add_test('sum-1-to-n', '5',       '15',           true,  0);
select _seed_add_test('sum-1-to-n', '1',       '1',            false, 1);
select _seed_add_test('sum-1-to-n', '100',     '5050',         false, 2);
select _seed_add_test('sum-1-to-n', '1000',    '500500',       false, 3);
select _seed_add_test('sum-1-to-n', '1000000', '500000500000', false, 4);


-- =====================================================================
-- 6. Count Digits
-- =====================================================================
insert into problems (slug, title_mn, title_en, statement_mn, statement_en,
  input_format_mn, input_format_en, output_format_mn, output_format_en,
  constraints_mn, constraints_en, difficulty, xp_reward, tags, is_public)
values (
  'count-digits',
  'Цифрийн тоог олох',
  'Count Digits',
  'Эерэг бүхэл тоо n өгөгдсөн. Цифрийн тоог нь хэвлэ.',
  'Given a positive integer n, print the number of digits it has.',
  'Нэг бүхэл тоо n.',
  'A single integer n.',
  'Цифрийн тоо.',
  'The number of digits.',
  E'1 ≤ n ≤ 10^18',
  E'1 ≤ n ≤ 10^18',
  'easy', 15, array['loops', 'math'], true
) on conflict (slug) do nothing;

select _seed_add_test('count-digits', '7',                  '1',  true,  0);
select _seed_add_test('count-digits', '12345',              '5',  false, 1);
select _seed_add_test('count-digits', '100',                '3',  false, 2);
select _seed_add_test('count-digits', '999999999999999999', '18', false, 3);
select _seed_add_test('count-digits', '1',                  '1',  false, 4);


-- =====================================================================
-- 7. Reverse a Number
-- =====================================================================
insert into problems (slug, title_mn, title_en, statement_mn, statement_en,
  input_format_mn, input_format_en, output_format_mn, output_format_en,
  constraints_mn, constraints_en, difficulty, xp_reward, tags, is_public)
values (
  'reverse-number',
  'Тоо урвуулах',
  'Reverse a Number',
  'Эерэг бүхэл тоо n өгөгдсөн. Түүний цифрүүдийг урвуу дарааллаар нь сэлгээд гарсан тоог хэвлэ. Эхний тэг байх ёсгүй (жишээ нь 100-ийг урвуулбал 1 болно).',
  'Given a positive integer n, print the number formed by reversing its digits. Leading zeros are dropped (e.g. 100 reversed is 1).',
  'Нэг бүхэл тоо n.',
  'A single integer n.',
  'Урвуулсан тоо.',
  'The reversed number.',
  E'1 ≤ n ≤ 10^9',
  E'1 ≤ n ≤ 10^9',
  'medium', 20, array['loops', 'math'], true
) on conflict (slug) do nothing;

select _seed_add_test('reverse-number', '1234',       '4321',      true,  0);
select _seed_add_test('reverse-number', '5',          '5',         false, 1);
select _seed_add_test('reverse-number', '100',        '1',         false, 2);
select _seed_add_test('reverse-number', '1000000000', '1',         false, 3);
select _seed_add_test('reverse-number', '987654321',  '123456789', false, 4);
select _seed_add_test('reverse-number', '120030',     '30021',     false, 5);


-- =====================================================================
-- 8. Check Prime
-- =====================================================================
insert into problems (slug, title_mn, title_en, statement_mn, statement_en,
  input_format_mn, input_format_en, output_format_mn, output_format_en,
  constraints_mn, constraints_en, difficulty, xp_reward, tags, is_public)
values (
  'check-prime',
  'Анхны тоо мөн үү',
  'Check Prime',
  E'Бүхэл тоо n өгөгдсөн. Хэрэв анхны тоо бол ``YES``, үгүй бол ``NO`` гэж хэвлэ.\n\nЗөвлөмж: тооны хуваагчийг олохдоо √n хүртэл шалгахад хангалттай.',
  E'Given an integer n, print ``YES`` if it is prime, otherwise ``NO``.\n\nHint: you only need to check divisors up to √n.',
  'Нэг бүхэл тоо n.',
  'A single integer n.',
  E'``YES`` эсвэл ``NO``.',
  E'``YES`` or ``NO``.',
  E'2 ≤ n ≤ 10^6',
  E'2 ≤ n ≤ 10^6',
  'medium', 25, array['loops', 'math', 'primes'], true
) on conflict (slug) do nothing;

select _seed_add_test('check-prime', '7',      'YES', true,  0);
select _seed_add_test('check-prime', '10',     'NO',  false, 1);
select _seed_add_test('check-prime', '2',      'YES', false, 2);
select _seed_add_test('check-prime', '97',     'YES', false, 3);
select _seed_add_test('check-prime', '100',    'NO',  false, 4);
select _seed_add_test('check-prime', '1009',   'YES', false, 5);
select _seed_add_test('check-prime', '999983', 'YES', false, 6);
select _seed_add_test('check-prime', '999999', 'NO',  false, 7);


-- =====================================================================
-- 9. Fibonacci Nth
-- =====================================================================
insert into problems (slug, title_mn, title_en, statement_mn, statement_en,
  input_format_mn, input_format_en, output_format_mn, output_format_en,
  constraints_mn, constraints_en, difficulty, xp_reward, tags, is_public)
values (
  'fibonacci-nth',
  'Фибоначчийн n-р гишүүн',
  'Nth Fibonacci',
  E'Фибоначчийн дараалал: F(1) = 1, F(2) = 1, F(n) = F(n-1) + F(n-2) (n ≥ 3).\n\nn өгөгдсөн. F(n)-ийг хэвлэ.\n\nЗөвлөмж: n-ийн утга томрох тул ``long long`` ашиглах.',
  E'Fibonacci sequence: F(1) = 1, F(2) = 1, F(n) = F(n-1) + F(n-2) for n ≥ 3.\n\nGiven n, print F(n).\n\nHint: use ``long long`` because values grow large.',
  'Нэг бүхэл тоо n.',
  'A single integer n.',
  'F(n).',
  'F(n).',
  E'1 ≤ n ≤ 80',
  E'1 ≤ n ≤ 80',
  'medium', 30, array['loops', 'recursion', 'math'], true
) on conflict (slug) do nothing;

select _seed_add_test('fibonacci-nth', '5',  '5',                  true,  0);
select _seed_add_test('fibonacci-nth', '1',  '1',                  false, 1);
select _seed_add_test('fibonacci-nth', '2',  '1',                  false, 2);
select _seed_add_test('fibonacci-nth', '10', '55',                 false, 3);
select _seed_add_test('fibonacci-nth', '50', '12586269025',        false, 4);
select _seed_add_test('fibonacci-nth', '80', '23416728348467685',  false, 5);


-- =====================================================================
-- 10. Sort the Array
-- =====================================================================
insert into problems (slug, title_mn, title_en, statement_mn, statement_en,
  input_format_mn, input_format_en, output_format_mn, output_format_en,
  constraints_mn, constraints_en, difficulty, xp_reward, tags, is_public)
values (
  'sort-array',
  'Массив эрэмбэлэх',
  'Sort the Array',
  E'n ширхэг бүхэл тоо өгөгдсөн. Тэдгээрийг өсөх дарааллаар эрэмбэлж хэвлэ.\n\nЗөвлөмж: ``std::sort`` ашиглаж болно.',
  E'You are given n integers. Print them sorted in non-decreasing order.\n\nHint: you can use ``std::sort``.',
  E'Эхний мөрөнд n байна. Дараагийн мөрөнд n ширхэг бүхэл тоо хоосон зайгаар тусгаарлагдан өгөгдөнө.',
  'The first line contains n. The next line contains n space-separated integers.',
  'Нэг мөрөнд эрэмблэгдсэн тоонууд, хоосон зайгаар тусгаарлан хэвлэ.',
  'A single line with the sorted integers separated by spaces.',
  E'1 ≤ n ≤ 1000, |a_i| ≤ 10^9',
  E'1 ≤ n ≤ 1000, |a_i| ≤ 10^9',
  'hard', 50, array['arrays', 'sorting'], true
) on conflict (slug) do nothing;

select _seed_add_test('sort-array', E'3\n3 1 2',                                  '1 2 3',                          true,  0);
select _seed_add_test('sort-array', E'5\n5 4 3 2 1',                              '1 2 3 4 5',                      false, 1);
select _seed_add_test('sort-array', E'1\n42',                                     '42',                             false, 2);
select _seed_add_test('sort-array', E'5\n1 1 1 1 1',                              '1 1 1 1 1',                      false, 3);
select _seed_add_test('sort-array', E'10\n-5 0 10 -10 5 0 1 -1 100 -100',         '-100 -10 -5 -1 0 0 1 5 10 100',  false, 4);
select _seed_add_test('sort-array', E'6\n1000000000 -1000000000 0 999999999 -999999999 1', '-1000000000 -999999999 0 1 999999999 1000000000', false, 5);


-- Cleanup
drop function _seed_add_test(text, text, text, boolean, int);
