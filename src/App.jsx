import { useMemo, useState } from "react";

function money(x) {
  if (!Number.isFinite(x)) return "—";
  return x.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default function App() {
  const [acres, setAcres] = useState(80);
  const [installCostPerAcre, setInstallCostPerAcre] = useState(1090);
  const [cornPrice, setCornPrice] = useState(4.5);

  const [baseYield, setBaseYield] = useState(220);
  const [yieldLiftPct, setYieldLiftPct] = useState(12);

  const [discountRate, setDiscountRate] = useState(4);
  const [horizonYears, setHorizonYears] = useState(15);

  const totalCost = useMemo(
    () => acres * installCostPerAcre,
    [acres, installCostPerAcre]
  );

  const yieldBumpBu = useMemo(
    () => baseYield * (yieldLiftPct / 100),
    [baseYield, yieldLiftPct]
  );

  const annualBenefit = useMemo(
    () => acres * yieldBumpBu * cornPrice,
    [acres, yieldBumpBu, cornPrice]
  );

  const paybackYears = useMemo(() => {
    return annualBenefit > 0 ? totalCost / annualBenefit : Infinity;
  }, [totalCost, annualBenefit]);

  // Payback thresholds:
  // <= 10 green; 10.1–15 yellow; 15.1+ red
  const paybackColor =
    paybackYears <= 10
      ? "#16a34a"
      : paybackYears <= 15
      ? "#f59e0b"
      : "#dc2626";

  const paybackBand =
    !Number.isFinite(paybackYears)
      ? { text: "—", bg: "#e5e7eb", fg: "#111827" }
      : paybackYears <= 10
      ? { text: "GREEN (≤ 10.0 yrs)", bg: "#16a34a", fg: "#ffffff" }
      : paybackYears <= 15
      ? { text: "YELLOW (10.1–15.0 yrs)", bg: "#f59e0b", fg: "#111827" }
      : { text: "RED (≥ 15.1 yrs)", bg: "#dc2626", fg: "#ffffff" };

  const npv = useMemo(() => {
    let v = -totalCost;
    const r = discountRate / 100;
    for (let t = 1; t <= horizonYears; t++) {
      v += annualBenefit / Math.pow(1 + r, t);
    }
    return v;
  }, [totalCost, annualBenefit, discountRate, horizonYears]);

  // Sensitivity box: 5%, 10%, 15%, 20%
  const sensitivity = useMemo(() => {
    const lifts = [5, 10, 15, 20];
    const r = discountRate / 100;

    return lifts.map((pct) => {
      const bumpBu = baseYield * (pct / 100);
      const benefit = acres * bumpBu * cornPrice;
      const payback = benefit > 0 ? totalCost / benefit : Infinity;

      let v = -totalCost;
      for (let t = 1; t <= horizonYears; t++) {
        v += benefit / Math.pow(1 + r, t);
      }

      return { pct, bumpBu, payback, npv: v };
    });
  }, [acres, baseYield, cornPrice, discountRate, horizonYears, totalCost]);

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#f3f4f6",
        padding: 40,
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        {/* Full-strength logo header */}
        <div style={{ textAlign: "center", marginBottom: 22 }}>
          <img
            src="/sfd-logo.png"
            alt="Strutzenberg Logo"
            style={{ width: 360, maxWidth: "90%", height: "auto" }}
          />
        </div>

        <h1 style={{ textAlign: "center", margin: "0 0 6px 0" }}>
          Tile Drainage ROI Calculator (Corn)
        </h1>

        <div
          style={{
            textAlign: "center",
            fontSize: 18,
            color: "#374151",
            marginBottom: 34,
          }}
        >
          Your land. Your legacy. Our expertise.
        </div>

        <div
          style={{
            backgroundColor: "white",
            padding: 40,
            borderRadius: 16,
            boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 50,
            }}
          >
            {/* Inputs */}
            <div>
              <h3>Inputs</h3>

              <label>Acres</label>
              <input
                type="number"
                value={acres}
                onChange={(e) => setAcres(+e.target.value)}
                style={{ width: "100%", marginBottom: 12, padding: 8 }}
              />

              <label>Install Cost per Acre ($)</label>
              <input
                type="number"
                value={installCostPerAcre}
                onChange={(e) => setInstallCostPerAcre(+e.target.value)}
                style={{ width: "100%", marginBottom: 12, padding: 8 }}
              />

              <label>Corn Price ($/bu)</label>
              <input
                type="number"
                step="0.01"
                value={cornPrice}
                onChange={(e) => setCornPrice(+e.target.value)}
                style={{ width: "100%", marginBottom: 12, padding: 8 }}
              />

              <label>Base Yield (bu/acre)</label>
              <input
                type="number"
                value={baseYield}
                onChange={(e) => setBaseYield(+e.target.value)}
                style={{ width: "100%", marginBottom: 12, padding: 8 }}
              />

              <label>Yield Lift (%)</label>
              <input
                type="number"
                step="0.1"
                value={yieldLiftPct}
                onChange={(e) => setYieldLiftPct(+e.target.value)}
                style={{ width: "100%", marginBottom: 12, padding: 8 }}
              />

              <label>Discount Rate (%)</label>
              <input
                type="number"
                step="0.1"
                value={discountRate}
                onChange={(e) => setDiscountRate(+e.target.value)}
                style={{ width: "100%", marginBottom: 12, padding: 8 }}
              />

              <label>Horizon (years)</label>
              <input
                type="number"
                value={horizonYears}
                onChange={(e) => setHorizonYears(+e.target.value)}
                style={{ width: "100%", padding: 8 }}
              />
            </div>

            {/* Results + Sensitivity */}
            <div>
              <h3>Results</h3>

              <div style={{ marginBottom: 18 }}>
                <div style={{ fontWeight: 700, color: paybackColor }}>
                  Simple Payback
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "baseline",
                    gap: 12,
                    flexWrap: "wrap",
                  }}
                >
                  <div style={{ fontSize: 44, fontWeight: 800 }}>
                    {Number.isFinite(paybackYears)
                      ? `${paybackYears.toFixed(2)} years`
                      : "—"}
                  </div>

                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 800,
                      padding: "6px 10px",
                      borderRadius: 999,
                      background: paybackBand.bg,
                      color: paybackBand.fg,
                      lineHeight: 1,
                    }}
                    title="≤ 10.0 GREEN; 10.1–15.0 YELLOW; ≥ 15.1 RED"
                  >
                    {paybackBand.text}
                  </span>
                </div>
              </div>

              <div style={{ marginBottom: 8 }}>
                <strong>Total Cost:</strong> ${money(totalCost)}
              </div>

              <div style={{ marginBottom: 8 }}>
                <strong>Annual Benefit:</strong> ${money(annualBenefit)}
              </div>

              <div style={{ marginBottom: 8 }}>
                <strong>Implied Yield Bump:</strong>{" "}
                {yieldBumpBu.toFixed(2)} bu/acre
              </div>

              <div style={{ marginBottom: 18 }}>
                <strong>NPV ({horizonYears} yrs):</strong> ${money(npv)}
              </div>

              {/* Sensitivity box */}
              <div style={{ marginTop: 10 }}>
                <h3 style={{ marginBottom: 10 }}>Sensitivity (Yield Lift)</h3>

                <div
                  style={{
                    border: "1px solid #e5e7eb",
                    borderRadius: 12,
                    overflow: "hidden",
                    background: "#ffffff",
                  }}
                >
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1.2fr 1fr 1fr",
                      fontWeight: 700,
                      padding: 10,
                      background: "#f9fafb",
                      borderBottom: "1px solid #e5e7eb",
                    }}
                  >
                    <div>Yield lift</div>
                    <div>Payback</div>
                    <div>NPV</div>
                  </div>

                  {sensitivity.map((row, idx) => (
                    <div
                      key={row.pct}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1.2fr 1fr 1fr",
                        padding: 10,
                        borderBottom:
                          idx === sensitivity.length - 1
                            ? "none"
                            : "1px solid #f1f5f9",
                      }}
                    >
                      <div>
                        {row.pct}% ({row.bumpBu.toFixed(1)} bu)
                      </div>
                      <div>
                        {Number.isFinite(row.payback)
                          ? `${row.payback.toFixed(2)} yrs`
                          : "—"}
                      </div>
                      <div>${money(row.npv)}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div style={{ marginTop: 18, fontSize: 12, color: "#6b7280" }}>
            Note: NPV discounts future benefits at the discount rate. Payback ignores discounting.
          </div>
        </div>
      </div>
    </div>
  );
}