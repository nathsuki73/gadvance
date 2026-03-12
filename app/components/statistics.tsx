"use client";

import { useState } from "react";

const TABS = ["Participation", "Completion", "Distribution"] as const;
type Tab = (typeof TABS)[number];

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
const COMPLETION_CATEGORIES = [
  "Gender Equality",
  "Leadership",
  "Rights",
  "Wellness",
  "Career Dev",
];
const COMPLETION_VALUES = [85, 78, 92, 88, 81];
const DISTRIBUTION_SLICES = [
  { label: "Non-binary", value: 3, color: "#EC3A95" },
  { label: "Men", value: 35, color: "#F07B00" },
  { label: "Women", value: 62, color: "#0D9F96" },
] as const;

const CHART_DATA: Record<Tab, { men: number[]; women: number[] }> = {
  Participation: {
    men: [4200, 4800, 5400, 6100, 6800, 7600],
    women: [0, 0, 0, 0, 0, 0],
  },
  Completion: {
    men: [0, 0, 0, 0, 0, 0],
    women: [0, 0, 0, 0, 0, 0],
  },
  Distribution: {
    men: [2200, 2700, 3200, 3800, 4400, 5000],
    women: [1000, 1200, 1500, 1900, 2200, 2600],
  },
};

const Y_MAX = 8000;
const Y_TICKS = [8000, 6000, 4000, 2000, 0];
const COMPLETION_Y_MAX = 100;
const COMPLETION_Y_TICKS = [100, 75, 50, 25, 0];

// SVG viewport
const VW = 860;
const VH = 360;
const PL = 58; // pad left
const PR = 24; // pad right
const PT = 20; // pad top
const PB = 52; // pad bottom

const CW = VW - PL - PR;
const CH = VH - PT - PB;

function xAt(i: number) {
  return PL + (i / (MONTHS.length - 1)) * CW;
}

function yAt(val: number) {
  return PT + CH - (val / Y_MAX) * CH;
}

function buildPath(values: number[]) {
  return values
    .map((v, i) => `${i === 0 ? "M" : "L"} ${xAt(i)} ${yAt(v)}`)
    .join(" ");
}

function completionXAt(i: number) {
  return PL + (i / COMPLETION_CATEGORIES.length) * CW;
}

function completionBarWidth() {
  return CW / COMPLETION_CATEGORIES.length - 16;
}

function completionYAt(val: number) {
  return PT + CH - (val / COMPLETION_Y_MAX) * CH;
}

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad),
  };
}

function buildPieSlicePath(
  cx: number,
  cy: number,
  r: number,
  startAngle: number,
  endAngle: number
) {
  const start = polarToCartesian(cx, cy, r, startAngle);
  const end = polarToCartesian(cx, cy, r, endAngle);
  const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;

  return `M ${cx} ${cy} L ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} 1 ${end.x} ${end.y} Z`;
}

