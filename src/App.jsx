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
  }, [acres, rotationCorn, rotationSoy, cornBumpBu, soyBumpBu, cornPrice, soyPrice]);

  const annualBenefitPerAcre = useMemo(() => {
    return acres > 0 ? annualBenefit / acres : 0;
  }, [annualBenefit, acres]);

  const paybackYears = useMemo(() => {
    return annualBenefit > 0 ? totalCost / annualBenefit : Infinity;
  }, [totalCost, annualBenefit]);

  const annualROI = useMemo(() => {
    return totalCost > 0 ? (annualBenefit / totalCost) * 100 : 0;
  }, [annualBenefit, totalCost]);

  // Payback thresholds:
  // <= 10 green; 10.1–15 yellow; 15.1+ red
  const paybackColor =
    paybackYears <= 10 ? "#16a34a" : paybackYears <= 15 ? "#f4e803" : "#dc2626";
  const roiColor =
    annualROI >= 15 ? "#166534" :   // strong green
      annualROI >= 10 ? "#16a34a" :   // healthy green
        annualROI >= 6 ? "#65a30d" :   // muted green
          "#dc2626";                      // weak

  // Sensitivity (Yield Lift) - applies SAME lift % to both crops
  const sensitivity = useMemo(() => {
    const lifts = [5, 10, 15, 20];

    return lifts.map((pct) => {
      const cornBump = cornYield * (pct / 100);
      const soyBump = soyYield * (pct / 100);

      const benefit =
        acres * rotationCorn * cornBump * cornPrice +
        acres * rotationSoy * soyBump * soyPrice;

      const payback = benefit > 0 ? totalCost / benefit : Infinity;
      const roi = totalCost > 0 ? (benefit / totalCost) * 100 : 0;

      return { pct, benefit, payback, roi, cornBump, soyBump };
    });
  }, [acres, cornYield, soyYield, cornPrice, soyPrice, totalCost, rotationCorn, rotationSoy]);

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
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 0 }}>
          <img
            src="/sfd-logo.png"
            alt="Strutzenberg Logo"
            style={{ width: 360, maxWidth: "90%", height: "auto" }}
          />
        </div>

        {/* Tagline */}
        <div
          style={{
            textAlign: "center",
            fontFamily: "Orbitron, sans-serif",
            fontWeight: 500,
            letterSpacing: "1.0px",
            fontSize: 16,
            textTransform: "uppercase",
            color: "#1f2937",
            marginTop: -8,
            marginBottom: 28,
          }}
        >
          Your land. Your legacy. Our expertise.
        </div>

        {/* Title */}
        <h1 style={{ textAlign: "center", margin: "0 0 4px 0", fontSize: 44 }}>
          Tile Drainage ROI Calculator
        </h1>

        {/* Subtitle */}
        <div
          style={{
            textAlign: "center",
            fontSize: 20,
            fontWeight: 600,
            color: "#6b7280",
            marginBottom: 34,
          }}
        >
          (50/50 Corn/Soybeans)
        </div>

        {/* Card */}
        <div
          style={{
            backgroundColor: "white",
            padding: 40,
            borderRadius: 16,
            boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
          }}
        >
          <div
            className="layout-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
              gap: 40,
              alignItems: "start",
            }}
          >
            {/* Inputs column */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <h3>Inputs</h3>

              <label style={{ display: "block", marginBottom: 4 }}>
                Acres
              </label>
              <input
                type="number"
                value={acres}
                onChange={(e) => setAcres(+e.target.value)}
                style={{ width: "140px", padding: "6px 8px", marginBottom: 12, borderRadius: 6 }}
              />

              <label style={{ display: "block", marginBottom: 4 }}>
                Investment per acre
              </label>
              <input
                type="number"
                value={installCostPerAcre}
                onChange={(e) => setInstallCostPerAcre(+e.target.value)}
                style={{ width: "140px", padding: "6px 8px", marginBottom: 12, borderRadius: 6 }}
              />

              <div style={{ fontWeight: 800, marginBottom: 10 }}>Corn (50%)</div>

              <label style={{ display: "block", marginBottom: 4 }}>
                Acres
              </label>
              <input
                type="number"
                step="0.01"
                value={cornPrice}
                onChange={(e) => setCornPrice(+e.target.value)}
                style={{ width: "140px", padding: "6px 8px", marginBottom: 18, borderRadius: 6 }}
              />

              <label style={{ display: "block", marginBottom: 4 }}>
                Acres
              </label>
              <input
                type="number"
                value={cornYield}
                onChange={(e) => setCornYield(+e.target.value)}
                style={{ width: "140px", padding: "6px 8px", marginBottom: 18, borderRadius: 6 }}
              />

              <label style={{ display: "block", marginBottom: 4 }}>
                Acres
              </label>
              <input
                type="number"
                step="0.1"
                value={cornYieldBumpPct}
                onChange={(e) => setCornYieldBumpPct(+e.target.value)}
                style={{ width: "140px", padding: "6px 8px", marginBottom: 18, borderRadius: 6 }}
              />

              <div style={{ fontWeight: 800, marginBottom: 10 }}>Soybeans (50%)</div>

              <label style={{ display: "block", marginBottom: 4 }}>
                Acres
              </label>
              <input
                type="number"
                step="0.01"
                value={soyPrice}
                onChange={(e) => setSoyPrice(+e.target.value)}
                style={{ width: "140px", padding: "6px 8px", marginBottom: 18, borderRadius: 6 }}
              />

              <label style={{ display: "block", marginBottom: 4 }}>
                Acres
              </label>
              <input
                type="number"
                value={soyYield}
                onChange={(e) => setSoyYield(+e.target.value)}
                style={{ width: "140px", padding: "6px 8px", marginBottom: 18, borderRadius: 6 }}
              />

              <label style={{ display: "block", marginBottom: 4 }}>
                Acres
              </label>
              <input
                type="number"
                step="0.1"
                value={soyYieldBumpPct}
                onChange={(e) => setSoyYieldBumpPct(+e.target.value)}
                style={{ width: "140px", padding: "6px 8px", marginBottom: 18, borderRadius: 6 }}
              />
            </div>

            {/* Results column */}
            <div>
              <h3>Results</h3>

              {/* Payback */}
              <div
                style={{
                  fontWeight: 900,
                  color: roiColor,
                  marginTop: 6,
                  whiteSpace: "nowrap",
                }}
              >
                <span style={{ fontSize: 52 }}>
                  {Number.isFinite(annualROI)
                    ? `${annualROI.toFixed(2)}%`
                    : "—"}
                </span>{" "}
                <span style={{ fontSize: 28 }}>
                  Annual Return
                </span>
              </div>

              {/* CTA + summary */}
              <div style={{ marginTop: 24 }}>
                <div style={{ textAlign: "center", marginBottom: 18 }}>
                  <a
                    href="tel:17122105183"
                    onClick={() => {
                      if (window.gtag) window.gtag("event", "call_click", { method: "phone" });
                    }}
                    style={{
                      display: "block",
                      width: "100%",
                      maxWidth: 420,
                      margin: "0 auto",
                      padding: "14px 28px",
                      backgroundColor: "rgb(247, 236, 32)",
                      color: "#000000",
                      fontWeight: 700,
                      fontSize: 18,
                      textDecoration: "none",
                      borderRadius: 8,
                      cursor: "pointer",
                      boxShadow: "0 4px 12px rgb(194, 194, 194)",
                      border: "2px solid #838383",
                    }}
                  >
                    Talk Through Your Farm&apos;s Numbers
                  </a>
                </div>

                <div style={{ marginBottom: 8 }}>
                  <strong>Investment:</strong> ${money(totalCost)}
                </div>

                <div style={{ marginBottom: 8 }}>
                  <strong>Annual Benefit:</strong> ${money(annualBenefit)}
                </div>

                <div style={{ marginBottom: 14 }}>
                  <strong>Annual Benefit per Acre:</strong> ${money(annualBenefitPerAcre)} / ac / yr
                </div>

                <div style={{ marginBottom: 6 }}>
                  <strong>Corn yield increase:</strong> {cornBumpBu.toFixed(2)} bu/ac
                </div>

                <div style={{ marginBottom: 18 }}>
                  <strong>Soybean yield increase:</strong> {soyBumpBu.toFixed(2)} bu/ac
                </div>
              </div>

              {/* Sensitivity */}
              <div style={{ marginTop: 20 }}>
                <h3 style={{ marginBottom: 10 }}>Investment Scenario Analysis</h3>

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
                      gridTemplateColumns: "1.1fr 1.1fr 1fr",
                      fontWeight: 700,
                      padding: 10,
                      background: "#f9fafb",
                      borderBottom: "1px solid #e5e7eb",
                    }}
                  >
                    <div>Yield Increase</div>
                    <div>Annual Benefit</div>
                    <div>Payback</div>
                  </div>

                  {sensitivity.map((row, idx) => (
                    <div
                      key={row.pct}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1.3fr 1.1fr 1fr",
                        padding: 10,
                        borderBottom: idx === sensitivity.length - 1 ? "none" : "1px solid #f1f5f9",
                      }}
                    >
                      {/* Yield Increase column */}
                      <div>
                        <div style={{ fontWeight: 800 }}>{row.pct}%</div>
                        <div style={{ fontSize: 12, color: "#6b7280" }}>
                          Corn +{row.cornBump.toFixed(1)} bu • Soy +{row.soyBump.toFixed(1)} bu
                        </div>
                      </div>

                      {/* Annual Benefit column */}
                      <div>${money(row.benefit)}</div>

                      {/* Payback + Annual Return column */}
                      <div>
                        <div>{Number.isFinite(row.payback) ? `${row.payback.toFixed(2)} yrs` : "—"}</div>
                        <div style={{ fontSize: 12, color: "#6b7280" }}>
                          {Number.isFinite(row.roi) ? `${row.roi.toFixed(2)}% annual` : "—"}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ marginTop: 18, fontSize: 12, color: "#6b7280" }}>
          Note: Payback ignores discounting. This version assumes a fixed 50/50 corn/soy rotation.
        </div>
      </div>
    </div>
  );
}