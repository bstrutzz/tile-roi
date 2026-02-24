import { useMemo, useState } from "react";

function money(x) {
  if (!Number.isFinite(x)) return "—";
  return x.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function App() {
  const [acres, setAcres] = useState(80);
  const [installCostPerAcre, setInstallCostPerAcre] = useState(1090);
  const [cornPrice, setCornPrice] = useState(4.5);

  // Defaults per your request
  const [baseYield, setBaseYield] = useState(220);
  const [yieldLiftPct, setYieldLiftPct] = useState(12);

  const [discountRate, setDiscountRate] = useState(4);
  const [horizonYears, setHorizonYears] = useState(15);

  const totalCost = useMemo(() => acres * installCostPerAcre, [acres, installCostPerAcre]);

  const yieldBumpBu = useMemo(() => baseYield * (yieldLiftPct / 100), [baseYield, yieldLiftPct]);

  const annualBenefit = useMemo(
    () => acres * yieldBumpBu * cornPrice,
    [acres, yieldBumpBu, cornPrice]
  );

  const paybackYears = useMemo(() => {
    return annualBenefit > 0 ? totalCost / annualBenefit : Infinity;
  }, [totalCost, annualBenefit]);

  const paybackBand = useMemo(() => {
    if (!Number.isFinite(paybackYears)) return { label: "—", bg: "#e5e7eb", fg: "#111827" }; // gray
    const y = paybackYears;

    // Your thresholds:
    // <= 10 green; 10.1-15 yellow; 15.1+ red
    if (y <= 10.0) return { label: "GREEN (≤ 10.0 yrs)", bg: "#16a34a", fg: "white" };
    if (y <= 15.0) return { label: "YELLOW (10.1–15.0 yrs)", bg: "#f59e0b", fg: "#111827" };
    return { label: "RED (≥ 15.1 yrs)", bg: "#dc2626", fg: "white" };
  }, [paybackYears]);

  const npv = useMemo(() => {
    let v = -totalCost;
    const r = discountRate / 100;
    for (let t = 1; t <= horizonYears; t++) {
      v += annualBenefit / Math.pow(1 + r, t);
    }
    return v;
  }, [totalCost, annualBenefit, discountRate, horizonYears]);

  const sensitivity = useMemo(() => {
    const lifts = [5, 10, 15]; // percent lift scenarios
    const r = discountRate / 100;

    return lifts.map((pct) => {
      const bumpBu = baseYield * (pct / 100);
      const benefit = acres * bumpBu * cornPrice;
      const payback = benefit > 0 ? totalCost / benefit : Infinity;

      let v = -totalCost;
      for (let t = 1; t <= horizonYears; t++) {
        v += benefit / Math.pow(1 + r, t);
      }

      return { pct, bumpBu, benefit, payback, npv: v };
    });
  }, [acres, baseYield, cornPrice, discountRate, horizonYears, totalCost]);

  const paybackDisplay = Number.isFinite(paybackYears) ? `${paybackYears.toFixed(2)} years` : "—";

  return (
    <div style={{ padding: 40, fontFamily: "Arial, sans-serif", maxWidth: 1100 }}>
      <h1 style={{ marginTop: 0 }}>Tile Drainage ROI Calculator (Corn)</h1>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>
        <div>
          <h3>Inputs</h3>

          <div style={{ display: "grid", gap: 10 }}>
            <label>
              Acres
              <input
                style={{ display: "block", width: "100%", padding: 8, marginTop: 4 }}
                type="number"
                value={acres}
                onChange={(e) => setAcres(+e.target.value)}
                min="0"
              />
            </label>

            <label>
              Install Cost per Acre ($)
              <input
                style={{ display: "block", width: "100%", padding: 8, marginTop: 4 }}
                type="number"
                value={installCostPerAcre}
                onChange={(e) => setInstallCostPerAcre(+e.target.value)}
                min="0"
              />
            </label>

            <label>
              Corn Price ($/bu)
              <input
                style={{ display: "block", width: "100%", padding: 8, marginTop: 4 }}
                type="number"
                step="0.01"
                value={cornPrice}
                onChange={(e) => setCornPrice(+e.target.value)}
                min="0"
              />
            </label>

            <label>
              Base Yield (bu/acre)
              <input
                style={{ display: "block", width: "100%", padding: 8, marginTop: 4 }}
                type="number"
                value={baseYield}
                onChange={(e) => setBaseYield(+e.target.value)}
                min="0"
              />
            </label>

            <label>
              Yield Lift (%)
              <input
                style={{ display: "block", width: "100%", padding: 8, marginTop: 4 }}
                type="number"
                step="0.1"
                value={yieldLiftPct}
                onChange={(e) => setYieldLiftPct(+e.target.value)}
                min="0"
              />
            </label>

            <label>
              Discount Rate (%)
              <input
                style={{ display: "block", width: "100%", padding: 8, marginTop: 4 }}
                type="number"
                step="0.1"
                value={discountRate}
                onChange={(e) => setDiscountRate(+e.target.value)}
                min="0"
              />
            </label>

            <label>
              Horizon (years)
              <input
                style={{ display: "block", width: "100%", padding: 8, marginTop: 4 }}
                type="number"
                value={horizonYears}
                onChange={(e) => setHorizonYears(+e.target.value)}
                min="1"
              />
            </label>
          </div>
        </div>

        <div>
          <h3>Results</h3>

          {/* Big Payback Badge */}
          <div
            style={{
              borderRadius: 12,
              padding: 16,
              marginBottom: 14,
              border: "1px solid #e5e7eb",
              background: "#f9fafb",
            }}
          >
            <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 0.5, color: "#374151" }}>
              SIMPLE PAYBACK
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginTop: 6 }}>
              <div style={{ fontSize: 32, fontWeight: 800 }}>{paybackDisplay}</div>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 800,
                  padding: "6px 10px",
                  borderRadius: 999,
                  background: paybackBand.bg,
                  color: paybackBand.fg,
                  lineHeight: 1,
                }}
                title="≤ 10.0 green; 10.1–15.0 yellow; ≥ 15.1 red"
              >
                {paybackBand.label}
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gap: 8 }}>
            <div>
              <strong>Total Cost:</strong> ${money(totalCost)}
            </div>
            <div>
              <strong>Annual Benefit:</strong> ${money(annualBenefit)}
            </div>
            <div>
              <strong>Implied Yield Bump:</strong> {yieldBumpBu.toFixed(2)} bu/acre
            </div>
            <div>
              <strong>NPV ({horizonYears} yrs):</strong> ${money(npv)}
            </div>
          </div>

          <h3 style={{ marginTop: 24 }}>Sensitivity (Yield Lift)</h3>
          <div style={{ border: "1px solid #ddd", borderRadius: 8, overflow: "hidden", maxWidth: 560 }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1.2fr 1fr 1fr",
                fontWeight: 700,
                padding: 10,
                borderBottom: "1px solid #ddd",
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
                  borderBottom: idx === sensitivity.length - 1 ? "none" : "1px solid #eee",
                }}
              >
                <div>
                  {row.pct}% ({row.bumpBu.toFixed(1)} bu)
                </div>
                <div>{Number.isFinite(row.payback) ? `${row.payback.toFixed(2)} yrs` : "—"}</div>
                <div>${money(row.npv)}</div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 12, fontSize: 12, color: "#555" }}>
            Note: NPV discounts future benefits at the discount rate. Payback ignores discounting.
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;