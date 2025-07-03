import React, { useState } from "react";
import { CheckCircle2, RotateCcw, Trash2, Edit2, Save, X } from "lucide-react";

type ApprovalItem = {
  id: string;
  imageUrls1x1?: string;
  imageUrls2x3?: string;
  content?: string;
};

type Props = {
  items: ApprovalItem[];
  onAction: (id: string, action: "Approved" | "Redo" | "Discard") => void;
  onContentUpdate: (id: string, content: string) => void;
  loadingIds: string[];
};

export default function ApprovalList({ items, onAction, onContentUpdate, loadingIds }: Props) {
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState<string>("");

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
    <div className="flex flex-col gap-6 max-[930px]:gap-6 min-[930px]:gap-4 mx-auto w-full px-4 min-[930px]:px-0 min-[930px]:w-[910px]">
      {/* Bulk Actions Header */}
      <div className="bg-white rounded-xl shadow-md p-6 w-full">
        {/* Mobile layout: Select All + item count and buttons side-by-side */}
        <div className="flex items-center justify-between w-full min-[930px]:hidden">
          <div className="flex items-center gap-2">
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
          
          {/* Mobile-only buttons */}
          <div className="flex gap-3">
            <button
              className={`flex items-center justify-center p-3 rounded-lg shadow transition ${
                selectedItems.length > 0 
                ? "bg-green-500 hover:bg-green-600 text-white" 
                : "bg-green-200 text-gray-500 cursor-not-allowed"
              }`}
              onClick={() => selectedItems.length > 0 && handleBulkAction("Approved")}
              disabled={selectedItems.length === 0}
            >
              <CheckCircle2 className="w-5 h-5" />
            </button>
            <button
              className={`flex items-center justify-center p-3 rounded-lg shadow transition ${
                selectedItems.length > 0 
                ? "bg-yellow-400 hover:bg-yellow-500 text-gray-900" 
                : "bg-yellow-200 text-gray-500 cursor-not-allowed"
              }`}
              onClick={() => selectedItems.length > 0 && handleBulkAction("Redo")}
              disabled={selectedItems.length === 0}
            >
              <RotateCcw className="w-5 h-5" />
            </button>
            <button
              className={`flex items-center justify-center p-3 rounded-lg shadow transition ${
                selectedItems.length > 0 
                ? "bg-red-500 hover:bg-red-600 text-white" 
                : "bg-red-200 text-gray-500 cursor-not-allowed"
              }`}
              onClick={() => selectedItems.length > 0 && handleBulkAction("Discard")}
              disabled={selectedItems.length === 0}
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        {/* Desktop layout: Select All + side-by-side buttons */}
        <div className="hidden min-[930px]:block">
          <div className="flex items-center justify-between">
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
            <div className="flex gap-2 ml-4">
              <button
                className={`flex items-center justify-center gap-1 px-3 py-2 rounded-lg font-semibold text-sm shadow transition ${
                  selectedItems.length > 0 
                  ? "bg-green-500 hover:bg-green-600 text-white" 
                  : "bg-green-200 text-gray-500 cursor-not-allowed"
                }`}
                onClick={() => selectedItems.length > 0 && handleBulkAction("Approved")}
                disabled={selectedItems.length === 0}
              >
                <CheckCircle2 className="w-5 h-5" />
                <span>Approve</span>
            </button>
              <button
                className={`flex items-center justify-center gap-1 px-3 py-2 rounded-lg font-semibold text-sm shadow transition ${
                  selectedItems.length > 0 
                  ? "bg-yellow-400 hover:bg-yellow-500 text-gray-900" 
                  : "bg-yellow-200 text-gray-500 cursor-not-allowed"
                }`}
                onClick={() => selectedItems.length > 0 && handleBulkAction("Redo")}
                disabled={selectedItems.length === 0}
              >
                <RotateCcw className="w-5 h-5" />
                <span>Redo</span>
            </button>
              <button
                className={`flex items-center justify-center gap-1 px-3 py-2 rounded-lg font-semibold text-sm shadow transition ${
                  selectedItems.length > 0 
                  ? "bg-red-500 hover:bg-red-600 text-white" 
                  : "bg-red-200 text-gray-500 cursor-not-allowed"
                }`}
                onClick={() => selectedItems.length > 0 && handleBulkAction("Discard")}
                disabled={selectedItems.length === 0}
              >
                <Trash2 className="w-5 h-5" />
                <span>Discard</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Item List */}
      {items.map((item, idx) => (
        <React.Fragment key={item.id}>
          <div className="bg-white rounded-xl shadow-md p-6 w-full">
            <div className="flex flex-col min-[930px]:flex-row items-start gap-6">
              <div className="w-full min-[930px]:w-auto flex items-center justify-between min-[930px]:block mb-4 min-[930px]:mb-0">
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
                <div className="flex min-[930px]:hidden gap-3">
                  <button
                    className="p-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg shadow disabled:opacity-50"
                    onClick={() => {
                      setEditingId(item.id);
                      setEditContent(item.content || "");
                    }}
                    disabled={loadingIds.includes(item.id) || editingId === item.id}
                    title="Edit Content"
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
                  <button
                    className="p-3 bg-green-500 hover:bg-green-600 text-white rounded-lg shadow disabled:opacity-50"
                    onClick={() => onAction(item.id, "Approved")}
                    disabled={loadingIds.includes(item.id)}
                    title="Approve for posting"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                  </button>
                  <button
                    className="p-3 bg-yellow-400 hover:bg-yellow-500 text-gray-900 rounded-lg shadow disabled:opacity-50"
                    onClick={() => onAction(item.id, "Redo")}
                    disabled={loadingIds.includes(item.id)}
                    title="!! Only recreates image, not text !!"
                  >
                    <RotateCcw className="w-5 h-5" />
                  </button>
                  <button
                    className="p-3 bg-red-500 hover:bg-red-600 text-white rounded-lg shadow disabled:opacity-50"
                    onClick={() => onAction(item.id, "Discard")}
                    disabled={loadingIds.includes(item.id)}
                    title="Trash"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              {/* Content and Images Column */}
              <div className="flex-1 flex flex-col gap-4">
                {/* Content Text */}
                {(item.content || editingId === item.id) && (
                  <div className="bg-gray-50 p-4 rounded-lg border">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Post Content</span>
                    </div>
                    {editingId === item.id ? (
                      <div className="space-y-3">
                        <textarea
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          className="w-full p-3 border rounded-md text-sm leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          rows={4}
                          placeholder="Enter post content..."
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              onContentUpdate(item.id, editContent);
                              setEditingId(null);
                            }}
                            className="flex items-center gap-1 px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold text-sm shadow transition"
                          >
                            <Save className="w-4 h-4" />
                            <span>Save</span>
                          </button>
                          <button
                            onClick={() => {
                              setEditingId(null);
                              setEditContent("");
                            }}
                            className="flex items-center gap-1 px-3 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-semibold text-sm shadow transition"
                          >
                            <X className="w-4 h-4" />
                            <span>Cancel</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-800 whitespace-pre-wrap text-sm leading-relaxed">
                        {item.content || <span className="text-gray-400 italic">No content</span>}
                      </p>
                    )}
                  </div>
                )}
                
                {/* Images */}
                <div className="flex flex-col min-[930px]:flex-row gap-8 min-[930px]:gap-6 min-[930px]:items-start">
                {item.imageUrls1x1 && (
                  <div className="max-[930px]:w-full max-[930px]:flex max-[930px]:justify-center">
                    <img
                      src={item.imageUrls1x1}
                      alt="1x1"
                      className="min-[930px]:w-[320px] max-[930px]:w-[400px] object-cover rounded-lg border shadow-md"
                      style={{ 
                        width: "320px",
                        maxWidth: "400px"
                      }}
                    />
                  </div>
                )}
                {item.imageUrls2x3 && (
                  <div className={`max-[930px]:w-full max-[930px]:flex max-[930px]:justify-center ${!item.imageUrls1x1 ? 'min-[930px]:h-[540px] min-[930px]:w-[320px]' : ''}`}>
                    {!item.imageUrls1x1 ? (
                      <img
                        src={item.imageUrls2x3}
                        alt="2x3"
                        className="min-[930px]:h-[540px] min-[930px]:w-auto max-[930px]:w-[400px] object-contain rounded-lg border shadow-md"
                        style={{ 
                          maxHeight: "540px",
                          maxWidth: "320px"
                        }}
                      />
                    ) : (
                      <img
                        src={item.imageUrls2x3}
                        alt="2x3"
        className="min-[930px]:w-[320px] max-[930px]:w-[400px] object-cover rounded-lg border shadow-md"
        style={{ 
          width: "320px",
          maxWidth: "400px"
        }}
                      />
                    )}
                  </div>
                )}
                {!item.imageUrls1x1 && !item.imageUrls2x3 && (
                  <div className="max-[930px]:w-full max-[930px]:flex max-[930px]:justify-center">
                    <img
                      src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80"
                      alt="No image"
                      className="min-[930px]:w-[320px] max-[930px]:w-[400px] object-cover rounded-lg border opacity-40"
                      style={{ 
                        width: "320px", 
                        height: "320px",
                        maxWidth: "400px"
                      }}
                    />
                  </div>
                )}
                </div>
              </div>
              
              {/* Desktop Buttons Column */}
              <div className="hidden min-[930px]:flex flex-col gap-2 shrink-0 ml-6">
                <button
                  className="flex items-center gap-1 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold text-sm shadow transition disabled:opacity-50"
                  onClick={() => {
                    setEditingId(item.id);
                    setEditContent(item.content || "");
                  }}
                  disabled={loadingIds.includes(item.id) || editingId === item.id}
                  title="Edit Content"
                >
                  <Edit2 className="w-5 h-5" />
                  <span>Edit</span>
                </button>
                <button
                  className="flex items-center gap-1 px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold text-sm shadow transition disabled:opacity-50"
                  onClick={() => onAction(item.id, "Approved")}
                  disabled={loadingIds.includes(item.id)}
                  title="Approve for posting"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Approve</span>
                </button>
                <button
                  className="flex items-center gap-1 px-3 py-2 bg-yellow-400 hover:bg-yellow-500 text-gray-900 rounded-lg font-semibold text-sm shadow transition disabled:opacity-50"
                  onClick={() => onAction(item.id, "Redo")}
                  disabled={loadingIds.includes(item.id)}
                  title="!! Only recreates image, not text !!"
                >
                  <RotateCcw className="w-5 h-5" />
                  <span>Redo</span>
                </button>
                <button
                  className="flex items-center gap-1 px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold text-sm shadow transition disabled:opacity-50"
                  onClick={() => onAction(item.id, "Discard")}
                  disabled={loadingIds.includes(item.id)}
                  title="Trash"
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