// נרמול מספרי טלפון (ישראל) — פונקציה מרכזית אחת המשמשת גם בייבוא וגם בהתאמת הוובהוק.
// המטרה: שאותו מספר בפורמטים שונים ("050-1234567", "+972501234567", "0501234567")
// יגיע לאותה מחרוזת מנורמלת, כדי שההתאמה תמיד תעבוד.

export function normalizePhone(raw: string | null | undefined): string {
  if (!raw) return "";
  // השארת ספרות בלבד
  let digits = String(raw).replace(/\D/g, "");
  if (!digits) return "";

  // הסרת קידומת בינלאומית של ישראל: 00972 / 972 -> 0
  if (digits.startsWith("00972")) {
    digits = "0" + digits.slice(5);
  } else if (digits.startsWith("972")) {
    digits = "0" + digits.slice(3);
  }

  // אם אין 0 מוביל ונראה כמו מספר מקומי (9-10 ספרות) — נוסיף 0
  if (!digits.startsWith("0") && (digits.length === 9)) {
    digits = "0" + digits;
  }

  return digits;
}

// האם מחרוזת נראית כמו מספר טלפון תקין (לצורכי ייבוא)
export function looksLikePhone(raw: string | null | undefined): boolean {
  const n = normalizePhone(raw);
  return n.length >= 9 && n.length <= 11;
}
