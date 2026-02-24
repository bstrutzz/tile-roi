import { useMemo, useState } from "react";

function money(x) {
  if (!Number.isFinite(x)) return "—";
  return x.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default function App() {
  // Core inputs
  const [acres, setAcres] = useState(80);
  const [installCostPerAcre, setInstallCostPerAcre] = useState(1090);

  // Prices
  const [cornPrice, setCornPrice] = useState(4.5);
  const [soyPrice, setSoyPrice] = useState(11.5);

  // Yields + lift %
  const [cornYield, setCornYield] = useState(220);
  const [cornYieldBumpPct, setCornYieldBumpPct] = useState(12);

  const [soyYield, setSoyYield] = useState(65);
  const [soyYieldBumpPct, setSoyYieldBumpPct] = useState(8);

  // 50/50 rotation
  const rotationCorn = 0.5;
  const rotationSoy = 0.5;

  const totalCost = useMemo(
    () => acres * installCostPerAcre,
    [acres, installCostPerAcre]
  );

  const cornBumpBu = useMemo(
    () => cornYield * (cornYieldBumpPct / 100),
    [cornYield, cornYieldBumpPct]
  );

  const soyBumpBu = useMemo(
    () => soyYield * (soyYieldBumpPct / 100),
    [soyYield, soyYieldBumpPct]
  );

  const annualBenefit = useMemo(() => {
    const cornBenefit = acres * rotationCorn * cornBumpBu * cornPrice;
    const soyBenefit = acres * rotationSoy * soyBumpBu * soyPrice;
    return cornBenefit + soyBenefit;
  }, [acres, cornBumpBu, soyBumpBu, cornPrice, soyPrice]);

  const annualBenefitPerAcre = useMemo(() => {
    return acres > 0 ? annualBenefit / acres : 0;
  }, [annualBenefit, acres]);

  const paybackYears = useMemo(() => {
    return annualBenefit > 0 ? totalCost / annualBenefit : Infinity;
  }, [totalCost, annualBenefit]);

  const paybackColor =
    paybackYears <= 10
      ? "#16a34a"
      : paybackYears <= 15
        ? "#f59e0b"
        : "#dc2626";

  const sensitivity = useMemo(() => {
    const lifts = [5, 10, 15, 20];

    return lifts.map((pct) => {
      const cornBump = cornYield * (pct / 100);
      const soyBump = soyYield * (pct / 100);

      const benefit =
        acres * rotationCorn * cornBump * cornPrice +
        acres * rotationSoy * soyBump * soyPrice;

      const payback = benefit > 0 ? totalCost / benefit : Infinity;

      return {
        pct,
        benefit,
        payback,
        cornBump,
        soyBump,
      };
    });
  }, [acres, cornYield, soyYield, cornPrice, soyPrice, totalCost]);

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
        <div style={{ textAlign: "center", marginBottom: 22 }}>
          <img
            src="/sfd-logo.png"
            alt="Strutzenberg Logo"
            style={{ width: 360, maxWidth: "90%", height: "auto" }}
          />
        </div>

        <div
          style={{
            textAlign: "center",
            fontSize: 18,
            color: "#374151",
            marginBottom: 18,
          }}
        >
          Your land. Your legacy. Our expertise.
        </div>

        <h1
          style={{
            textAlign: "center",
            margin: "0 0 4px 0",
            fontSize: 44,
          }}
        >
          Tile Drainage ROI Calculator
        </h1>

        <div
          style={{
            textAlign: "center",
            fontSize: 20,
            fontWeight: 600,
            color: "#6b7280",
            marginBottom: 34,
          }}
        >
          (50/50 Corn/Soy)
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
                style={{ width: "100%", marginBottom: 18, padding: 8 }}
              />

              <div style={{ fontWeight: 800, marginBottom: 10 }}>
                Corn (50%)
              </div>

              <label>Corn Price ($/bu)</label>
              <input
                type="number"
                value={cornPrice}
                onChange={(e) => setCornPrice(+e.target.value)}
                style={{ width: "100%", marginBottom: 12, padding: 8 }}
              />

              <label>Corn Base Yield</label>
              <input
                type="number"
                value={cornYield}
                onChange={(e) => setCornYield(+e.target.value)}
                style={{ width: "100%", marginBottom: 12, padding: 8 }}
              />

              <label>Corn Yield Bump (%)</label>
              <input
                type="number"
                value={cornYieldBumpPct}
                onChange={(e) => setCornYieldBumpPct(+e.target.value)}
                style={{ width: "100%", marginBottom: 18, padding: 8 }}
              />

              <div style={{ fontWeight: 800, marginBottom: 10 }}>
                Soybeans (50%)
              </div>

              <label>Soy Price ($/bu)</label>
              <input
                type="number"
                value={soyPrice}
                onChange={(e) => setSoyPrice(+e.target.value)}
                style={{ width: "100%", marginBottom: 12, padding: 8 }}
              />

              <label>Soy Base Yield</label>
              <input
                type="number"
                value={soyYield}
                onChange={(e) => setSoyYield(+e.target.value)}
                style={{ width: "100%", marginBottom: 12, padding: 8 }}
              />

              <label>Soy Yield Bump (%)</label>
              <input
                type="number"
                value={soyYieldBumpPct}
                onChange={(e) => setSoyYieldBumpPct(+e.target.value)}
                style={{ width: "100%", padding: 8 }}
              />
            </div>

            {/* Results */}
            <div>
              <h3>Results</h3>

              <div style={{ marginBottom: 18 }}>
                <div style={{ fontWeight: 700 }}>Simple Payback</div>
                <div
                  style={{
                    fontSize: 52,
                    fontWeight: 900,
                    color: paybackColor,
                    marginTop: 6,
                  }}
                >
                  {Number.isFinite(paybackYears)
                    ? `${paybackYears.toFixed(2)} years`
                    : "—"}
                </div>
              </div>

              <div style={{ marginBottom: 8 }}>
                <strong>Total Cost:</strong> ${money(totalCost)}
              </div>

              <div style={{ marginBottom: 8 }}>
                <strong>Annual Benefit (50/50):</strong>{" "}
                ${money(annualBenefit)}
              </div>

              <div style={{ marginBottom: 14 }}>
                <strong>Annual Benefit per Acre:</strong>{" "}
                ${money(annualBenefitPerAcre)} / ac / yr
              </div>

              <div style={{ marginBottom: 6 }}>
                <strong>Corn implied bump:</strong>{" "}
                {cornBumpBu.toFixed(2)} bu/ac
              </div>

              <div style={{ marginBottom: 18 }}>
                <strong>Soy implied bump:</strong>{" "}
                {soyBumpBu.toFixed(2)} bu/ac
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}