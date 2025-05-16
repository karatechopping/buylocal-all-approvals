import React, { useEffect, useState, useCallback } from "react";
import {
  fetchAirtableRecords,
  updateAirtableRecord,
  AirtableRecord,
} from "./airtable";
import ClientSelector from "./components/ClientSelector";
import ApprovalList from "./components/ApprovalList";
import { Loader2 } from "lucide-react";

const CONTROL_BASE_ID = "apptHiS9luQVH98CQ";
const CONTROL_TABLE_NAME = "Controls";

type ControlFields = {
  Client: string;
  airtableBase?: string;
  airtableSMPosts?: string;
};

type Client = {
  id: string;
  name: string;
  baseId: string;
  tableName: string;
  count: number;
};

type ApprovalItem = {
  id: string;
  imageUrls1x1?: string;
  imageUrls2x3?: string;
};

function App() {
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [approvalItems, setApprovalItems] = useState<ApprovalItem[]>([]);
  const [loadingClients, setLoadingClients] = useState(true);
  const [loadingApprovals, setLoadingApprovals] = useState(false);
  const [actionLoading, setActionLoading] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  // 1. Load clients from Controls table
  useEffect(() => {
    async function loadClients() {
      setLoadingClients(true);
      setError(null);
      try {
        const controls = await fetchAirtableRecords<ControlFields>(
          CONTROL_BASE_ID,
          CONTROL_TABLE_NAME
        );
        // Only keep clients with both base and table
        const validClients = controls
          .filter(
            (rec) =>
              rec.fields.airtableBase &&
              rec.fields.airtableSMPosts &&
              rec.fields.Client
          )
          .map((rec) => ({
            id: rec.id,
            name: rec.fields.Client,
            baseId: rec.fields.airtableBase!,
            tableName: rec.fields.airtableSMPosts!,
            count: 0,
          }));

        // For each client, fetch count of "Check" status
        const withCounts = await Promise.all(
          validClients.map(async (client) => {
            try {
              const posts = await fetchAirtableRecords(
                client.baseId,
                client.tableName,
                `Status="Check"`,
                ["Status"]
              );
              return { ...client, count: posts.length };
            } catch {
              return { ...client, count: 0 };
            }
          })
        );
        setClients(withCounts);
        // Auto-select first client with items to check
        const firstWithItems = withCounts.find((c) => c.count > 0);
        setSelectedClientId(firstWithItems?.id ?? null);
      } catch (e: any) {
        setError("Failed to load clients. " + e.message);
      } finally {
        setLoadingClients(false);
      }
    }
    loadClients();
  }, []);

  // 2. Load approval items for selected client
  useEffect(() => {
    async function loadApprovals() {
      if (!selectedClientId) {
        setApprovalItems([]);
        return;
      }
      setLoadingApprovals(true);
      setError(null);
      const client = clients.find((c) => c.id === selectedClientId);
      if (!client) return;
      try {
        const posts = await fetchAirtableRecords(
          client.baseId,
          client.tableName,
          `Status="Check"`,
          ["imageUrls1x1", "imageUrls2x3"]
        );
        setApprovalItems(
          posts.map((rec) => ({
            id: rec.id,
            imageUrls1x1: rec.fields.imageUrls1x1,
            imageUrls2x3: rec.fields.imageUrls2x3,
          }))
        );
      } catch (e: any) {
        setError("Failed to load approval items. " + e.message);
        setApprovalItems([]);
      } finally {
        setLoadingApprovals(false);
      }
    }
    loadApprovals();
  }, [selectedClientId, clients]);

  // 3. Approve/Redo action
  const handleAction = useCallback(
    async (id: string, action: "Approved" | "Redo" | "Discard") => {
      const client = clients.find((c) => c.id === selectedClientId);
      if (!client) return;
      setActionLoading((prev) => [...prev, id]);
      setError(null);
      try {
        await updateAirtableRecord(client.baseId, client.tableName, id, {
          Status: action,
        });
        setApprovalItems((items) => items.filter((item) => item.id !== id));
        setClients((prev) =>
          prev.map((c) =>
            c.id === client.id ? { ...c, count: c.count - 1 } : c
          )
        );
      } catch (e: any) {
        setError("Failed to update status. " + e.message);
      } finally {
        setActionLoading((prev) => prev.filter((x) => x !== id));
      }
    },
    [clients, selectedClientId]
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-10">
      <div className="max-w-6xl mx-auto px-4">
        <header className="flex flex-col sm:flex-row items-center justify-center mb-10 relative">
          <div className="mb-4 sm:mb-0 sm:absolute sm:left-0 flex items-center">
            <img
              src="https://buylocal.org.nz/wp-content/uploads/2022/12/buy-local-nz-logo_final_circle_white.png"
              alt="Buy Local NZ Logo"
              style={{
                width: 100,
                height: 100,
                objectFit: "contain",
                borderRadius: "50%",
                background: "#fff",
                boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
              }}
              className="shadow-md"
            />
          </div>
          <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight text-center w-full">
            Client Social Media Approval
          </h1>
        </header>
        {error && (
          <div className="bg-red-100 text-red-700 px-4 py-2 rounded mb-6">
            {error}
          </div>
        )}
        {loadingClients ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="animate-spin w-8 h-8 text-blue-400" />
            <span className="ml-3 text-blue-700 font-medium">
              Loading clients...
            </span>
          </div>
        ) : (
          <>
            <div className="flex justify-center mb-10">
              <div className="w-full sm:w-[60%] md:w-[40%]">
                <ClientSelector
                  clients={clients}
                  selectedClientId={selectedClientId}
                  onSelect={setSelectedClientId}
                />
              </div>
            </div>
            <div className="flex justify-center">
              <div className="w-full md:w-[90%] lg:w-[80%] xl:w-[70%]">
                <div className="bg-white rounded-xl shadow p-6">
                  <h2 className="text-xl font-bold mb-4 text-gray-700">
                    Items to Approve
                  </h2>
                  {loadingApprovals ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="animate-spin w-6 h-6 text-blue-400" />
                      <span className="ml-3 text-blue-700 font-medium">
                        Loading items...
                      </span>
                    </div>
                  ) : (
                    <ApprovalList
                      items={approvalItems}
                      onAction={handleAction}
                      loadingIds={actionLoading}
                    />
                  )}
                </div>
              </div>
            </div>
          </>
        )}
        <footer className="mt-16 text-center text-gray-400 text-sm">
          <span>
            Powered by Airtable &amp; React. Stock images from Unsplash.
          </span>
        </footer>
      </div>
    </div>
  );
}

export default App;
