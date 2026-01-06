import { useState, useRef, useEffect } from "react";

/* ---------- Helpers ---------- */
const lerp = (start, end, t) => start + (end - start) * t;

const createKeyframe = (dancers) => ({
  id: Date.now() + Math.random(),
  duration: 1000,
  positions: dancers.map((d) => ({ id: d.id, x: d.x, y: d.y })),
});

/* ---------- Colour Palettes ---------- */
const COLOR_PALETTES = {
  Bright: ["#e74c3c", "#3498db", "#2ecc71", "#f1c40f", "#9b59b6", "#e67e22", "#000000", "#888888"],
  Soft: ["#ffadad", "#ffd6a5", "#fdffb6", "#caffbf", "#9bf6ff", "#bdb2ff", "#000000", "#888888"],
  Dark: ["#c0392b", "#2980b9", "#27ae60", "#f39c12", "#8e44ad", "#d35400", "#000000", "#888888"],
};

/* ---------- Color Dropdown with Swatches ---------- */
const ColorDropdown = ({ color, onSelect, palettes, selected }) => {
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
};

/* ---------- Initial Dancers ---------- */
const initialDancers = [
  { id: 1, name: "Alex", color: "#e74c3c", x: 150, y: 200 },
  { id: 2, name: "Jamie", color: "#3498db", x: 300, y: 200 },
  { id: 3, name: "Sam", color: "#2ecc71", x: 225, y: 300 },
];

let dancerIdCounter = 100;

