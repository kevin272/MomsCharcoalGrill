// src/components/Dashboard/DashboardTable.jsx
import { cloneElement, isValidElement } from "react";

export default function DashboardTable({
  headers = [],
  rows = [],
  emptyMessage = "No data available",
}) {
  const renderHead = () => (
    <thead className="bg-gray-50 sticky top-0">
      <tr>
        {headers.map((header, idx) => (
          <th
            key={idx}
            scope="col"
            className={`px-4 py-3 text-center align-middle text-sm font-medium text-gray-700 uppercase tracking-wider whitespace-nowrap ${header.className || ""}`}
            style={{ ...header.style, maxWidth: header.maxWidth || "none" }}
          >
            {header.label}
          </th>
        ))}
      </tr>
    </thead>
  );

  const renderBody = () => {
    if (!rows || rows.length === 0) {
      return (
        <tbody className="bg-white divide-y divide-gray-200">
          <tr>
            <td colSpan={Math.max(headers.length, 1)} className="px-4 py-6 text-center text-gray-500">
              {emptyMessage}
            </td>
          </tr>
        </tbody>
      );
    }

    // Support:
    // 1) rows as <tr> elements
    if (isValidElement(rows[0])) {
      return <tbody className="bg-white divide-y divide-gray-200">{rows}</tbody>;
    }

    // 2) rows as arrays of cell values/elements
    if (Array.isArray(rows[0])) {
      return (
        <tbody className="bg-white divide-y divide-gray-200">
          {rows.map((cells, rIdx) => (
            <tr key={rIdx} className="text-center">
              {cells.map((cell, cIdx) => (
                <td key={cIdx} className="px-4 py-3 text-center align-middle">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      );
    }

    // 3) rows as array of objects with .cells
    if (rows[0]?.cells) {
      return (
        <tbody className="bg-white divide-y divide-gray-200">
          {rows.map((row, rIdx) => (
            <tr key={rIdx} className="text-center">
              {row.cells.map((cell, cIdx) => (
                <td key={cIdx} className="px-4 py-3 text-center align-middle">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      );
    }

    // Fallback: render JSON
    return (
      <tbody className="bg-white divide-y divide-gray-200">
        {rows.map((row, rIdx) => (
          <tr key={rIdx} className="text-center">
            <td className="px-4 py-3 text-center align-middle text-left" colSpan={Math.max(headers.length, 1)}>
              <pre className="text-xs bg-gray-50 p-2 rounded border border-gray-100 overflow-x-auto">
                {JSON.stringify(row, null, 2)}
              </pre>
            </td>
          </tr>
        ))}
      </tbody>
    );
  };

  return (
    <div className="overflow-x-auto rounded-lg shadow-md border border-gray-200">
      <table className="min-w-full table-auto divide-y divide-gray-200">
        {renderHead()}
        {renderBody()}
      </table>
    </div>
  );
}
