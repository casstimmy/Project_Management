import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/router";
import Layout from "@/components/MainLayout/Layout";
import { PageHeader, Button } from "@/components/ui/SharedComponents";
import {
  Upload, Download, Table2, ClipboardPaste, CheckCircle2, XCircle,
  AlertTriangle, FileSpreadsheet, Trash2, ArrowRight, ShieldAlert,
} from "lucide-react";
import toast from "react-hot-toast";
import { jwtDecode } from "jwt-decode";
import fetchWithAuth from "@/lib/fetchWithAuth";
import { IMPORT_ENTITIES, getImportEntity } from "@/lib/importSchemas";

/* ── Tabular text parser: auto-detects comma vs tab, handles quoted fields ── */
function parseTabular(text) {
  const clean = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n").trim();
  if (!clean) return { headers: [], rows: [] };

  const firstLine = clean.split("\n")[0];
  const delimiter = firstLine.includes("\t") ? "\t" : ",";

  const records = [];
  let field = "";
  let record = [];
  let inQuotes = false;

  for (let i = 0; i < clean.length; i++) {
    const ch = clean[i];
    if (inQuotes) {
      if (ch === '"') {
        if (clean[i + 1] === '"') { field += '"'; i++; }
        else inQuotes = false;
      } else field += ch;
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === delimiter) {
      record.push(field); field = "";
    } else if (ch === "\n") {
      record.push(field); records.push(record); field = ""; record = [];
    } else field += ch;
  }
  record.push(field);
  records.push(record);

  const headers = (records.shift() || []).map((h) => h.trim());
  const rows = records
    .filter((r) => r.some((c) => String(c).trim() !== ""))
    .map((r) => r.map((c) => c.trim()));
  return { headers, rows };
}

/* Map parsed headers to entity column keys (match by header label or key, case-insensitive) */
function buildHeaderMap(entity, headers) {
  const map = {};
  headers.forEach((h, idx) => {
    const norm = h.toLowerCase().replace(/[\s_]/g, "");
    const col = entity.columns.find(
      (c) =>
        c.header.toLowerCase().replace(/[\s_().²-]/g, "") === norm.replace(/[().²-]/g, "") ||
        c.key.toLowerCase() === norm ||
        c.header.toLowerCase() === h.toLowerCase()
    );
    if (col) map[idx] = col.key;
  });
  return map;
}

function rowToObject(entity, headerMap, cells) {
  const obj = {};
  Object.entries(headerMap).forEach(([idx, key]) => {
    obj[key] = cells[idx] ?? "";
  });
  return obj;
}

function validateRow(entity, obj) {
  const issues = [];
  for (const col of entity.columns) {
    const v = obj[col.key];
    if (col.required && (v == null || String(v).trim() === "")) {
      issues.push(`${col.header} required`);
    } else if (col.type === "enum" && v && !col.options.includes(String(v).trim())) {
      issues.push(`${col.header} invalid`);
    }
  }
  return issues;
}

