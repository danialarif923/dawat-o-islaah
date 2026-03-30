import React, { useState, useEffect } from "react";
import { useLanguage } from "../../../context/LanguageContext";

const IslamicInheritanceCalculator = () => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    gender: "male",
    currency: "PKR",
    gross: 0,
    debts: 0,
    funeral: 0,
    wasiyah: 0,
    husband: 0,
    wives: 0,
    father: 0,
    mother: 0,
    grandfather: 0,
    grandmothers: 0,
    sons: 0,
    daughters: 0,
    gsons: 0,
    gdaughters: 0,
    matSibs: 0,
    fullBro: 0,
    fullSis: 0,
    patBro: 0,
    patSis: 0,
  });
  const [demoCalled, setDemoCalled] = useState(0);

  useEffect(() => {
    // This code will run every time formData changes.
    if (demoCalled) {
      calculate();
    }
  }, [demoCalled]);

  const [results, setResults] = useState({
    summary: [],
    shares: [],
    notes: [],
    wasiyahNote: "",
  });

  const fmt = (n) =>
    Number(n || 0).toLocaleString(undefined, { maximumFractionDigits: 2 });

  const N = (value) => Math.max(0, Number(value || 0));

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const loadDemo = () => {
    setFormData({
      gender: "male",
      currency: "PKR",
      gross: 3000000,
      debts: 150000,
      funeral: 50000,
      wasiyah: 200000,
      husband: 0,
      wives: 1,
      father: 0,
      mother: 1,
      grandfather: 1,
      grandmothers: 1,
      sons: 0,
      daughters: 2,
      gsons: 1,
      gdaughters: 1,
      matSibs: 0,
      fullBro: 0,
      fullSis: 0,
      patBro: 0,
      patSis: 0,
    });
    setDemoCalled((prevDemo) => prevDemo + 1);
  };

  const reset = () => {
    setFormData({
      gender: "male",
      currency: "PKR",
      gross: 0,
      debts: 0,
      funeral: 0,
      wasiyah: 0,
      husband: 0,
      wives: 0,
      father: 0,
      mother: 0,
      grandfather: 0,
      grandmothers: 0,
      sons: 0,
      daughters: 0,
      gsons: 0,
      gdaughters: 0,
      matSibs: 0,
      fullBro: 0,
      fullSis: 0,
      patBro: 0,
      patSis: 0,
    });
    setResults({ summary: [], shares: [], notes: [], wasiyahNote: "" });
  };

  const calculate = () => {
    const currency = formData.currency || "";
    const gross = N(formData.gross);
    const debts = N(formData.debts);
    const funeral = N(formData.funeral);
    const netBeforeWasiyyah = Math.max(0, gross - debts - funeral);
    let wasiyah = N(formData.wasiyah);
    const wasCap = netBeforeWasiyyah / 3;
    let wasUsed = Math.min(wasiyah, wasCap);
    const wasiyahNote =
      wasiyah > wasCap
        ? `Wasiyyah capped at 1/3 → ${fmt(wasUsed)} ${currency}`
        : "";
    const distributable = Math.max(0, netBeforeWasiyyah - wasUsed);

    // Heirs
    const gender = formData.gender;
    let husband = N(formData.husband);
    let wives = N(formData.wives);
    if (gender === "male") {
      husband = 0;
    } else {
      wives = 0;
    }
    let father = N(formData.father);
    let mother = N(formData.mother);
    let grandfather = N(formData.grandfather);
    let grandmothers = N(formData.grandmothers);
    let sons = N(formData.sons);
    let daughters = N(formData.daughters);
    let gson = N(formData.gsons);
    let gdau = N(formData.gdaughters);
    let matSibs = N(formData.matSibs);
    let fullBro = N(formData.fullBro);
    let fullSis = N(formData.fullSis);
    let patBro = N(formData.patBro);
    let patSis = N(formData.patSis);

    // Descendants presence for spouse/mother rules
    const hasChildren = sons + daughters > 0;
    const hasDesc = hasChildren || gson + gdau > 0;

    const notes = [];

    // BLOCKING per Islamic inheritance rules
    if (father === 1) {
      grandfather = 0;
      fullBro = 0;
      fullSis = 0;
      patBro = 0;
      patSis = 0;
      notes.push("Father present → blocks grandfather and all siblings.");
    } else if (grandfather === 1) {
      fullBro = 0;
      fullSis = 0;
      patBro = 0;
      patSis = 0;
      notes.push("Grandfather present (father absent) → blocks siblings.");
    }
    if (hasChildren) {
      gson = 0;
      gdau = 0;
      notes.push("Children present → blocks grandchildren.");
    }

    // When full siblings exist, paternal siblings are suppressed
    if (fullBro + fullSis > 0) {
      patBro = 0;
      patSis = 0;
    }

    // FIXED SHARES (fractions of 1)
    let shares = [];

    // Spouse
    if (husband === 1) {
      shares.push({
        key: "husband",
        label: "Husband",
        count: 1,
        share: hasDesc ? 1 / 4 : 1 / 2,
      });
    }
    if (wives > 0) {
      shares.push({
        key: "wives",
        label: `Wives (${wives})`,
        count: wives,
        share: hasDesc ? 1 / 8 : 1 / 4,
      });
    }

    // Mother
    if (mother === 1) {
      const sibCount = matSibs + fullBro + fullSis + patBro + patSis;
      let mShare = !hasDesc && sibCount < 2 ? 1 / 3 : 1 / 6;
      shares.push({
        key: "mother",
        label: "Mother",
        count: 1,
        share: mShare,
      });
    }

    // Father / Grandfather
    if (father === 1) {
      if (hasDesc) {
        shares.push({
          key: "father",
          label: "Father",
          count: 1,
          share: 1 / 6,
        });
      }
    } else if (grandfather === 1) {
      if (hasDesc) {
        shares.push({
          key: "grandfather",
          label: "Grandfather",
          count: 1,
          share: 1 / 6,
        });
      }
    }

    // Grandmothers
    if (mother === 0 && grandmothers > 0) {
      shares.push({
        key: "grandmothers",
        label: `Grandmother(s) (${grandmothers})`,
        count: grandmothers,
        share: 1 / 6,
      });
    }

    // Daughters fixed when no sons
    if (daughters > 0 && sons === 0) {
      if (daughters === 1) {
        shares.push({
          key: "daughter",
          label: "Daughter",
          count: 1,
          share: 1 / 2,
        });
      } else {
        shares.push({
          key: "daughters",
          label: `Daughters (${daughters})`,
          count: daughters,
          share: 2 / 3,
        });
      }
    }

    // Grandchildren (if no children)
    if (!hasChildren && gson + gdau > 0) {
      if (gson === 0 && gdau > 0) {
        if (gdau === 1) {
          shares.push({
            key: "gdaughter",
            label: "Granddaughter (son's daughter)",
            count: 1,
            share: 1 / 2,
          });
        } else {
          shares.push({
            key: "gdaughters",
            label: `Granddaughters (${gdau})`,
            count: gdau,
            share: 2 / 3,
          });
        }
      }
    }

    // Maternal siblings fixed
    if (father === 0 && grandfather === 0 && !hasDesc && matSibs > 0) {
      shares.push({
        key: "matSibs",
        label: `Maternal sibling(s) (${matSibs})`,
        count: matSibs,
        share: matSibs === 1 ? 1 / 6 : 1 / 3,
      });
    }

    // Sisters fixed
    const noAscNoFather = !hasDesc && father === 0 && grandfather === 0;
    if (noAscNoFather && fullSis > 0 && fullBro === 0) {
      shares.push({
        key: "fullSisters",
        label: `Full sister(s) (${fullSis})`,
        count: fullSis,
        share: fullSis === 1 ? 1 / 2 : 2 / 3,
      });
    } else if (
      noAscNoFather &&
      fullBro + fullSis === 0 &&
      patSis > 0 &&
      patBro === 0
    ) {
      shares.push({
        key: "patSisters",
        label: `Paternal sister(s) (${patSis})`,
        count: patSis,
        share: patSis === 1 ? 1 / 2 : 2 / 3,
      });
    }

    // Sum fixed and apply ʿawl if >1
    let totalFixed = shares.reduce((s, x) => s + x.share, 0);
    if (totalFixed > 1) {
      const factor = 1 / totalFixed;
      shares = shares.map((x) => ({ ...x, share: x.share * factor }));
      notes.push(`Applied ʿawl: fixed shares scaled by ${factor.toFixed(4)}.`);
      totalFixed = 1;
    }

    // Remainder after fixed shares
    let remainder = Math.max(0, 1 - totalFixed);

    // RESIDUARIES
    const push = (arr, k, l, c, sh) =>
      arr.push({ key: k, label: l, count: c, share: sh });

    // 1) Children: sons + daughters (2:1)
    if (sons + daughters > 0) {
      const units = sons * 2 + daughters * 1;
      if (units > 0 && remainder > 0) {
        const perUnit = remainder / units;
        if (sons > 0) {
          push(shares, "sonsRes", `Sons (${sons})`, sons, perUnit * 2 * sons);
        }
        if (daughters > 0) {
          push(
            shares,
            "daughtersRes",
            `Daughters (${daughters})`,
            daughters,
            perUnit * 1 * daughters
          );
        }
        notes.push("Residuary: Children share remainder (son=2×daughter).");
        remainder = 0;
      }
    }
    // 2) Grandchildren (if no children)
    else if (gson + gdau > 0) {
      const units = gson * 2 + gdau * 1;
      if (units > 0 && remainder > 0) {
        const perUnit = remainder / units;
        if (gson > 0) {
          push(
            shares,
            "gsonsRes",
            `Grandsons (${gson})`,
            gson,
            perUnit * 2 * gson
          );
        }
        if (gdau > 0) {
          push(
            shares,
            "gdaughtersRes",
            `Granddaughters (${gdau})`,
            gdau,
            perUnit * 1 * gdau
          );
        }
        notes.push("Residuary: Grandchildren share remainder (male=2×female).");
        remainder = 0;
      }
    }

    // 3) Father / Grandfather as residuary
    if (remainder > 0) {
      if (father === 1) {
        push(shares, "fatherRes", "Father (residuary)", 1, remainder);
        notes.push("Residuary → Father.");
        remainder = 0;
      } else if (grandfather === 1) {
        push(shares, "gfRes", "Grandfather (residuary)", 1, remainder);
        notes.push("Residuary → Grandfather.");
        remainder = 0;
      }
    }

    // 4) Siblings as residuaries
    if (remainder > 0 && noAscNoFather) {
      if (fullBro + fullSis > 0) {
        const units = fullBro * 2 + fullSis * 1;
        const perUnit = remainder / units;
        if (fullBro > 0) {
          push(
            shares,
            "fullBroRes",
            `Full brothers (${fullBro})`,
            fullBro,
            perUnit * 2 * fullBro
          );
        }
        if (fullSis > 0) {
          push(
            shares,
            "fullSisRes",
            `Full sisters (${fullSis})`,
            fullSis,
            perUnit * 1 * fullSis
          );
        }
        notes.push("Residuary → Full siblings (male=2×female).");
        remainder = 0;
      } else if (patBro + patSis > 0) {
        const units = patBro * 2 + patSis * 1;
        const perUnit = remainder / units;
        if (patBro > 0) {
          push(
            shares,
            "patBroRes",
            `Paternal brothers (${patBro})`,
            patBro,
            perUnit * 2 * patBro
          );
        }
        if (patSis > 0) {
          push(
            shares,
            "patSisRes",
            `Paternal sisters (${patSis})`,
            patSis,
            perUnit * 1 * patSis
          );
        }
        notes.push("Residuary → Paternal siblings (male=2×female).");
        remainder = 0;
      }
    }

    // RADD if still remainder>0
    if (remainder > 0) {
      const eligible = shares.filter(
        (x) => x.key !== "husband" && x.key !== "wives"
      );
      const sumElig = eligible.reduce((s, x) => s + x.share, 0);
      if (sumElig > 0) {
        const factor = remainder / sumElig;
        shares = shares.map((x) =>
          eligible.includes(x) ? { ...x, share: x.share + x.share * factor } : x
        );
        notes.push(
          "Applied radd: remainder returned to fixed-share heirs (excluding spouse)."
        );
        remainder = 0;
      }
    }

    // Build summary
    const summary = [
      { key: "Gross Estate", value: gross },
      { key: "Debts", value: debts },
      { key: "Funeral", value: funeral },
      { key: "Wasiyyah used", value: wasUsed },
      { key: "Distributable", value: distributable },
    ];

    const toFrac = (x) => {
      if (x === 0) return "0";
      const ds = [1, 2, 3, 4, 6, 8, 12, 24];
      for (let d of ds) {
        const n = Math.round(x * d);
        if (Math.abs(x - n / d) < 1e-8) return `${n}/${d}`;
      }
      return `${Math.round(x * 1000)}/1000`;
    };

    setResults({
      summary,
      shares: shares.map((s) => ({
        ...s,
        fraction: toFrac(s.share),
        amount: s.share * distributable,
      })),
      notes,
      wasiyahNote,
    });
  };

  const FONT_SIZES = {
    // Main headings
    pageTitle: "text-2xl md:text-3xl",
    sectionTitle: "text-xl",

    // Labels and UI text
    label: "text-base",
    inputText: "text-sm",
    buttonText: "text-base",
    disclaimer: "text-sm",

    // Table headers and content
    tableHeader: "text-sm",
    tableCell: "text-sm",
    notes: "text-xs",

    // Header controls
    headerControl: "text-sm",

    // Weights
    fontBold: "font-bold",
    fontSemibold: "font-semibold",
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-slate-100 text-gray-800">
      <div className="max-w-6xl mx-auto py-6 px-4">
        {/* Header Card */}
        <div className="bg-white bg-opacity-80 border border-gray-200 rounded-2xl p-4 mb-4 shadow-sm">
          <h1
            className={`${FONT_SIZES.pageTitle} ${FONT_SIZES.fontBold} mb-2 text-gray-900`}
          >
            {t("islamicInheritanceCalculator.pageTitle")}
          </h1>

          <div className="flex flex-wrap gap-2">
            <div
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100 border border-gray-200 ${FONT_SIZES.headerControl} text-gray-600`}
            >
              <span>{t("islamicInheritanceCalculator.header.currency")}</span>
              <input
                type="text"
                value={formData.currency}
                onChange={(e) =>
                  handleInputChange("currency", e.target.value.toUpperCase())
                }
                className={`w-16 bg-transparent border-0 text-gray-800 ${FONT_SIZES.headerControl} uppercase focus:outline-none`}
              />
            </div>
            <div
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100 border border-gray-200 ${FONT_SIZES.headerControl} text-gray-600`}
            >
              <span>
                {t("islamicInheritanceCalculator.header.deceasedGender")}
              </span>
              <select
                value={formData.gender}
                onChange={(e) => handleInputChange("gender", e.target.value)}
                className={`bg-transparent border-0 text-gray-800 ${FONT_SIZES.headerControl} focus:outline-none`}
              >
                <option value="male">
                  {t("islamicInheritanceCalculator.header.genderOptions.male")}
                </option>
                <option value="female">
                  {t(
                    "islamicInheritanceCalculator.header.genderOptions.female"
                  )}
                </option>
              </select>
            </div>
          </div>
        </div>

        {/* Estate Card */}
        <div className="bg-white bg-opacity-80 border border-gray-200 rounded-2xl p-4 mb-4 shadow-sm">
          <h2
            className={`${FONT_SIZES.sectionTitle} ${FONT_SIZES.fontSemibold} mb-3 text-gray-900`}
          >
            {t("islamicInheritanceCalculator.estate.title")}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label
                className={`block ${FONT_SIZES.label} text-gray-600 mb-1.5`}
              >
                {t("islamicInheritanceCalculator.estate.grossEstate.label")}
              </label>
              <input
                type="number"
                value={formData.gross}
                onChange={(e) => handleInputChange("gross", e.target.value)}
                className={`w-full px-3 py-2.5 rounded-xl border border-gray-300 bg-white text-gray-800 ${FONT_SIZES.inputText} focus:outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200`}
                placeholder={t(
                  "islamicInheritanceCalculator.estate.grossEstate.placeholder"
                )}
                min="0"
                step="0.01"
              />
            </div>
            <div>
              <label
                className={`block ${FONT_SIZES.label} text-gray-600 mb-1.5`}
              >
                {t("islamicInheritanceCalculator.estate.debts.label")}
              </label>
              <input
                type="number"
                value={formData.debts}
                onChange={(e) => handleInputChange("debts", e.target.value)}
                className={`w-full px-3 py-2.5 rounded-xl border border-gray-300 bg-white text-gray-800 ${FONT_SIZES.inputText} focus:outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200`}
                placeholder={t(
                  "islamicInheritanceCalculator.estate.debts.placeholder"
                )}
                min="0"
                step="0.01"
              />
            </div>
            <div>
              <label
                className={`block ${FONT_SIZES.label} text-gray-600 mb-1.5`}
              >
                {t("islamicInheritanceCalculator.estate.funeral.label")}
              </label>
              <input
                type="number"
                value={formData.funeral}
                onChange={(e) => handleInputChange("funeral", e.target.value)}
                className={`w-full px-3 py-2.5 rounded-xl border border-gray-300 bg-white text-gray-800 ${FONT_SIZES.inputText} focus:outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200`}
                placeholder={t(
                  "islamicInheritanceCalculator.estate.funeral.placeholder"
                )}
                min="0"
                step="0.01"
              />
            </div>
            <div>
              <label
                className={`block ${FONT_SIZES.label} text-gray-600 mb-1.5`}
              >
                {t("islamicInheritanceCalculator.estate.wasiyyah.label")}
              </label>
              <input
                type="number"
                value={formData.wasiyah}
                onChange={(e) => handleInputChange("wasiyah", e.target.value)}
                className={`w-full px-3 py-2.5 rounded-xl border border-gray-300 bg-white text-gray-800 ${FONT_SIZES.inputText} focus:outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200`}
                placeholder={t(
                  "islamicInheritanceCalculator.estate.wasiyyah.placeholder"
                )}
                min="0"
                step="0.01"
              />
              {results.wasiyahNote && (
                <div className={`${FONT_SIZES.notes} text-gray-600 mt-1`}>
                  {results.wasiyahNote}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Heirs Card */}
        <div className="bg-white bg-opacity-80 border border-gray-200 rounded-2xl p-4 mb-4 shadow-sm">
          <h2
            className={`${FONT_SIZES.sectionTitle} ${FONT_SIZES.fontSemibold} mb-3 text-gray-900`}
          >
            {t("islamicInheritanceCalculator.heirs.title")}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { key: "husband", max: 1 },
              { key: "wives", max: 4 },
              { key: "father", max: 1 },
              { key: "mother", max: 1 },
              { key: "grandfather", max: 1 },
              { key: "grandmothers", max: 2 },
              { key: "sons" },
              { key: "daughters" },
              { key: "gsons" },
              { key: "gdaughters" },
              { key: "matSibs" },
              { key: "fullBro" },
              { key: "fullSis" },
              { key: "patBro" },
              { key: "patSis" },
            ].map(({ key, max }) => (
              <div key={key}>
                <label
                  className={`block ${FONT_SIZES.label} text-gray-600 mb-1.5`}
                >
                  {t(`islamicInheritanceCalculator.heirs.labels.${key}`)}
                </label>
                <input
                  type="number"
                  value={formData[key]}
                  onChange={(e) => handleInputChange(key, e.target.value)}
                  className={`w-full px-3 py-2.5 rounded-xl border border-gray-300 bg-white text-gray-800 ${FONT_SIZES.inputText} focus:outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200`}
                  min="0"
                  max={max}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Actions Card */}
        <div className="bg-white bg-opacity-80 border border-gray-200 rounded-2xl p-4 mb-4 shadow-sm">
          <div className="flex flex-wrap gap-3 mb-2">
            <button
              onClick={calculate}
              className={`px-4 py-3 rounded-xl bg-green-500 text-white ${FONT_SIZES.fontBold} ${FONT_SIZES.buttonText} hover:bg-green-600 transition-colors shadow-sm`}
            >
              {t("islamicInheritanceCalculator.actions.calculate")}
            </button>
            <button
              onClick={loadDemo}
              className={`px-4 py-3 rounded-xl bg-gray-100 border border-gray-300 text-gray-800 ${FONT_SIZES.fontBold} ${FONT_SIZES.buttonText} hover:bg-gray-200 transition-colors shadow-sm`}
            >
              {t("islamicInheritanceCalculator.actions.loadDemo")}
            </button>
            <button
              onClick={reset}
              className={`px-4 py-3 rounded-xl bg-red-500 text-white ${FONT_SIZES.fontBold} ${FONT_SIZES.buttonText} hover:bg-red-600 transition-colors shadow-sm`}
            >
              {t("islamicInheritanceCalculator.actions.reset")}
            </button>
          </div>
          <div className={`${FONT_SIZES.disclaimer} text-gray-600`}>
            {t("islamicInheritanceCalculator.actions.disclaimer")}
          </div>
        </div>

        {/* Results Card */}
        {(results.summary.length > 0 || results.shares.length > 0) && (
          <div className="bg-white bg-opacity-80 border border-gray-200 rounded-2xl p-4 shadow-sm">
            <h2
              className={`${FONT_SIZES.sectionTitle} ${FONT_SIZES.fontSemibold} mb-3 text-gray-900`}
            >
              {t("islamicInheritanceCalculator.results.title")}
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Summary Table */}
              {results.summary.length > 0 && (
                <div>
                  <table className="w-full">
                    <thead>
                      <tr>
                        <th
                          className={`text-left py-2.5 px-0 text-gray-600 ${FONT_SIZES.fontSemibold} ${FONT_SIZES.tableHeader} border-b border-dashed border-gray-300`}
                        >
                          {t(
                            "islamicInheritanceCalculator.results.summaryTable.item"
                          )}
                        </th>
                        <th
                          className={`text-left py-2.5 px-0 text-gray-600 ${FONT_SIZES.fontSemibold} ${FONT_SIZES.tableHeader} border-b border-dashed border-gray-300`}
                        >
                          {t(
                            "islamicInheritanceCalculator.results.summaryTable.amount"
                          )}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.summary.map(({ key, value }, index) => (
                        <tr key={index}>
                          <td
                            className={`py-2.5 px-0 border-b border-dashed border-gray-300 text-gray-800 ${FONT_SIZES.tableCell}`}
                          >
                            {key}
                          </td>
                          <td
                            className={`py-2.5 px-0 border-b border-dashed border-gray-300 font-mono ${FONT_SIZES.tableCell} text-gray-800`}
                          >
                            {fmt(value)} {formData.currency}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Shares Table */}
              {results.shares.length > 0 && (
                <div>
                  <table className="w-full">
                    <thead>
                      <tr>
                        <th
                          className={`text-left py-2.5 px-0 text-gray-600 ${FONT_SIZES.fontSemibold} ${FONT_SIZES.tableHeader} border-b border-dashed border-gray-300`}
                        >
                          {t(
                            "islamicInheritanceCalculator.results.sharesTable.heir"
                          )}
                        </th>
                        <th
                          className={`text-left py-2.5 px-0 text-gray-600 ${FONT_SIZES.fontSemibold} ${FONT_SIZES.tableHeader} border-b border-dashed border-gray-300`}
                        >
                          {t(
                            "islamicInheritanceCalculator.results.sharesTable.fraction"
                          )}
                        </th>
                        <th
                          className={`text-left py-2.5 px-0 text-gray-600 ${FONT_SIZES.fontSemibold} ${FONT_SIZES.tableHeader} border-b border-dashed border-gray-300`}
                        >
                          {t(
                            "islamicInheritanceCalculator.results.sharesTable.amount"
                          )}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.shares.map((share, index) => (
                        <tr key={index}>
                          <td
                            className={`py-2.5 px-0 border-b border-dashed border-gray-300 text-gray-800 ${FONT_SIZES.tableCell}`}
                          >
                            {share.label}
                          </td>
                          <td
                            className={`py-2.5 px-0 border-b border-dashed border-gray-300 font-mono ${FONT_SIZES.tableCell} text-gray-800`}
                          >
                            {share.fraction}
                          </td>
                          <td
                            className={`py-2.5 px-0 border-b border-dashed border-gray-300 font-mono ${FONT_SIZES.tableCell} text-gray-800`}
                          >
                            {fmt(share.amount)} {formData.currency}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Notes */}
            {results.notes.length > 0 && (
              <div className={`mt-4 ${FONT_SIZES.notes} text-gray-600`}>
                {results.notes.map((note, index) => (
                  <div key={index}>• {note}</div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default IslamicInheritanceCalculator;
