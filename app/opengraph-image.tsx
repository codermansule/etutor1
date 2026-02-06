import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "ETUTOR — Online Tutoring Marketplace";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "100%",
          backgroundColor: "#0f172a",
          fontFamily: "sans-serif",
        }}
      >
        {/* Sky-500 gradient accent bar at the top */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "6px",
            background: "linear-gradient(to right, #0ea5e9, #22d3ee, #0ea5e9)",
          }}
        />

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "24px",
          }}
        >
          <h1
            style={{
              fontSize: "80px",
              fontWeight: 700,
              color: "#ffffff",
              letterSpacing: "0.08em",
              margin: 0,
            }}
          >
            ETUTOR
          </h1>
          <p
            style={{
              fontSize: "28px",
              color: "#94a3b8",
              margin: 0,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
            }}
          >
            Online Tutoring Marketplace
          </p>
        </div>

        {/* Bottom accent bar */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "6px",
            background: "linear-gradient(to right, #0ea5e9, #22d3ee, #0ea5e9)",
          }}
        />
      </div>
    ),
    { ...size },
  );
}
