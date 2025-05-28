import type { ReactElement } from "react";
import { useState, useEffect } from "react";
import { Building2, CheckCircle2, XCircle } from "lucide-react";

type ToastProps = {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
};

function Toast({ message, type, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed top-4 right-4 z-50 animate-fade-in">
      <div className={`flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg ${type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
        }`}>
        {type === 'success' ? (
          <CheckCircle2 className="w-5 h-5 text-green-500" />
        ) : (
          <XCircle className="w-5 h-5 text-red-500" />
        )}
        <p className="font-medium">{message}</p>
      </div>
    </div>
  );
}

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (numPosts: number) => void;
  clientName: string;
  numPosts: number;
  onNumPostsChange: (value: number) => void;
};

function Modal({ isOpen, onClose, onConfirm, clientName, numPosts, onNumPostsChange }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h3 className="text-lg font-semibold mb-4">Create new blog posts for {clientName}</h3>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            How many posts do you want?
          </label>
          <input
            type="number"
            min="1"
            value={numPosts}
            onChange={(e) => onNumPostsChange(Math.max(1, parseInt(e.target.value) || 1))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(numPosts)}
            className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-md"
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
}

type Client = {
  id: string;
  name: string;
  baseId: string;
  tableName: string;
  locationId?: string;
  count: number;
  approvedCount: number;
};

type Props = {
  clients: Client[];
  selectedClientId: string | null;
  onSelect: (id: string) => void;
  onRefresh?: () => void;
};

export default function ClientSelector({
  clients,
  selectedClientId,
  onSelect,
  onRefresh
}: Props) {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [currentNumPosts, setCurrentNumPosts] = useState(30);

  const handleCreate = async (client: Client) => {
    setSelectedClient(client);
    setCurrentNumPosts(30); // Reset to default when opening modal
    setModalOpen(true);
  };

  const handleConfirmCreate = async (numPosts: number) => {
    setCurrentNumPosts(numPosts); // Update the current number
    if (!selectedClient) return;

    const payload = {
      locationId: selectedClient.locationId,
      numPosts,
    };

    try {
      const response = await fetch('https://n8n.marketingtech.pro/webhook/5a2cb1c9-771d-42aa-b1ee-27b2ff4416a9', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      setToast({ message: 'Blog Post Creation Started', type: 'success' });
      setModalOpen(false);
    } catch (error) {
      console.error("Error sending data to webhook:", error);
      setToast({ message: 'Failed to create blog posts. Please try again.', type: 'error' });
    }
  };

  return (
    <div className="flex flex-col gap-6 max-[930px]:gap-6 min-[930px]:gap-4 mx-auto w-full px-4 min-[930px]:px-0 min-[930px]:w-[910px] mb-8">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      {selectedClient && (
        <Modal
          isOpen={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setCurrentNumPosts(30); // Reset when closing
          }}
          onConfirm={handleConfirmCreate}
          clientName={selectedClient.name}
          numPosts={currentNumPosts}
          onNumPostsChange={setCurrentNumPosts}
        />
      )}
      <div className="bg-white rounded-xl shadow-md p-6 w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Building2 className="w-6 h-6 text-blue-500" />
            Clients
          </h2>
          <button
            onClick={onRefresh}
            className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
            title="Refresh Clients"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
              <path d="M21 3v5h-5" />
              <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
              <path d="M3 21v-5h5" />
            </svg>
          </button>
        </div>
        <ul className="space-y-2">
          {clients.map((client) => (
            <li key={client.id}>
              <div
                tabIndex={0}
                className={"flex items-center justify-between w-full px-4 py-2 rounded-lg transition justify-between cursor-pointer " + (selectedClientId === client.id
                  ? "bg-blue-100 text-blue-700 font-semibold"
                  : "hover:bg-gray-100")}
                onClick={() => onSelect(client.id)}
              >
                <span>{client.name}</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCreate(client);
                    }}
                    className={"text-xs px-2 py-0.5 rounded " + (client.approvedCount > 14 ? "bg-green-500 text-white"
                      : client.approvedCount >= 8 ? "bg-orange-500 text-white"
                        : "bg-red-500 text-white")}
                  >
                    {client.approvedCount} approved
                  </button>
                  <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded">
                    {client.count} to check
                  </span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
