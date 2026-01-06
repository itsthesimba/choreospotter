// src/components/ColorDropdown.js
import { useState, useRef, useEffect } from "react";

export default function ColorDropdown({ color, onSelect, palettes, selected }) {
  const [open, setOpen] = useState(false);
  const ref = useRef();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    window.addEventListener("mousedown", handleClickOutside);
    return () => window.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} style={{ position: "relative", marginTop: 4 }}>
      <div
        onClick={() => setOpen((prev) => !prev)}
        style={{
          width: "100%",
          height: 24,
          border: selected ? "2px solid #000" : "1px solid #ccc",
          borderRadius: 4,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          padding: "0 6px",
          background: color,
        }}
        title="Click to select preset color"
      />
      {open && (
        <div
          style={{
            position: "absolute",
            top: 28,
            left: 0,
            zIndex: 10,
            background: "#fff",
            border: "1px solid #ccc",
            borderRadius: 4,
            maxHeight: 150,
            overflowY: "auto",
            width: "100%",
            padding: 4,
          }}
        >
          {Object.entries(palettes).map(([name, colors]) => (
            <div key={name} style={{ marginBottom: 4 }}>
              <div style={{ fontSize: 12, fontWeight: "bold", marginBottom: 2 }}>{name}</div>
              <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                {colors.map((c) => (
                  <div
                    key={c}
                    onClick={() => {
                      onSelect(c);
                      setOpen(false);
                    }}
                    style={{
                      width: 18,
                      height: 18,
                      borderRadius: "50%",
                      background: c,
                      cursor: "pointer",
                      border: "1px solid #999",
                    }}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