export default function ImportPage() {
  const router = useRouter();
  const [role, setRole] = useState(null);
  const [activeKey, setActiveKey] = useState(IMPORT_ENTITIES[0].key);
  const [raw, setRaw] = useState("");
  const [parsed, setParsed] = useState(null); // { headers, rows, headerMap }
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (token) {
      try { setRole(jwtDecode(token).role); } catch { setRole("unknown"); }
    } else {
      setRole("none");
    }
  }, []);

  const entity = getImportEntity(activeKey);

  const resetData = () => { setRaw(""); setParsed(null); setResult(null); };

  const handleSelectEntity = (key) => {
    setActiveKey(key);
    resetData();
  };

  const downloadTemplate = () => {
    const headers = entity.columns.map((c) => c.header);
    const example = entity.columns.map((c) => {
      const ex = c.example ?? "";
      return /[",\n]/.test(ex) ? `"${ex.replace(/"/g, '""')}"` : ex;
    });
    const csv = `${headers.join(",")}\n${example.join(",")}\n`;
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${entity.key}-import-template.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setRaw(String(ev.target.result || ""));
      doParse(String(ev.target.result || ""));
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const doParse = (text) => {
    setResult(null);
    const { headers, rows } = parseTabular(text ?? raw);
    if (headers.length === 0 || rows.length === 0) {
      toast.error("No rows found. Include a header row and at least one data row.");
      setParsed(null);
      return;
    }
    const headerMap = buildHeaderMap(entity, headers);
    if (Object.keys(headerMap).length === 0) {
      toast.error("No columns matched. Use the template headers for this entity.");
      setParsed(null);
      return;
    }
    setParsed({ headers, rows, headerMap });
  };

  const preview = useMemo(() => {
    if (!parsed) return null;
    const objects = parsed.rows.map((cells) => rowToObject(entity, parsed.headerMap, cells));
    const issues = objects.map((o) => validateRow(entity, o));
    const validCount = issues.filter((i) => i.length === 0).length;
    return { objects, issues, validCount };
  }, [parsed, entity]);

  const handleImport = async () => {
    if (!preview) return;
    const okRows = preview.objects.filter((_, i) => preview.issues[i].length === 0);
    if (okRows.length === 0) {
      toast.error("No valid rows to import. Fix the highlighted issues first.");
      return;
    }
    setImporting(true);
    setResult(null);
    try {
      const res = await fetchWithAuth("/api/admin/import", {
        method: "POST",
        body: JSON.stringify({ entity: entity.key, rows: okRows }),
      });

      let data;
      try {
        data = await res.json();
      } catch {
        toast.error(`Server error (${res.status}). The payload may be too large or the server is unreachable.`);
        setImporting(false);
        return;
      }

      if (!res.ok && !data.created) {
        toast.error(data.error || "Import failed");
        if (data.errors) setResult(data);
      } else {
        setResult(data);
        toast.success(`Imported ${data.created} of ${data.total} ${entity.label.toLowerCase()}.`);
      }
    } catch (err) {
      toast.error("Import failed — check your network connection and try again.");
      console.error("Import error:", err);
    } finally {
      setImporting(false);
    }
  };

  /* Access control */
  if (role && role !== "admin" && role !== null) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto p-6">
          <div className="border border-amber-200 bg-amber-50 rounded-md p-6 flex items-start gap-3">
            <ShieldAlert className="text-amber-600 shrink-0" />
            <div>
              <h2 className="font-semibold text-amber-800">Administrators only</h2>
              <p className="text-sm text-amber-700 mt-1">
                The client data import tool is restricted to administrator accounts.
              </p>
              <Button variant="outline" size="sm" className="mt-3" onClick={() => router.push("/homePage")}>
                Back to Dashboard
              </Button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  const mappedKeys = parsed ? new Set(Object.values(parsed.headerMap)) : new Set();

  return (
    <Layout>
      <div className="p-4 sm:p-6 max-w-7xl mx-auto">
        <PageHeader
          title="Client Data Import"
          subtitle="Onboard a new client by importing their facility data from a spreadsheet or another system. Review the data dictionary, paste or upload your data, preview it, then import."
        />

        {/* Entity selector */}
        <div className="flex flex-wrap gap-2 mb-6">
          {IMPORT_ENTITIES.map((e) => (
            <button
              key={e.key}
              onClick={() => handleSelectEntity(e.key)}
              className={`px-3 py-1.5 text-sm rounded-md border transition-colors ${
                activeKey === e.key
                  ? "bg-blue-600 border-blue-600 text-white"
                  : "bg-white border-gray-300 text-gray-600 hover:bg-gray-50"
              }`}
            >
              <span className="text-xs text-current/70 mr-1">{e.order}.</span>{e.label}
            </button>
          ))}
        </div>

        <p className="text-sm text-gray-600 bg-gray-50 border border-gray-200 rounded-md px-4 py-3 mb-6">
          {entity.narration}
        </p>

        {/* Data dictionary */}
        <section className="border border-gray-200 bg-white rounded-md overflow-hidden mb-6">
          <div className="border-b border-gray-200 px-4 py-3 bg-gray-50 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Table2 size={16} className="text-gray-600" />
              <h3 className="text-sm font-semibold text-gray-800">Data Dictionary — {entity.label}</h3>
            </div>
            <Button variant="outline" size="sm" onClick={downloadTemplate}>
              <Download size={14} className="mr-1.5" /> Download CSV Template
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left">
                  <th className="px-4 py-2 font-medium text-gray-500 w-10">#</th>
                  <th className="px-4 py-2 font-medium text-gray-500">Column Header</th>
                  <th className="px-4 py-2 font-medium text-gray-500">Required</th>
                  <th className="px-4 py-2 font-medium text-gray-500">Type</th>
                  <th className="px-4 py-2 font-medium text-gray-500">Allowed Values</th>
                  <th className="px-4 py-2 font-medium text-gray-500">Description</th>
                  <th className="px-4 py-2 font-medium text-gray-500">Example</th>
                </tr>
              </thead>
              <tbody>
                {entity.columns.map((col, i) => (
                  <tr key={col.key} className="border-b border-gray-100 last:border-0 align-top">
                    <td className="px-4 py-2 text-gray-400">{i + 1}</td>
                    <td className="px-4 py-2 font-medium text-gray-800 whitespace-nowrap">{col.header}</td>
                    <td className="px-4 py-2">
                      {col.required ? (
                        <span className="text-xs font-medium text-red-600">Required</span>
                      ) : (
                        <span className="text-xs text-gray-400">Optional</span>
                      )}
                    </td>
                    <td className="px-4 py-2">
                      <span className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded capitalize">{col.type}</span>
                    </td>
                    <td className="px-4 py-2 text-xs text-gray-500 max-w-[220px]">
                      {col.options ? col.options.join(", ") : <span className="text-gray-300">—</span>}
                    </td>
                    <td className="px-4 py-2 text-gray-600 max-w-[320px]">{col.description}</td>
                    <td className="px-4 py-2 text-xs text-gray-400 whitespace-nowrap">{col.example || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Input */}
        <section className="border border-gray-200 bg-white rounded-md mb-6">
          <div className="border-b border-gray-200 px-4 py-3 bg-gray-50 flex items-center gap-2">
            <ClipboardPaste size={16} className="text-gray-600" />
            <h3 className="text-sm font-semibold text-gray-800">Paste or Upload Data</h3>
          </div>
          <div className="p-4 space-y-3">
            <p className="text-xs text-gray-500">
              Paste rows copied directly from Excel/Google Sheets (tab-separated) or CSV text below — or upload a .csv file.
              The first row must be the column headers (matching the dictionary above).
            </p>
            <textarea
              value={raw}
              onChange={(e) => setRaw(e.target.value)}
              rows={6}
              placeholder={`${entity.columns.map((c) => c.header).join(", ")}\n${entity.columns.map((c) => c.example || "").join(", ")}`}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="primary" size="sm" onClick={() => doParse()} disabled={!raw.trim()}>
                <Table2 size={14} className="mr-1.5" /> Preview Data
              </Button>
              <label className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 cursor-pointer">
                <FileSpreadsheet size={14} /> Upload CSV
                <input type="file" accept=".csv,text/csv" className="hidden" onChange={handleFile} />
              </label>
              {(raw || parsed) && (
                <Button variant="ghost" size="sm" onClick={resetData}>
                  <Trash2 size={14} className="mr-1.5" /> Clear
                </Button>
              )}
            </div>
          </div>
        </section>

        {/* Preview */}
        {preview && parsed && (
          <section className="border border-gray-200 bg-white rounded-md overflow-hidden mb-6">
            <div className="border-b border-gray-200 px-4 py-3 bg-gray-50 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Table2 size={16} className="text-gray-600" />
                <h3 className="text-sm font-semibold text-gray-800">Preview</h3>
                <span className="text-xs text-gray-500">
                  {preview.validCount} of {parsed.rows.length} rows ready
                  {preview.validCount < parsed.rows.length && (
                    <span className="text-amber-600"> · {parsed.rows.length - preview.validCount} with issues</span>
                  )}
                </span>
              </div>
              <Button variant="success" size="sm" onClick={handleImport} disabled={importing || preview.validCount === 0}>
                <Upload size={14} className="mr-1.5" />
                {importing ? "Importing…" : `Import ${preview.validCount} ${entity.label}`}
              </Button>
            </div>
            <div className="overflow-x-auto max-h-[28rem] overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-white">
                  <tr className="border-b border-gray-200 text-left">
                    <th className="px-3 py-2 font-medium text-gray-500 w-10">#</th>
                    <th className="px-3 py-2 font-medium text-gray-500 w-24">Status</th>
                    {entity.columns
                      .filter((c) => mappedKeys.has(c.key))
                      .map((c) => (
                        <th key={c.key} className="px-3 py-2 font-medium text-gray-500 whitespace-nowrap">
                          {c.header}
                        </th>
                      ))}
                  </tr>
                </thead>
                <tbody>
                  {preview.objects.map((obj, i) => {
                    const issues = preview.issues[i];
                    const ok = issues.length === 0;
                    return (
                      <tr key={i} className={`border-b border-gray-100 last:border-0 ${ok ? "" : "bg-red-50/40"}`}>
                        <td className="px-3 py-2 text-gray-400">{i + 1}</td>
                        <td className="px-3 py-2">
                          {ok ? (
                            <span className="inline-flex items-center gap-1 text-xs text-emerald-600">
                              <CheckCircle2 size={13} /> Ready
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs text-red-600" title={issues.join("; ")}>
                              <AlertTriangle size={13} /> {issues.length} issue{issues.length > 1 ? "s" : ""}
                            </span>
                          )}
                        </td>
                        {entity.columns
                          .filter((c) => mappedKeys.has(c.key))
                          .map((c) => {
                            const v = obj[c.key];
                            const missing = c.required && (!v || String(v).trim() === "");
                            const badEnum = c.type === "enum" && v && !c.options.includes(String(v).trim());
                            return (
                              <td
                                key={c.key}
                                className={`px-3 py-2 whitespace-nowrap ${missing || badEnum ? "text-red-600 font-medium" : "text-gray-700"}`}
                              >
                                {v && String(v).trim() !== "" ? String(v) : <span className="text-gray-300">—</span>}
                              </td>
                            );
                          })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Result */}
        {result && (
          <section className="border border-gray-200 bg-white rounded-md overflow-hidden mb-6">
            <div className="border-b border-gray-200 px-4 py-3 bg-gray-50 flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-600" />
              <h3 className="text-sm font-semibold text-gray-800">Import Result</h3>
            </div>
            <div className="p-4">
              <div className="flex flex-wrap gap-4 text-sm mb-3">
                <span className="text-gray-600">Submitted: <strong>{result.total}</strong></span>
                <span className="text-emerald-600">Created: <strong>{result.created}</strong></span>
                <span className="text-red-600">Failed: <strong>{result.failed}</strong></span>
              </div>
              {result.errors?.length > 0 && (
                <div className="border border-red-100 rounded-md overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-red-100 bg-red-50/50 text-left">
                        <th className="px-3 py-2 font-medium text-gray-500 w-20">Row</th>
                        <th className="px-3 py-2 font-medium text-gray-500">Reason</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.errors.map((er, i) => (
                        <tr key={i} className="border-b border-red-50 last:border-0">
                          <td className="px-3 py-2 text-gray-500">{er.row}</td>
                          <td className="px-3 py-2 text-red-600 flex items-center gap-1.5">
                            <XCircle size={13} /> {er.error}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {result.created > 0 && entity.key !== "team" && (
                <p className="text-xs text-gray-500 mt-3 flex items-center gap-1">
                  Tip: import in order
                  {IMPORT_ENTITIES.map((e, i) => (
                    <span key={e.key} className="flex items-center gap-1">
                      <span className="font-medium text-gray-600">{e.label}</span>
                      {i < IMPORT_ENTITIES.length - 1 && <ArrowRight size={11} />}
                    </span>
                  ))}
                </p>
              )}
            </div>
          </section>
        )}
      </div>
    </Layout>
  );
}
