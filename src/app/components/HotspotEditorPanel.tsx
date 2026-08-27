import type { EditorialHotspot } from "@/app/data/hotspot-registry";

interface HotspotEditorPanelProps {
  isOpen: boolean;
  visiblePageNumbers: number[];
  hotspots: EditorialHotspot[];
  selectedHotspotId: string | null;
  onToggleOpen: () => void;
  onSelect: (id: string | null) => void;
  onAdd: (pageNumber: number) => void;
  onUpdate: (id: string, updates: Partial<EditorialHotspot>) => void;
  onDelete: (id: string) => void;
  onExport: () => void;
  onImport: (jsonText: string) => void;
  onReset: () => void;
}

const numberValue = (value: number) =>
  Number.isFinite(value) ? Number(value.toFixed(3)) : 0;

export function HotspotEditorPanel({
  isOpen,
  visiblePageNumbers,
  hotspots,
  selectedHotspotId,
  onToggleOpen,
  onSelect,
  onAdd,
  onUpdate,
  onDelete,
  onExport,
  onImport,
  onReset,
}: HotspotEditorPanelProps) {
  const selected = hotspots.find((hotspot) => hotspot.id === selectedHotspotId) || null;
  const visibleHotspots = hotspots.filter((hotspot) =>
    visiblePageNumbers.includes(hotspot.placementPage),
  );

  return (
    <div
      className="fixed bottom-5 right-5 z-[1000] w-[min(360px,calc(100vw-2rem))] overflow-hidden rounded-xl border border-white/20 bg-[#071b2f]/95 text-white shadow-2xl backdrop-blur-md"
      data-hotspot-editor="true"
    >
      <button
        type="button"
        className="flex w-full items-center justify-between px-4 py-3 text-left font-semibold hover:bg-white/10"
        onClick={onToggleOpen}
      >
        <span>Link hotspots</span>
        <span aria-hidden="true">{isOpen ? "−" : "+"}</span>
      </button>

      {isOpen && (
        <div className="max-h-[70vh] overflow-y-auto border-t border-white/15 p-4 text-sm">
          <p className="mb-3 text-xs text-white/70">
            Drag a highlighted hotspot to move it. Drag its lower-right handle to resize it. Changes autosave in this browser.
          </p>

          <div className="mb-4 flex flex-wrap gap-2 border-b border-white/10 pb-4">
            <button
              type="button"
              className="rounded-md border border-white/25 bg-white/5 px-2.5 py-1.5 text-xs hover:bg-white/10"
              onClick={onExport}
            >
              Export JSON
            </button>
            <label className="cursor-pointer rounded-md border border-white/25 bg-white/5 px-2.5 py-1.5 text-xs hover:bg-white/10">
              Import JSON
              <input
                type="file"
                accept="application/json,.json"
                className="hidden"
                onChange={async (event) => {
                  const file = event.target.files?.[0];
                  if (!file) return;
                  onImport(await file.text());
                  event.target.value = "";
                }}
              />
            </label>
            <button
              type="button"
              className="rounded-md border border-white/25 bg-white/5 px-2.5 py-1.5 text-xs hover:bg-white/10"
              onClick={onReset}
            >
              Reset defaults
            </button>
          </div>

          <div className="mb-4 flex flex-wrap gap-2">
            {visiblePageNumbers.map((pageNumber) => (
              <button
                key={`add-hotspot-${pageNumber}`}
                type="button"
                className="rounded-md border border-cyan-300/60 bg-cyan-300/10 px-2.5 py-1.5 text-xs font-medium hover:bg-cyan-300/20"
                onClick={() => onAdd(pageNumber)}
              >
                Add on page {pageNumber}
              </button>
            ))}
          </div>

          {visibleHotspots.length > 0 && (
            <div className="mb-4">
              <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-white/60">
                Visible editable links
              </div>
              <div className="flex flex-wrap gap-2">
                {visibleHotspots.map((hotspot) => (
                  <button
                    key={hotspot.id}
                    type="button"
                    className={`rounded-md border px-2 py-1 text-xs ${
                      hotspot.id === selectedHotspotId
                        ? "border-cyan-200 bg-cyan-200/20"
                        : "border-white/20 bg-white/5 hover:bg-white/10"
                    }`}
                    onClick={() => onSelect(hotspot.id)}
                  >
                    p{hotspot.placementPage}: {hotspot.label || "Untitled link"}
                  </button>
                ))}
              </div>
            </div>
          )}

          {!selected ? (
            <div className="rounded-lg border border-dashed border-white/20 p-3 text-xs text-white/60">
              Select a hotspot on the page or add a new one.
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <strong>Page {selected.placementPage}</strong>
                <button
                  type="button"
                  className="rounded-md border border-red-300/40 px-2 py-1 text-xs text-red-100 hover:bg-red-300/10"
                  onClick={() => onDelete(selected.id)}
                >
                  Delete
                </button>
              </div>

              <label className="block">
                <span className="mb-1 block text-xs text-white/70">Accessible label</span>
                <input
                  value={selected.label}
                  onChange={(event) => onUpdate(selected.id, { label: event.target.value })}
                  className="w-full rounded-md border border-white/20 bg-black/25 px-2.5 py-2 text-sm outline-none focus:border-cyan-300"
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-xs text-white/70">Destination type</span>
                <select
                  value={typeof selected.pageNumber === "number" ? "page" : "url"}
                  onChange={(event) => {
                    if (event.target.value === "page") {
                      onUpdate(selected.id, {
                        pageNumber: selected.placementPage,
                        href: undefined,
                      });
                    } else {
                      onUpdate(selected.id, { pageNumber: undefined });
                    }
                  }}
                  className="w-full rounded-md border border-white/20 bg-[#071b2f] px-2.5 py-2 text-sm outline-none focus:border-cyan-300"
                >
                  <option value="url">Web or email link</option>
                  <option value="page">Magazine page</option>
                </select>
              </label>

              {typeof selected.pageNumber === "number" ? (
                <label className="block">
                  <span className="mb-1 block text-xs text-white/70">Target page</span>
                  <input
                    type="number"
                    min={0}
                    step={1}
                    value={selected.pageNumber}
                    onChange={(event) =>
                      onUpdate(selected.id, {
                        pageNumber: Math.max(0, Number(event.target.value) || 0),
                      })
                    }
                    className="w-full rounded-md border border-white/20 bg-black/25 px-2.5 py-2 text-sm outline-none focus:border-cyan-300"
                  />
                </label>
              ) : (
                <label className="block">
                  <span className="mb-1 block text-xs text-white/70">URL or mailto:</span>
                  <input
                    value={selected.href || ""}
                    placeholder="https://… or mailto:…"
                    onChange={(event) => onUpdate(selected.id, { href: event.target.value })}
                    className="w-full rounded-md border border-white/20 bg-black/25 px-2.5 py-2 text-sm outline-none focus:border-cyan-300"
                  />
                </label>
              )}

              <div className="grid grid-cols-4 gap-2">
                {(
                  [
                    ["x", "X"],
                    ["y", "Y"],
                    ["width", "W"],
                    ["height", "H"],
                  ] as const
                ).map(([key, label]) => (
                  <label key={key} className="block">
                    <span className="mb-1 block text-[10px] uppercase text-white/60">{label} %</span>
                    <input
                      type="number"
                      step="0.1"
                      min={key === "width" || key === "height" ? 0.5 : 0}
                      max={100}
                      value={numberValue(selected[key])}
                      onChange={(event) =>
                        onUpdate(selected.id, {
                          [key]: Number(event.target.value) || 0,
                        } as Partial<EditorialHotspot>)
                      }
                      className="w-full rounded-md border border-white/20 bg-black/25 px-2 py-1.5 text-xs outline-none focus:border-cyan-300"
                    />
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
