import { mathText } from "../mathText";

test("fractions and degrees from real question text", () => {
  expect(mathText("भिन्नों $\\frac{2}{3}, \\frac{3}{5}$ में")).toBe("भिन्नों 2/3, 3/5 में");
  expect(mathText("कर्क रेखा (\\( 23\\frac{1}{2}^\\circ \\) उत्तरी अक्षांश)")).toBe("कर्क रेखा ( 23 1/2° उत्तरी अक्षांश)");
  expect(mathText("plain text")).toBe("plain text");
});
