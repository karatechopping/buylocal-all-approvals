import React from "react";
import { CheckCircle2, RotateCcw, Trash2 } from "lucide-react";

type ApprovalItem = {
  id: string;
  imageUrls1x1?: string;
  imageUrls2x3?: string;
};

type Props = {
  items: ApprovalItem[];
  onAction: (id: string, action: "Approved" | "Redo" | "Discard") => void;
  loadingIds: string[];
};

export default function ApprovalList({ items, onAction, loadingIds }: Props) {
  if (items.length === 0)
    return (
      <div className="text-gray-500 text-center py-12">
        <span>No items to approve for this client.</span>
      </div>
    );

  return (
    <div className="flex flex-col gap-8">
      {items.map((item, idx) => (
        <React.Fragment key={item.id}>
          <div
            className="bg-white rounded-xl shadow flex flex-col md:flex-row items-center md:items-stretch gap-8 p-6"
          >
            <div className="flex flex-col sm:flex-row gap-6 items-center md:items-start w-full">
              {item.imageUrls1x1 && (
                <img
                  src={item.imageUrls1x1}
                  alt="1x1"
                  className="w-64 h-64 object-cover rounded-lg border shadow-md"
                  style={{ minWidth: 256, minHeight: 256 }}
                />
              )}
              {item.imageUrls2x3 && (
                <img
                  src={item.imageUrls2x3}
                  alt="2x3"
                  className="w-[240px] h-[432px] object-cover rounded-lg border shadow-md"
                  style={{ minWidth: 240, minHeight: 432 }}
                />
              )}
              {!item.imageUrls1x1 && !item.imageUrls2x3 && (
                <img
                  src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80"
                  alt="No image"
                  className="w-64 h-64 object-cover rounded-lg border opacity-40"
                  style={{ minWidth: 256, minHeight: 256 }}
                />
              )}
            </div>
            <div className="flex flex-row md:flex-col gap-4 md:justify-center md:items-end flex-1">
              <button
                className="flex items-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold text-lg shadow transition disabled:opacity-50"
                onClick={() => onAction(item.id, "Approved")}
                disabled={loadingIds.includes(item.id)}
              >
                <CheckCircle2 className="w-6 h-6" />
                Approve
              </button>
              <button
                className="flex items-center gap-2 px-6 py-3 bg-yellow-400 hover:bg-yellow-500 text-gray-900 rounded-lg font-semibold text-lg shadow transition disabled:opacity-50"
                onClick={() => onAction(item.id, "Redo")}
                disabled={loadingIds.includes(item.id)}
              >
                <RotateCcw className="w-6 h-6" />
                Redo
              </button>
              <button
                className="flex items-center gap-2 px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold text-lg shadow transition disabled:opacity-50"
                onClick={() => onAction(item.id, "Discard")}
                disabled={loadingIds.includes(item.id)}
              >
                <Trash2 className="w-6 h-6" />
                Discard
              </button>
            </div>
          </div>
          {/* Mobile-only delimiter between rows */}
          {idx < items.length - 1 && (
            <div className="block md:hidden my-2">
              <hr className="border-t-2 border-gray-200" />
            </div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}
