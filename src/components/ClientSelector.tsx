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
    <div className="flex flex-col gap-6 max-[930px]:gap-6 min-[930px]:gap-4 mx-auto w-full px-4 min-[930px]:px-0 min-[930px]:w-[910px] mb-8">
      <div className="bg-white rounded-xl shadow-md p-6 w-full">
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
    </div>
  );
}