/* ---------- App Component ---------- */
function App() {
  const [dancers, setDancers] = useState(initialDancers);
  const [keyframes, setKeyframes] = useState([]);
  const [currentKeyframe, setCurrentKeyframe] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showGrid, setShowGrid] = useState(true);
  const [snapToGrid, setSnapToGrid] = useState(true);
  const [selectedDancerId, setSelectedDancerId] = useState(null);
  const [showGhost, setShowGhost] = useState(true);
  const [prevKeyframePositions, setPrevKeyframePositions] = useState([]);
  const GRID_SIZE = 50;

  /* ---------- Dancer Functions ---------- */
  const startDrag = (e, id) => {
    if (isPlaying) return;
    const dancer = dancers.find((d) => d.id === id);
    const startX = e.clientX;
    const startY = e.clientY;

    const onMove = (moveEvent) => {
      const dx = moveEvent.clientX - startX;
      const dy = moveEvent.clientY - startY;

      setDancers((prev) =>
        prev.map((d) => {
          if (d.id !== id) return d;
          let newX = dancer.x + dx;
          let newY = dancer.y + dy;
          if (snapToGrid) {
            newX = Math.round(newX / GRID_SIZE) * GRID_SIZE;
            newY = Math.round(newY / GRID_SIZE) * GRID_SIZE;
          }
          return { ...d, x: newX, y: newY };
        })
      );
    };

    const onUp = () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  const updateName = (id, newName) =>
    setDancers((prev) => prev.map((d) => (d.id === id ? { ...d, name: newName } : d)));
  const updateColor = (id, newColor) =>
    setDancers((prev) => prev.map((d) => (d.id === id ? { ...d, color: newColor } : d)));

  const addDancer = () => {
    const newDancer = { id: dancerIdCounter++, name: `Dancer ${dancers.length + 1}`, color: "#000000", x: 400, y: 300 };
    setDancers((prev) => [...prev, newDancer]);
    setKeyframes((prev) =>
      prev.map((kf) => ({ ...kf, positions: [...kf.positions, { id: newDancer.id, x: newDancer.x, y: newDancer.y }] }))
    );
  };

  const deleteDancer = (id) => {
    if (!window.confirm("Delete this dancer?")) return;
    setDancers((prev) => prev.filter((d) => d.id !== id));
    setKeyframes((prev) => prev.map((kf) => ({ ...kf, positions: kf.positions.filter((p) => p.id !== id) })));
  };

  /* ---------- Keyframe Functions ---------- */
  const addKeyframe = () => {
    const newKeyframe = createKeyframe(dancers);
    setPrevKeyframePositions(dancers.map((d) => ({ id: d.id, x: d.x, y: d.y })));
    setKeyframes((prev) => [...prev, newKeyframe]);
    setCurrentKeyframe(newKeyframe.id);
    setCurrentIndex(keyframes.length);
  };

  const loadKeyframe = (kf, index) => {
    setPrevKeyframePositions(dancers.map((d) => ({ id: d.id, x: d.x, y: d.y })));
    setCurrentKeyframe(kf.id);
    setCurrentIndex(index);
    setDancers((prev) =>
      prev.map((d) => {
        const pos = kf.positions.find((p) => p.id === d.id);
        return pos ? { ...d, x: pos.x, y: pos.y } : d;
      })
    );
  };

  const deleteKeyframe = (indexToDelete) => {
    if (!window.confirm("Delete this formation?")) return;
    setKeyframes((prev) => {
      const updated = prev.filter((_, i) => i !== indexToDelete);
      if (indexToDelete < currentIndex) setCurrentIndex((i) => i - 1);
      else if (indexToDelete === currentIndex) {
        const newIndex = Math.max(0, currentIndex - 1);
        setCurrentIndex(newIndex);
        setCurrentKeyframe(updated[newIndex]?.id ?? null);
      }
      return updated;
    });
  };

  const goToNextPosition = async () => {
    if (isPlaying) return;
    if (currentIndex >= keyframes.length - 1) return;
    setPrevKeyframePositions(dancers.map((d) => ({ id: d.id, x: d.x, y: d.y })));
    setIsPlaying(true);
    const start = keyframes[currentIndex];
    const end = keyframes[currentIndex + 1];
    const duration = end.duration || 1000;
    const startTime = performance.now();
    await new Promise((resolve) => {
      const animate = (time) => {
        const t = Math.min((time - startTime) / duration, 1);
        setDancers((prev) =>
          prev.map((d) => {
            const from = start.positions.find((p) => p.id === d.id);
            const to = end.positions.find((p) => p.id === d.id);
            if (!from || !to) return d;
            return { ...d, x: lerp(from.x, to.x, t), y: lerp(from.y, to.y, t) };
          })
        );
        if (t < 1) requestAnimationFrame(animate);
        else resolve();
      };
      requestAnimationFrame(animate);
    });
    setCurrentIndex((i) => i + 1);
    setCurrentKeyframe(end.id);
    setIsPlaying(false);
  };

  const goToPreviousPosition = () => {
    if (isPlaying) return;
    if (currentIndex <= 0) return;
    loadKeyframe(keyframes[currentIndex - 1], currentIndex - 1);
  };

  /* ---------- Save & Load ---------- */
  const saveToFile = () => {
    const data = JSON.stringify({ dancers, keyframes }, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "formation.json";
    link.click();
    URL.revokeObjectURL(url);
  };

  const loadFromFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        if (!data.dancers || !data.keyframes) throw new Error("Invalid file");
        setDancers(data.dancers);
        setKeyframes(data.keyframes);
        setCurrentIndex(0);
        setCurrentKeyframe(data.keyframes[0]?.id ?? null);
        setPrevKeyframePositions(data.dancers.map((d) => ({ id: d.id, x: d.x, y: d.y })));
      } catch (err) {
        alert("Failed to load file: " + err.message);
      }
    };
    reader.readAsText(file);
  };

  /* ---------- UI ---------- */
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      {/* Top Controls + Stage */}
      <div style={{ display: "flex", flex: 1 }}>
        {/* Stage */}
        <div>
          {/* Buttons */}
          <div style={{ padding: 10 }}>
            <button onClick={addKeyframe}>➕ Add Formation</button>
            <button onClick={addDancer} style={{ marginLeft: 10 }}>➕ Add Dancer</button>
            <button onClick={goToPreviousPosition} disabled={currentIndex <= 0 || isPlaying} style={{ marginLeft: 10 }}>⏮ Previous</button>
            <button onClick={goToNextPosition} disabled={currentIndex >= keyframes.length - 1 || isPlaying} style={{ marginLeft: 10 }}>⏭ Next</button>
            <button onClick={() => setShowGhost(prev => !prev)} style={{ marginLeft: 10 }}>{showGhost ? "👻 Hide Ghost" : "👻 Show Ghost"}</button>
            <button onClick={saveToFile} style={{ marginLeft: 10 }}>💾 Save</button>
            <label style={{ marginLeft: 10, padding: "4px 6px", border: "1px solid #ccc", borderRadius: 4, cursor: "pointer", background: "#f0f0f0" }}>
              📂 Load
              <input type="file" accept="application/json" onChange={loadFromFile} style={{ display: "none" }} />
            </label>
          </div>

          {/* Grid toggles */}
          <div style={{ padding: "0 10px 10px 10px" }}>
            <label style={{ marginRight: 15 }}><input type="checkbox" checked={showGrid} onChange={e => setShowGrid(e.target.checked)} /> Show Grid</label>
            <label><input type="checkbox" checked={snapToGrid} onChange={e => setSnapToGrid(e.target.checked)} /> Snap to Grid</label>
          </div>

          {/* SVG Stage */}
          <svg width="800" height="600" style={{ border: "1px solid #ccc", background: "#f9f9f9" }}>
            {/* Grid */}
            {showGrid && Array.from({ length: Math.floor(800 / GRID_SIZE) + 1 }).map((_, i) => <line key={`v${i}`} x1={i * GRID_SIZE} y1={0} x2={i * GRID_SIZE} y2={600} stroke="#ccc" strokeWidth={0.5} />)}
            {showGrid && Array.from({ length: Math.floor(600 / GRID_SIZE) + 1 }).map((_, i) => <line key={`h${i}`} x1={0} y1={i * GRID_SIZE} x2={800} y2={i * GRID_SIZE} stroke="#ccc" strokeWidth={0.5} />)}

            {/* Ghost */}
            {showGhost && prevKeyframePositions.map(p => {
              const d = dancers.find(d => d.id === p.id);
              if (!d) return null;
              return <circle key={`ghost-${p.id}`} cx={p.x} cy={p.y} r={15} fill={d.color} opacity={0.3} />;
            })}

            {/* Dancers */}
            {dancers.map(d => (
              <circle
                key={d.id}
                cx={d.x}
                cy={d.y}
                r={15}
                fill={d.color}
                stroke={selectedDancerId === d.id ? "#000" : "none"}
                strokeWidth={selectedDancerId === d.id ? 3 : 0}
                style={{ cursor: isPlaying ? "default" : "pointer" }}
                onMouseDown={e => startDrag(e, d.id)}
                onClick={() => setSelectedDancerId(d.id)}
              />
            ))}
          </svg>
        </div>

        {/* Right Panel */}
        <div style={{ padding: 20, width: 300, overflowY: "auto" }}>
          <h3>Dancers</h3>
          {dancers.map(d => (
            <div key={d.id} style={{ marginBottom: 12, background: selectedDancerId === d.id ? "#ffffcc" : "transparent", padding: 4, borderRadius: 4 }}>
              <div style={{ display: "flex", gap: 6, marginBottom: 4 }}>
                <input type="color" value={d.color} onChange={e => updateColor(d.id, e.target.value)} title="Custom colour" />
                <input type="text" value={d.name} onChange={e => updateName(d.id, e.target.value)} style={{ flex: 1, padding: "2px 6px", borderRadius: 4, border: "1px solid #ccc" }} />
                <button onClick={() => deleteDancer(d.id)} style={{ background: "#e74c3c", color: "white", border: "none", borderRadius: 4, padding: "0 6px", cursor: "pointer", fontSize: 12 }} title="Delete dancer">🗑</button>
              </div>

              {/* Preset Color Dropdown with Highlight */}
              <ColorDropdown color={d.color} onSelect={c => updateColor(d.id, c)} palettes={COLOR_PALETTES} selected={selectedDancerId === d.id} />
            </div>
          ))}

          <h3 style={{ marginTop: 20 }}>Formations</h3>
          {keyframes.map((kf, index) => (
            <div key={kf.id} style={{ marginBottom: 8, padding: 6, border: "1px solid #ccc", borderRadius: 4, background: currentKeyframe === kf.id ? "#eee" : "#fff" }}>
              <div style={{ display: "flex", gap: 4, marginBottom: 4 }}>
                <button onClick={() => loadKeyframe(kf, index)} style={{ flex: 1 }}>Formation {index + 1}</button>
                <button onClick={() => deleteKeyframe(index)} style={{ background: "#e74c3c", color: "white", border: "none", borderRadius: 4, padding: "0 6px", cursor: "pointer" }} title="Delete formation">🗑</button>
              </div>
              <label style={{ fontSize: 12 }}>Duration (sec):
                <input type="number" min="0.1" step="0.1" value={kf.duration / 1000} onChange={e => setKeyframes(prev => prev.map(k => k.id === kf.id ? { ...k, duration: Number(e.target.value) * 1000 } : k))} style={{ width: "100%", marginTop: 2 }} />
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Timeline */}
      <div style={{ display: "flex", gap: 6, padding: 10, overflowX: "auto", borderTop: "1px solid #ccc", background: "#f9f9f9" }}>
        {keyframes.map((kf, index) => (
          <div key={kf.id} onClick={() => loadKeyframe(kf, index)} style={{ width: 40, height: 40, borderRadius: 4, background: currentIndex === index ? "#3498db" : "#ccc", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#fff", fontSize: 12, flexShrink: 0 }} title={`Formation ${index + 1}`}>{index + 1}</div>
        ))}
      </div>
    </div>
  );
}

export default App;
