import React from "react";
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
};

export default function ClientSelector({
  clients,
  selectedClientId,
  onSelect,
}: Props) {
  return (
    <div className="bg-white rounded-xl shadow p-6 mb-8">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <Building2 className="w-6 h-6 text-blue-500" />
        Clients
      </h2>
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
  );
}
