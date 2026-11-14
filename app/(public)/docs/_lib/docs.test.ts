import { BKT_PARAMETERS, traceMastery, updateMastery } from "./bkt";
import { DOCS, adjacentDocs, getDoc, searchDocs } from "./registry";
import { DOC_CONTENT } from "../_content/slugs";

describe("BKT documentation helper", () => {
  it("uses the live API parameters", () => {
    // Must match gadvance-api App\Services\BktService.
    expect(BKT_PARAMETERS).toEqual({ prior: 0.2, transit: 0.1, guess: 0.25, slip: 0.1 });
  });

  it("reproduces the API update for the documented example", () => {
    // Values computed with the PHP formula: correct, correct, incorrect, correct, correct.
    expect(traceMastery([true, true, false, true, true])).toEqual([0.2, 0.526, 0.82, 0.44, 0.765, 0.929]);
  });

  it("clamps between 0.01 and 0.99", () => {
    expect(updateMastery(0.99, true)).toBe(0.99);
    expect(updateMastery(0.01, false)).toBeGreaterThanOrEqual(0.01);
  });
});

describe("documentation registry", () => {
  it("has unique slugs and every article has content", () => {
    const slugs = DOCS.map((d) => d.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const slug of slugs) expect(DOC_CONTENT).toContain(slug);
  });

  it("only links related articles that exist", () => {
    for (const doc of DOCS) for (const slug of doc.related) expect(getDoc(slug)).toBeDefined();
  });

  it("finds articles by keyword and heading", () => {
    expect(searchDocs("slip")[0]?.slug).toBe("how-bkt-works");
    expect(searchDocs("join code").map((d) => d.slug)).toContain("faq");
    expect(searchDocs("password").map((d) => d.slug)).toContain("faq");
    expect(searchDocs("")).toEqual([]);
  });

  it("orders previous and next articles", () => {
    expect(adjacentDocs(DOCS[0].slug).previous).toBeUndefined();
    expect(adjacentDocs(DOCS[1].slug).previous?.slug).toBe(DOCS[0].slug);
  });
});