export default function Statistics() {
  const [activeTab, setActiveTab] = useState<Tab>("Participation");
  const { men, women } = CHART_DATA[activeTab];
  const isCompletion = activeTab === "Completion";
  const isDistribution = activeTab === "Distribution";

  const chartTitle =
    activeTab === "Completion"
      ? "Course Completion Rates"
      : activeTab === "Distribution"
        ? "Gender Distribution"
        : "Gender Participation Over Time";

  const chartSubtitle =
    activeTab === "Completion"
      ? "Success rates across different program categories"
      : activeTab === "Distribution"
        ? "Current platform demographics by gender identity"
        : "Monthly enrollment trends showing gender participation growth";

  return (
    <div className="mt-32">
      {/* Tab Bar */}
      <div className="flex justify-center">
        <div className="inline-flex items-center rounded-full border border-zinc-200 bg-gray-200 p-1 shadow-sm">
          {TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`rounded-full px-5 py-2 text-sm font-medium transition-all ${
                activeTab === tab
                  ? "bg-white text-zinc-900 shadow"
                  : "text-zinc-500 hover:text-zinc-700"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Chart Card */}
      <div className="mt-5 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <h3 className="text-base font-bold text-zinc-900">{chartTitle}</h3>
        <p className="mt-1 text-sm text-zinc-500">{chartSubtitle}</p>

        {/* SVG Chart */}
        <div className={`mt-6 w-full ${isCompletion ? "overflow-x-auto" : "overflow-hidden"}`}>
          <svg
            viewBox={`0 0 ${VW} ${VH}`}
            className="h-auto w-full"
            style={{ minWidth: isCompletion ? 620 : 340 }}
            aria-label={
              isCompletion
                ? "Course completion bar chart"
                : isDistribution
                  ? "Gender distribution pie chart"
                  : "Gender participation line chart"
            }
          >
            {isCompletion ? (
              <>
                {/* Horizontal grid lines */}
                {COMPLETION_Y_TICKS.map((tick) => (
                  <line
                    key={tick}
                    x1={PL}
                    x2={PL + CW}
                    y1={completionYAt(tick)}
                    y2={completionYAt(tick)}
                    stroke="#D1D5DB"
                    strokeWidth={1}
                    strokeDasharray="5 4"
                  />
                ))}

                {/* Vertical grid lines */}
                {COMPLETION_CATEGORIES.map((_, i) => (
                  <line
                    key={`vg-${i}`}
                    x1={completionXAt(i) + completionBarWidth() / 2}
                    x2={completionXAt(i) + completionBarWidth() / 2}
                    y1={PT}
                    y2={PT + CH}
                    stroke="#E5E7EB"
                    strokeWidth={1}
                    strokeDasharray="5 4"
                  />
                ))}

                {/* Axes */}
                <line x1={PL} x2={PL} y1={PT} y2={PT + CH} stroke="#9CA3AF" strokeWidth={1.5} />
                <line x1={PL} x2={PL + CW} y1={PT + CH} y2={PT + CH} stroke="#9CA3AF" strokeWidth={1.5} />

                {/* Y-axis labels */}
                {COMPLETION_Y_TICKS.map((tick) => (
                  <text
                    key={tick}
                    x={PL - 8}
                    y={completionYAt(tick)}
                    textAnchor="end"
                    dominantBaseline="middle"
                    fontSize={13}
                    fill="#6B7280"
                  >
                    {tick}
                  </text>
                ))}

                {/* Completion bars */}
                {COMPLETION_VALUES.map((value, i) => {
                  const barW = completionBarWidth();
                  const x = completionXAt(i) + 8;
                  const y = completionYAt(value);
                  const h = PT + CH - y;
                  const r = Math.min(8, barW / 2, h);
                  const path = `M ${x} ${y + r} Q ${x} ${y} ${x + r} ${y} L ${
                    x + barW - r
                  } ${y} Q ${x + barW} ${y} ${x + barW} ${y + r} L ${
                    x + barW
                  } ${y + h} L ${x} ${y + h} Z`;

                  return (
                    <g key={`bar-${i}`}>
                      <path d={path} fill="#0D9F96" />
                    </g>
                  );
                })}

                {/* X-axis labels */}
                {COMPLETION_CATEGORIES.map((label, i) => (
                  <text
                    key={label}
                    x={completionXAt(i) + completionBarWidth() / 2 + 8}
                    y={PT + CH + 26}
                    textAnchor="middle"
                    fontSize={13}
                    fill="#6B7280"
                  >
                    {label}
                  </text>
                ))}
              </>
            ) : isDistribution ? (
              <>
                {(() => {
                  const cx = VW / 2;
                  const cy = VH / 2 + 10;
                  const r = 95;
                  let currentAngle = 0;

                  return (
                    <>
                      {DISTRIBUTION_SLICES.map((slice) => {
                        const sweep = (slice.value / 100) * 360;
                        const start = currentAngle;
                        const end = currentAngle + sweep;
                        const mid = start + sweep / 2;
                        currentAngle = end;

                        const labelPos = polarToCartesian(cx, cy, r + 28, mid);
                        const textAnchor =
                          labelPos.x > cx + 10
                            ? "start"
                            : labelPos.x < cx - 10
                              ? "end"
                              : "middle";

                        return (
                          <g key={slice.label}>
                            <path
                              d={buildPieSlicePath(cx, cy, r, start, end)}
                              fill={slice.color}
                              stroke="#FFFFFF"
                              strokeWidth={1}
                            />
                            <text
                              x={labelPos.x}
                              y={labelPos.y}
                              textAnchor={textAnchor}
                              dominantBaseline="middle"
                              fontSize={10}
                              fill={slice.color}
                            >
                              {`${slice.label}: ${slice.value}%`}
                            </text>
                          </g>
                        );
                      })}
                    </>
                  );
                })()}
              </>
            ) : (
              <>
                {/* Dashed horizontal grid lines */}
                {Y_TICKS.map((tick) => (
                  <line
                    key={tick}
                    x1={PL}
                    x2={PL + CW}
                    y1={yAt(tick)}
                    y2={yAt(tick)}
                    stroke="#D1D5DB"
                    strokeWidth={1}
                    strokeDasharray="5 4"
                  />
                ))}

                {/* Y-axis labels */}
                {Y_TICKS.map((tick) => (
                  <text
                    key={tick}
                    x={PL - 8}
                    y={yAt(tick)}
                    textAnchor="end"
                    dominantBaseline="middle"
                    fontSize={13}
                    fill="#9CA3AF"
                  >
                    {tick}
                  </text>
                ))}

                {/* X-axis labels */}
                {MONTHS.map((m, i) => (
                  <text
                    key={m}
                    x={xAt(i)}
                    y={PT + CH + 28}
                    textAnchor="middle"
                    fontSize={13}
                    fill="#9CA3AF"
                  >
                    {m}
                  </text>
                ))}

                {/* Women line */}
                {women.some((v) => v > 0) && (
                  <>
                    <path
                      d={buildPath(women)}
                      fill="none"
                      stroke="#0D9F96"
                      strokeWidth={2.5}
                      strokeLinejoin="round"
                      strokeLinecap="round"
                    />
                    {women.map((v, i) => (
                      <circle
                        key={i}
                        cx={xAt(i)}
                        cy={yAt(v)}
                        r={5}
                        fill="#0D9F96"
                        stroke="white"
                        strokeWidth={2}
                      />
                    ))}
                  </>
                )}

                {/* Men line */}
                <path
                  d={buildPath(men)}
                  fill="none"
                  stroke="#F07B00"
                  strokeWidth={2.5}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
                {men.map((v, i) => (
                  <circle
                    key={i}
                    cx={xAt(i)}
                    cy={yAt(v)}
                    r={5}
                    fill="#F07B00"
                    stroke="white"
                    strokeWidth={2}
                  />
                ))}
              </>
            )}
          </svg>
        </div>

        {/* Legend */}
        {!isCompletion && !isDistribution && (
          <div className="mt-2 flex items-center justify-center gap-8">
            <span className="inline-flex items-center gap-2 text-sm text-zinc-600">
              <span className="flex items-center gap-1">
                <span className="block h-0.5 w-4 rounded bg-[#0D9F96]" />
                <span className="block h-2.5 w-2.5 rounded-full border-2 border-[#0D9F96] bg-white" />
              </span>
              Women
            </span>
            <span className="inline-flex items-center gap-2 text-sm text-zinc-600">
              <span className="flex items-center gap-1">
                <span className="block h-0.5 w-4 rounded bg-[#F07B00]" />
                <span className="block h-2.5 w-2.5 rounded-full border-2 border-[#F07B00] bg-white" />
              </span>
              Men
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
