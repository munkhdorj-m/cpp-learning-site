// Worked pseudocode a student can load, run and then take apart.
//
// Shared by the small runner embedded in a practice topic and by the full-page
// workbench at /cambridge/pseudocode, so the two can never drift into showing
// different examples of the same idea.
//
// Every one of these is exercised by scripts/check-pseudocode.mts.

export interface PseudocodeExample {
  name: string;
  code: string;
  /** Lines fed to INPUT, if the program asks for any. */
  stdin?: string;
}

export const PSEUDOCODE_EXAMPLES: PseudocodeExample[] = [
  {
    name: "Output and variables",
    code: `DECLARE Name : STRING
DECLARE Age : INTEGER

Name <- "Bat"
Age <- 14

OUTPUT "Hello ", Name
OUTPUT "Next year you are ", Age + 1`,
  },
  {
    name: "Total and average",
    code: `DECLARE Total : INTEGER
DECLARE Count : INTEGER
DECLARE Mark : INTEGER

Total <- 0
FOR Count <- 1 TO 5
    INPUT Mark
    Total <- Total + Mark
NEXT Count

OUTPUT "Total = ", Total
OUTPUT "Average = ", Total / 5`,
    stdin: "60\n70\n80\n90\n50",
  },
  {
    name: "IF and CASE",
    code: `DECLARE Mark : INTEGER
INPUT Mark

IF Mark >= 50 THEN
    OUTPUT "Pass"
ELSE
    OUTPUT "Fail"
ENDIF

CASE OF Mark DIV 10
    10 : OUTPUT "Grade A"
    9  : OUTPUT "Grade A"
    8  : OUTPUT "Grade B"
    7  : OUTPUT "Grade C"
    OTHERWISE : OUTPUT "Grade D"
ENDCASE`,
    stdin: "82",
  },
  {
    name: "Loops",
    code: `DECLARE I : INTEGER

FOR I <- 1 TO 5
    OUTPUT I, " squared is ", I * I
NEXT I

I <- 10
WHILE I > 0 DO
    I <- I - 3
ENDWHILE
OUTPUT "I ended at ", I

REPEAT
    OUTPUT "runs at least once"
    I <- I + 1
UNTIL I > 0`,
  },
  {
    name: "Arrays",
    code: `DECLARE Marks : ARRAY[1:5] OF INTEGER
DECLARE I : INTEGER
DECLARE Best : INTEGER

Marks[1] <- 62
Marks[2] <- 91
Marks[3] <- 45
Marks[4] <- 78
Marks[5] <- 88

Best <- Marks[1]
FOR I <- 2 TO 5
    IF Marks[I] > Best THEN
        Best <- Marks[I]
    ENDIF
NEXT I

OUTPUT "Highest mark is ", Best`,
  },
  {
    name: "Procedures and functions",
    code: `FUNCTION Double(N) RETURNS INTEGER
    RETURN N * 2
ENDFUNCTION

PROCEDURE Greet(Who)
    OUTPUT "Hello ", Who
ENDPROCEDURE

CALL Greet("class")
OUTPUT Double(21)

// strings from the standard library
OUTPUT LENGTH("Ulaanbaatar")
OUTPUT UCASE("mongolia")
OUTPUT SUBSTRING("Ulaanbaatar", 1, 5)`,
  },
];
