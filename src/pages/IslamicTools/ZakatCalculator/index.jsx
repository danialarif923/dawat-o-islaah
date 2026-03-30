import React, { useState } from "react";
import { useLanguage } from "../../../context/LanguageContext";

const ZakatCalculator = () => {
  const { t } = useLanguage();
  const [values, setValues] = useState({
    // Monetary assets
    cash: null,
    goldTolas: null,
    goldPrice: null,
    silverTolas: null,
    silverPrice: null,
    inventory: null,
    liabilities: null,

    // Livestock
    sheepQuantity: null,
    cowQuantity: null,
    camelQuantity: null,

    // Agriculture
    agriMun: null,
    agriKg: null,
    waterType: "",
  });

  // Format numbers with thousands separator
  const formatNumber = (num) => {
    if (num === null || isNaN(num)) return "";
    return new Intl.NumberFormat("en-US").format(num);
  };

  // Parse number safely, handling empty inputs
  const parseNumber = (value) => {
    const numericValue = parseFloat(value.replace(/,/g, ""));
    return isNaN(numericValue) ? null : numericValue;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "waterType") {
      setValues((prev) => ({ ...prev, [name]: value }));
    } else {
      setValues((prev) => ({ ...prev, [name]: parseNumber(value) }));
    }
  };

  // Zakat calculations - exact logic from HTML template
  const calculateZakat = () => {
    const cash = values.cash || 0;
    const goldTolas = values.goldTolas || 0;
    let goldPrice = values.goldPrice || 0;
    const silverTolas = values.silverTolas || 0;
    let silverPrice = values.silverPrice || 0;
    const inventory = values.inventory || 0;
    const liabilities = values.liabilities || 0;

    const tolaToGrams = 11.6;
    const goldGrams = goldTolas * tolaToGrams;
    const silverGrams = silverTolas * tolaToGrams;

    // Default prices logic from HTML template
    let goldPriceMessage = "";
    let silverPriceMessage = "";

    if (goldGrams > 0 && goldPrice === 0) {
      goldPriceMessage = "Using default gold price: PKR 200,000/g";
      goldPrice = 200000;
    }

    if (silverPrice === 0 && (cash > 0 || silverGrams > 0)) {
      silverPriceMessage = "Using default silver price: PKR 300/g";
      silverPrice = 300;
    } else if (silverPrice === 0) {
      silverPrice = 300;
    }

    const goldValue = goldGrams >= 87 ? goldGrams * goldPrice : 0;
    const silverValue = silverGrams * silverPrice;
    const totalAssets =
      cash + goldValue + silverValue + inventory - liabilities;

    const silverNisabGrams = 52.5 * tolaToGrams;
    const silverNisabValue = silverNisabGrams * silverPrice;
    const goldNisabGrams = 87;
    const silverNisabGrams2 = 612;

    let zakatApplicable = false;
    let reasons = [];

    if (goldGrams >= goldNisabGrams) {
      zakatApplicable = true;
      reasons.push("Gold ≥ 87g");
    }
    if (silverGrams >= silverNisabGrams2) {
      zakatApplicable = true;
      reasons.push("Silver ≥ 612g");
    }
    if (cash + silverValue >= silverNisabValue) {
      zakatApplicable = true;
      reasons.push(`Cash+Silver ≥ PKR ${silverNisabValue.toLocaleString()}`);
    }

    const zakatAmount = zakatApplicable ? Math.round(totalAssets * 0.025) : 0;

    return {
      cash,
      goldValue,
      silverValue,
      goldGrams,
      silverGrams,
      inventory,
      liabilities,
      totalAssets,
      zakatApplicable,
      reasons,
      zakatAmount,
      goldPriceMessage,
      silverPriceMessage,
    };
  };

  // Calculate livestock zakat - exact logic from HTML template
  const calculateLivestockZakat = () => {
    const sheepQuantity = values.sheepQuantity || 0;
    const cowQuantity = values.cowQuantity || 0;
    const camelQuantity = values.camelQuantity || 0;

    let livestockText = [];

    // Sheep/Goats zakat
    if (sheepQuantity < 40) {
      // No zakat due
    } else if (sheepQuantity <= 120) {
      livestockText.push("Sheep/Goats: 1 Goat due");
    } else if (sheepQuantity <= 200) {
      livestockText.push("Sheep/Goats: 2 Goats due");
    } else if (sheepQuantity <= 300) {
      livestockText.push("Sheep/Goats: 3 Goats due");
    } else {
      livestockText.push(
        `Sheep/Goats: ${Math.floor(sheepQuantity / 100)} Goats due`
      );
    }

    // Cows zakat
    if (cowQuantity < 30) {
      // No zakat due
    } else if (cowQuantity <= 39) {
      livestockText.push("Cows: 1 (1-Year Bachra)");
    } else if (cowQuantity <= 59) {
      livestockText.push("Cows: 1 (2-Year Bachra)");
    } else if (cowQuantity <= 69) {
      livestockText.push("Cows: 2 (1-Year Bachra)");
    } else if (cowQuantity <= 79) {
      livestockText.push("Cows: 1 (1-Year Bachra), 1 (2-Year Bachra)");
    } else if (cowQuantity <= 89) {
      livestockText.push("Cows: 2 (2-Year Bachra)");
    } else {
      livestockText.push("Cows: 3 (1-Year Bachra)");
    }

    // Camels zakat
    if (camelQuantity < 5) {
      // No zakat due
    } else if (camelQuantity <= 9) {
      livestockText.push("Camels: 1 Goat");
    } else if (camelQuantity <= 14) {
      livestockText.push("Camels: 2 Goats");
    } else if (camelQuantity <= 19) {
      livestockText.push("Camels: 3 Goats");
    } else if (camelQuantity <= 24) {
      livestockText.push("Camels: 4 Goats");
    } else if (camelQuantity <= 35) {
      livestockText.push("Camels: 1 (1-Year Camel)");
    } else if (camelQuantity <= 45) {
      livestockText.push("Camels: 1 (2-Year Camel)");
    } else if (camelQuantity <= 60) {
      livestockText.push("Camels: 1 (3-Year Camel but <4)");
    } else if (camelQuantity <= 75) {
      livestockText.push("Camels: 1 (4-Year Camel but <5)");
    } else if (camelQuantity <= 90) {
      livestockText.push("Camels: 2 (2-Year Camels)");
    } else if (camelQuantity <= 120) {
      livestockText.push("Camels: 2 (3-Year Camels but <4)");
    } else {
      const count40 = Math.floor((camelQuantity - 120) / 40);
      const count50 = Math.floor((camelQuantity - 120) / 50);
      livestockText.push(
        `Camels: 2 (3-Year Camels) + ${count40} (2-Year Camel / 40) + ${count50} (3-Year Camel / 50)`
      );
    }

    return livestockText;
  };

  // Calculate agriculture zakat - exact logic from HTML template
  const calculateAgricultureZakat = () => {
    const agriMun = values.agriMun || 0;
    const agriKg = values.agriKg || 0;
    const totalAgriKg = agriMun * 40 + agriKg;

    if (totalAgriKg >= 690 && values.waterType) {
      let rate = values.waterType === "unirrigated" ? 0.1 : 0.05;
      if (values.waterType === "mixed") rate = 0.075;

      const agriZakatKg = totalAgriKg * rate;
      const zakatMun = Math.floor(agriZakatKg / 40);
      const zakatKg = (agriZakatKg % 40).toFixed(2);

      return {
        applicable: true,
        amount: `${zakatMun} Mun ${zakatKg} Kg`,
        waterType: values.waterType,
      };
    }

    return { applicable: false };
  };

  const zakatResults = calculateZakat();
  const livestockResults = calculateLivestockZakat();
  const agricultureResults = calculateAgricultureZakat();

  const formFields = [
    { key: "cash", label: "Cash/Savings (PKR)" },
    { key: "goldTolas", label: "Gold (tolas)" },
    { key: "goldPrice", label: "Gold Price per Gram (PKR)" },
    { key: "silverTolas", label: "Silver (tolas)" },
    { key: "silverPrice", label: "Silver Price per Gram (PKR)" },
    { key: "inventory", label: "Business Inventory (PKR)" },
    { key: "liabilities", label: "Debts/Liabilities (PKR)" },
    { key: "sheepQuantity", label: "Sheep/Goats Quantity" },
    { key: "cowQuantity", label: "Cows/Buffaloes Quantity" },
    { key: "camelQuantity", label: "Camels Quantity" },
    { key: "agriMun", label: "Agriculture Produce - Mun" },
    { key: "agriKg", label: "Agriculture Produce - Kg" },
  ];

  return (
    <div className="min-h-screen my-12 bg-gradient-to-br from-green-50 to-amber-50 flex items-center justify-center p-6">
      <div className="max-w-4xl w-full bg-white rounded-2xl shadow-[0px_5px_40px_rgba(0,0,0,0.2)] overflow-hidden">
        <div className="bg-green-500 text-white py-2 sm:py-6 px-8 text-center">
          <div className="justify-center sm:flex  mt-5">
            <h2 className="text-4xl font-extrabold tracking-wide py-2 sm:p-0">
              💰
            </h2>
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-wide">
              {t("islamicTools.zakatCalculator.title")}
            </h2>
          </div>
          <p className="text-base sm:text-lg font-light mt-2">
            {t("islamicTools.zakatCalculator.subtitle")}
          </p>
        </div>

        <div className="p-8 sm:p-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {formFields.map((field) => (
              <div key={field.key} className="flex flex-col space-y-2">
                <label
                  className="font-semibold text-gray-700 text-lg"
                  htmlFor={field.key}
                >
                  {t(`islamicTools.zakatCalculator.fields.${field.key}`)}
                </label>
                <input
                  type="text"
                  id={field.key}
                  name={field.key}
                  value={formatNumber(values[field.key])}
                  onChange={handleChange}
                  className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all hover:shadow-md"
                  placeholder={t("islamicTools.zakatCalculator.placeholder")}
                />
                {field.key === "goldTolas" && (
                  <small className="text-gray-500">
                    {t("islamicTools.zakatCalculator.goldTolaNote")}
                  </small>
                )}
                {field.key === "silverTolas" && (
                  <small className="text-gray-500">
                    {t("islamicTools.zakatCalculator.silverTolaNote")}
                  </small>
                )}
                {field.key === "agriMun" && (
                  <small className="text-gray-500">
                    {t("islamicTools.zakatCalculator.agriNisabNote")}
                  </small>
                )}
              </div>
            ))}

            {/* Water Type Dropdown */}
            <div className="flex flex-col space-y-2">
              <label
                className="font-semibold text-gray-700 text-lg"
                htmlFor="waterType"
              >
                {t("islamicTools.zakatCalculator.fields.waterType")}
              </label>
              <select
                id="waterType"
                name="waterType"
                value={values.waterType}
                onChange={handleChange}
                className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all hover:shadow-md"
              >
                <option value="">
                  {t("islamicTools.zakatCalculator.selectWaterType")}
                </option>
                <option value="unirrigated">
                  {t("islamicTools.zakatCalculator.waterTypes.unirrigated")}
                </option>
                <option value="irrigated">
                  {t("islamicTools.zakatCalculator.waterTypes.irrigated")}
                </option>
                <option value="mixed">
                  {t("islamicTools.zakatCalculator.waterTypes.mixed")}
                </option>
              </select>
            </div>
          </div>

          {/* Note */}
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              {t("islamicTools.zakatCalculator.consultJewelerNote")}
            </p>
          </div>

          {/* Results Section */}
          <div className="mt-8 bg-gradient-to-r from-amber-500 to-green-600 p-6 sm:p-8 rounded-xl text-white shadow-lg">
            <h3 className="text-2xl font-semibold text-center mb-6">
              {t("islamicTools.zakatCalculator.resultsTitle")}
            </h3>

            <div className="space-y-4">
              {/* Asset Breakdown */}
              <div className="bg-white/15 bg-opacity-20 p-4 rounded-lg">
                <h4 className="font-bold mb-2">
                  {t("islamicTools.zakatCalculator.assets")}:
                </h4>
                <div className="space-y-1 text-sm">
                  <p>
                    {t("islamicTools.zakatCalculator.cash")}: PKR{" "}
                    {formatNumber(zakatResults.cash)}
                  </p>
                  <p>
                    {t("islamicTools.zakatCalculator.gold")}: PKR{" "}
                    {formatNumber(zakatResults.goldValue)} (
                    {zakatResults.goldGrams.toFixed(2)}g)
                  </p>
                  <p>
                    {t("islamicTools.zakatCalculator.silver")}: PKR{" "}
                    {formatNumber(zakatResults.silverValue)} (
                    {zakatResults.silverGrams.toFixed(2)}g)
                  </p>
                  <p>
                    {t("islamicTools.zakatCalculator.inventory")}: PKR{" "}
                    {formatNumber(zakatResults.inventory)}
                  </p>
                  <p>
                    {t("islamicTools.zakatCalculator.liabilities")}: -PKR{" "}
                    {formatNumber(zakatResults.liabilities)}
                  </p>
                </div>
              </div>

              {/* Price Messages */}
              {zakatResults.goldPriceMessage && (
                <p className="text-yellow-200 text-sm">
                  * {zakatResults.goldPriceMessage}
                </p>
              )}
              {zakatResults.silverPriceMessage && (
                <p className="text-yellow-200 text-sm">
                  * {zakatResults.silverPriceMessage}
                </p>
              )}

              <p className="text-xl font-medium">
                {t("islamicTools.zakatCalculator.totalAssets")}: PKR{" "}
                {formatNumber(zakatResults.totalAssets)}
              </p>

              {/* Monetary Zakat */}
              {zakatResults.zakatApplicable ? (
                <div className="text-center">
                  <p className="text-lg mb-2">
                    ✅ {t("islamicTools.zakatCalculator.zakatApplicable")}:{" "}
                    {zakatResults.reasons.join(", ")}
                  </p>
                  <p className="text-2xl sm:text-3xl font-bold">
                    {t("islamicTools.zakatCalculator.monetaryZakat")}:{" "}
                    <span className="text-yellow-300">
                      PKR {formatNumber(zakatResults.zakatAmount)}
                    </span>
                  </p>
                </div>
              ) : (
                <p className="text-center text-xl">
                  ❌{" "}
                  {t("islamicTools.zakatCalculator.monetaryZakatNotApplicable")}
                </p>
              )}

              {/* Livestock Zakat */}
              {livestockResults.length > 0 && (
                <div className="bg-white/15 bg-opacity-20 p-4 rounded-lg">
                  <h4 className="font-bold mb-2">
                    {t("islamicTools.zakatCalculator.livestockZakat")}:
                  </h4>
                  <div className="space-y-1">
                    {livestockResults.map((result, index) => (
                      <p key={index} className="text-sm">
                        ✅ {result}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {/* Agriculture Zakat */}
              {agricultureResults.applicable ? (
                <div className="bg-white/15 bg-opacity-20 p-4 rounded-lg">
                  <h4 className="font-bold mb-2">
                    {t("islamicTools.zakatCalculator.agricultureZakat")}:
                  </h4>
                  <p className="text-sm">
                    ✅ {agricultureResults.amount}{" "}
                    {t("islamicTools.zakatCalculator.zakatDue")} (
                    {agricultureResults.waterType})
                  </p>
                </div>
              ) : values.agriMun > 0 || values.agriKg > 0 ? (
                <div className="bg-white/15 bg-opacity-20 p-4 rounded-lg">
                  <p className="text-sm">
                    ❌ {t("islamicTools.zakatCalculator.agricultureNoZakat")}
                  </p>
                </div>
              ) : null}
            </div>
          </div>

          <div className="mt-6 flex justify-center">
            <button
              className="bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-6 rounded-lg transition-all shadow-lg transform hover:scale-105 cursor-pointer"
              onClick={() =>
                setValues({
                  cash: null,
                  goldTolas: null,
                  goldPrice: null,
                  silverTolas: null,
                  silverPrice: null,
                  inventory: null,
                  liabilities: null,
                  sheepQuantity: null,
                  cowQuantity: null,
                  camelQuantity: null,
                  agriMun: null,
                  agriKg: null,
                  waterType: "",
                })
              }
            >
              {t("islamicTools.zakatCalculator.reset")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ZakatCalculator;
