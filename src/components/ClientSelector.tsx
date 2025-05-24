import type { ReactElement } from "react";
import { Building2 } from "lucide-react";

type Client = {
  id: string;
  name: string;
  baseId: string;
  tableName: string;
  count: number;
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
  return (
    <div className="flex flex-col gap-6 max-[930px]:gap-6 min-[930px]:gap-4 mx-auto w-full px-4 min-[930px]:px-0 min-[930px]:w-[910px] mb-8">
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
              <button
                className={`flex items-center justify-between w-full px-4 py-2 rounded-lg transition
                  ${
                    selectedClientId === client.id
                      ? "bg-blue-100 text-blue-700 font-semibold"
                      : "hover:bg-gray-100"
                  }`}
                onClick={() => onSelect(client.id)}
              >
                <span>{client.name}</span>
                <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded">
                  {client.count} to check
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}