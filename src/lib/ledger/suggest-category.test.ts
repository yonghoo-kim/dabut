import { describe, expect, it } from "vitest";
import { suggestCategory, suggestMemos, suggestPaymentMethod } from "./suggest-category";

const h = [
  { memo: "스타벅스 아메리카노", categoryId: "cafe", type: "expense" },
  { memo: "점심 김밥", categoryId: "eat", type: "expense" },
  { memo: "점심 김밥", categoryId: "eat", type: "expense" },
  { memo: "월급", categoryId: "salary", type: "income" },
];

describe("suggestCategory", () => {
  it("returns null for short or unmatched text", () => {
    expect(suggestCategory("a", h, "expense")).toBeNull();
    expect(suggestCategory("택시", h, "expense")).toBeNull();
  });
  it("matches by containment, ignoring spaces and case", () => {
    expect(suggestCategory("스타벅스", h, "expense")).toBe("cafe");
    expect(suggestCategory("점심김밥 두줄", h, "expense")).toBe("eat");
  });
  it("only considers the same type", () => {
    expect(suggestCategory("월급", h, "expense")).toBeNull();
    expect(suggestCategory("월급", h, "income")).toBe("salary");
  });
  it("prefers exact matches over partial", () => {
    const hist = [
      { memo: "커피", categoryId: "cafe", type: "expense" },
      { memo: "커피 원두 구매", categoryId: "mart", type: "expense" },
      { memo: "커피 원두 구매", categoryId: "mart", type: "expense" },
    ];
    expect(suggestCategory("커피", hist, "expense")).toBe("cafe");
  });
});

describe("suggestMemos", () => {
  const hist = [
    { memo: "플로 커피", categoryId: "cafe", type: "expense" },
    { memo: "플로", categoryId: "cafe", type: "expense" },
    { memo: "플로", categoryId: "cafe", type: "expense" },
    { memo: "애플 구독", categoryId: "sub", type: "expense" },
    { memo: "플라워", categoryId: "gift", type: "income" },
  ];
  it("lists matching memos, prefix first then frequency, same type only", () => {
    expect(suggestMemos("플", hist, "expense").map((s) => s.memo)).toEqual(["플로", "플로 커피", "애플 구독"]);
  });
  it("excludes an exact match and empty input", () => {
    expect(suggestMemos("플로", hist, "expense").map((s) => s.memo)).toEqual(["플로 커피"]);
    expect(suggestMemos("  ", hist, "expense")).toEqual([]);
  });
});

describe("suggestPaymentMethod", () => {
  const hist = [
    { memo: "스타벅스", categoryId: "cafe", type: "expense", paymentMethodId: "samsung" },
    { memo: "스타벅스 라떼", categoryId: "cafe", type: "expense", paymentMethodId: "samsung" },
    { memo: "스타벅스", categoryId: "cafe", type: "expense", paymentMethodId: "kb" },
    { memo: "스타벅스", categoryId: "cafe", type: "expense", paymentMethodId: null },
    { memo: "스타벅스", categoryId: "eat", type: "expense", paymentMethodId: "bc" },
  ];
  it("picks the card most used for similar memos in that category", () => {
    expect(suggestPaymentMethod("스타벅스", hist, "expense", "cafe")).toBe("samsung");
  });
  it("is scoped to the category and returns null when unknown", () => {
    expect(suggestPaymentMethod("스타벅스", hist, "expense", "eat")).toBe("bc");
    expect(suggestPaymentMethod("택시", hist, "expense", "cafe")).toBeNull();
  });
});
