import { cloneElement } from "react";

export default function DashboardTable({
  headers = [],
  rows = [],
  emptyMessage = "No data available",
}) {
  const alignClass = (align = "center") => {
    switch (align) {
      case "left":
        return "text-left";
      case "right":
        return "text-right";
      default:
        return "text-center";
    }
  };

  return (
    <div className="overflow-x-auto rounded-lg shadow-md border">
      <table className="min-w-full table-auto divide-y" role="table">
        {/* Table Header */}
        <thead className="bg-gray-50 sticky top-0" role="rowgroup">
          <tr role="row">
            {headers.map((header, idx) => (
              <th
                key={idx}
                scope="col"
                role="columnheader"
                className={`od-th px-4 py-3 whitespace-nowrap ${alignClass(header.align)} ${header.className || ""}`}
                style={{ ...header.style, maxWidth: header.maxWidth || "none" }}
                title={typeof header.label === "string" ? header.label : undefined}
              >
                {header.label}
              </th>
            ))}
          </tr>
        </thead>

        {/* Table Body */}
        <tbody className="divide-y text-center" role="rowgroup">
          {rows && rows.length > 0 ? (
            rows.map((row, rIdx) =>
              cloneElement(row, {
                key: rIdx,
                role: "row",
                className: `od-row text-center ${row.props.className || ""}`,
              })
            )
          ) : (
            <tr role="row">
              <td
                role="cell"
                colSpan={Math.max(headers.length, 1)}
                className="px-4 py-6 text-center text-gray-400 italic"
              >
                {emptyMessage}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}