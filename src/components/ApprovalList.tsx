import React, { useState } from "react";
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
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const handleSelectAll = (checked: boolean) => {
    setSelectedItems(checked ? items.map(item => item.id) : []);
  };

  const handleSelectItem = (id: string, checked: boolean) => {
    setSelectedItems(prev => 
      checked ? [...prev, id] : prev.filter(itemId => itemId !== id)
    );
  };

  const handleBulkAction = (action: "Approved" | "Redo" | "Discard") => {
    selectedItems.forEach(id => onAction(id, action));
    setSelectedItems([]); // Clear selection after action
  };

  if (items.length === 0)
    return (
      <div className="text-gray-500 text-center py-12">
        <span>No items to approve for this client.</span>
      </div>
    );

  return (
    <div className="flex flex-col gap-6 sm:gap-4 mx-auto w-full px-4 sm:px-0 sm:w-[880px]">
      {/* Bulk Actions Header */}
      <div className="bg-white rounded-xl shadow-md p-6 w-full">
        <div className="flex flex-col items-start gap-4">
          <div className="flex items-center gap-4 w-full">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={selectedItems.length === items.length}
                onChange={(e) => handleSelectAll(e.target.checked)}
                className="w-5 h-5 rounded"
              />
              <span className="font-medium text-lg">Select All</span>
            </label>
            {selectedItems.length > 0 && (
              <span className="text-gray-600 text-lg">
                {selectedItems.length} item{selectedItems.length !== 1 ? 's' : ''} selected
              </span>
            )}
          </div>

          <div className="flex flex-col sm:flex-row sm:justify-end gap-2">
            <button
              className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold text-lg shadow transition ${
                selectedItems.length > 0 
                ? "bg-green-500 hover:bg-green-600 text-white" 
                : "bg-green-200 text-gray-500 cursor-not-allowed"
              }`}
              onClick={() => selectedItems.length > 0 && handleBulkAction("Approved")}
              disabled={selectedItems.length === 0}
            >
              <CheckCircle2 className="w-5 h-5" />
              Approve Selected
            </button>
            <button
              className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold text-lg shadow transition ${
                selectedItems.length > 0 
                ? "bg-yellow-400 hover:bg-yellow-500 text-gray-900" 
                : "bg-yellow-200 text-gray-500 cursor-not-allowed"
              }`}
              onClick={() => selectedItems.length > 0 && handleBulkAction("Redo")}
              disabled={selectedItems.length === 0}
            >
              <RotateCcw className="w-5 h-5" />
              Redo Selected
            </button>
            <button
              className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold text-lg shadow transition ${
                selectedItems.length > 0 
                ? "bg-red-500 hover:bg-red-600 text-white" 
                : "bg-red-200 text-gray-500 cursor-not-allowed"
              }`}
              onClick={() => selectedItems.length > 0 && handleBulkAction("Discard")}
              disabled={selectedItems.length === 0}
            >
              <Trash2 className="w-5 h-5" />
              Discard Selected
            </button>
          </div>
        </div>
      </div>

      {items.map((item, idx) => (
        <React.Fragment key={item.id}>
          <div className="bg-white rounded-xl shadow-md p-6 w-full">
            <div className="flex flex-col sm:flex-row items-start gap-6">
              <div className="w-full sm:w-auto flex items-center justify-between sm:block mb-4 sm:mb-0">
                {/* Checkbox Column */}
                <div className="pt-1">
                  <input
                    type="checkbox"
                    checked={selectedItems.includes(item.id)}
                    onChange={(e) => handleSelectItem(item.id, e.target.checked)}
                    className="w-6 h-6 rounded"
                  />
                </div>
                {/* Mobile Buttons */}
                <div className="flex sm:hidden gap-3">
                  <button
                    className="p-3 bg-green-500 hover:bg-green-600 text-white rounded-lg shadow disabled:opacity-50"
                    onClick={() => onAction(item.id, "Approved")}
                    disabled={loadingIds.includes(item.id)}
                  >
                    <CheckCircle2 className="w-5 h-5" />
                  </button>
                  <button
                    className="p-3 bg-yellow-400 hover:bg-yellow-500 text-gray-900 rounded-lg shadow disabled:opacity-50"
                    onClick={() => onAction(item.id, "Redo")}
                    disabled={loadingIds.includes(item.id)}
                  >
                    <RotateCcw className="w-5 h-5" />
                  </button>
                  <button
                    className="p-3 bg-red-500 hover:bg-red-600 text-white rounded-lg shadow disabled:opacity-50"
                    onClick={() => onAction(item.id, "Discard")}
                    disabled={loadingIds.includes(item.id)}
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
              {/* Images Column */}
              <div className="flex-1 flex flex-col sm:flex-row gap-8 sm:gap-6">
                {item.imageUrls1x1 && (
                  <img
                    src={item.imageUrls1x1}
                    alt="1x1"
                    className="w-[320px] h-[320px] object-cover rounded-lg border shadow-md sm:flex-shrink-0 max-sm:w-full max-sm:max-w-[400px]"
                    style={{ minWidth: 320, minHeight: 320 }}
                  />
                )}
                {item.imageUrls2x3 && (
                  <img
                    src={item.imageUrls2x3}
                    alt="2x3"
                    className="w-[300px] h-[540px] object-cover rounded-lg border shadow-md sm:flex-shrink-0 max-sm:w-full max-sm:max-w-[400px]"
                    style={{ minWidth: 300, minHeight: 540 }}
                  />
                )}
                {!item.imageUrls1x1 && !item.imageUrls2x3 && (
                  <img
                    src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80"
                    alt="No image"
                    className="w-[320px] h-[320px] object-cover rounded-lg border opacity-40 sm:flex-shrink-0 max-sm:w-full max-sm:max-w-[400px]"
                    style={{ minWidth: 320, minHeight: 320 }}
                  />
                )}
              </div>
              {/* Desktop Buttons Column */}
              <div className="hidden sm:flex flex-col gap-2 shrink-0 ml-6">
                <button
                  className="flex items-center gap-1 px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold text-sm shadow transition disabled:opacity-50"
                  onClick={() => onAction(item.id, "Approved")}
                  disabled={loadingIds.includes(item.id)}
                >
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Approve</span>
                </button>
                <button
                  className="flex items-center gap-1 px-3 py-2 bg-yellow-400 hover:bg-yellow-500 text-gray-900 rounded-lg font-semibold text-sm shadow transition disabled:opacity-50"
                  onClick={() => onAction(item.id, "Redo")}
                  disabled={loadingIds.includes(item.id)}
                >
                  <RotateCcw className="w-5 h-5" />
                  <span>Redo</span>
                </button>
                <button
                  className="flex items-center gap-1 px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold text-sm shadow transition disabled:opacity-50"
                  onClick={() => onAction(item.id, "Discard")}
                  disabled={loadingIds.includes(item.id)}
                >
                  <Trash2 className="w-5 h-5" />
                  <span>Discard</span>
                </button>
              </div>
            </div>
          </div>
        </React.Fragment>
      ))}
    </div>
  );
}
