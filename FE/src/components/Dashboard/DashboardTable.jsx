import { cloneElement } from "react";

export default function DashboardTable({ headers = [], rows = [], emptyMessage = "No data available" }) {
  return (
    <div className="overflow-x-auto rounded-lg shadow-md border border-gray-200">
      <table className="min-w-full table-auto divide-y divide-gray-200">
        {/* Table Header */}
        <thead className="bg-gray-50 sticky top-0">
          <tr>
            {headers.map((header, idx) => (
              <th
                key={idx}
                scope="col"
                className={`px-4 py-3 text-center text-sm font-medium text-gray-700 uppercase tracking-wider whitespace-nowrap ${
                  header.className || ""
                }`}
                style={{ ...header.style, maxWidth: header.maxWidth || "none" }}
              >
                {header.label}
              </th>
            ))}
          </tr>
        </thead>

        {/* Table Body */}
        <tbody className="bg-white divide-y divide-gray-200">
          {rows && rows.length > 0 ? (
            rows.map((row, rIdx) =>
              cloneElement(row, {
                key: rIdx,
                className: `${row.props.className || ""} text-center`
              })
            )
          ) : (
            <tr>
              <td colSpan={headers.length} className="px-4 py-6 text-center text-gray-400 italic">
                {emptyMessage}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
