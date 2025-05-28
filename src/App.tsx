import { useEffect, useState } from "react";
import {
  fetchAirtableRecords,
  updateAirtableRecord,
} from "./airtable";
import { PasswordProtection } from "./components/PasswordProtection";
import ClientSelector from "./components/ClientSelector";
import ApprovalList from "./components/ApprovalList";
import FeaturedApprovals from "./components/FeaturedApprovals";
import { Loader2 } from "lucide-react";

const CONTROL_BASE_ID = "apptHiS9luQVH98CQ";
const CONTROL_TABLE_NAME = "Controls";

interface ControlFields {
  Client: string;
  airtableBase?: string;
  airtableSMPosts?: string;
  locationId?: string;
}

interface PostFields {
  Status?: string;
  imageUrls1x1?: string;
  imageUrls2x3?: string;
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

type ApprovalItem = {
  id: string;
  imageUrls1x1?: string;
  imageUrls2x3?: string;
};

type ViewMode = 'tool-select' | 'social' | 'featured';

function App() {
  // Changed this line to check sessionStorage on initial load
  const [isAuthenticated, setIsAuthenticated] = useState(() =>
    sessionStorage.getItem('isAuthenticated') === 'true'
  );

  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    const savedMode = localStorage.getItem('viewMode');
    return (savedMode as ViewMode) || 'tool-select';
  });
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [approvalItems, setApprovalItems] = useState<ApprovalItem[]>([]);
  const [loadingClients, setLoadingClients] = useState(true);
  const [loadingApprovals, setLoadingApprovals] = useState(false);
  const [actionLoading, setActionLoading] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Save viewMode to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('viewMode', viewMode);
  }, [viewMode]);

  const loadClients = async () => {
    setLoadingClients(true);
    setError(null);
    try {
      const controls = await fetchAirtableRecords<ControlFields>(
        CONTROL_BASE_ID,
        CONTROL_TABLE_NAME,
        undefined,
        ["Client", "airtableBase", "airtableSMPosts", "locationId"]
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
          locationId: rec.fields.locationId,
          count: 0,
        }));

      // For each client, fetch count of "Check" status
      const withCounts = await Promise.all(
        validClients.map(async (client) => {
          try {
            const posts = await fetchAirtableRecords<PostFields>(
              client.baseId,
              client.tableName,
              `Status="Check"`,
              ["Status"]
            );
            const approvedPosts = await fetchAirtableRecords<PostFields>(
              client.baseId,
              client.tableName,
              `Status="Approved"`,
              ["Status"]
            );
            return { ...client, count: posts.length, approvedCount: approvedPosts.length };
          } catch {
            return { ...client, count: 0, approvedCount: 0 };
          }
        })
      );
      setClients(withCounts as Client[]);
      // Auto-select first client with items to check
      const firstWithItems = withCounts.find((c) => c.count > 0);
      setSelectedClientId(firstWithItems?.id ?? null);
    } catch (e: any) {
      setError("Failed to load clients. " + e.message);
    } finally {
      setLoadingClients(false);
    }
  };

  // Initial load of clients
  useEffect(() => {
    loadClients();
  }, []);

  // Load approval items for selected client
  useEffect(() => {
    const loadApprovals = async () => {
      if (!selectedClientId) {
        setApprovalItems([]);
        return;
      }
      setLoadingApprovals(true);
      setError(null);
      const client = clients.find((c) => c.id === selectedClientId);
      if (!client) return;
      try {
        const posts = await fetchAirtableRecords<PostFields>(
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
    };
    loadApprovals();
  }, [selectedClientId, clients]);

  // Handle approval actions
  const handleAction = async (id: string, action: "Approved" | "Redo" | "Discard") => {
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
  };

  const renderToolSelector = () => (
    <div className="text-center">
      {/* Mobile Logo */}
      <div className="min-[930px]:hidden mb-6 flex justify-center">
        <img
          src="https://buylocal.org.nz/wp-content/uploads/2022/12/buy-local-nz-logo_final_circle_white.png"
          alt="Buy Local NZ Logo"
          className="w-[120px] h-[120px] rounded-full bg-white shadow-md object-contain cursor-pointer"
        />
      </div>

      {/* Desktop Logo */}
      <div className="hidden min-[930px]:block mb-6">
        <img
          src="https://buylocal.org.nz/wp-content/uploads/2022/12/buy-local-nz-logo_final_circle_white.png"
          alt="Buy Local NZ Logo"
          className="w-[100px] h-[100px] rounded-full bg-white shadow-md object-contain mx-auto"
        />
      </div>

      <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight mb-8">
        Buy Local Approvals Tool
      </h1>

      <div className="flex flex-col items-center gap-4 max-w-md mx-auto">
        <button
          onClick={() => setViewMode('social')}
          className="w-full py-4 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-all shadow-md"
        >
          Social Media Approvals
        </button>
        <button
          onClick={() => setViewMode('featured')}
          className="w-full py-4 px-6 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold transition-all shadow-md"
        >
          Featured Upgrade Approvals
        </button>
      </div>
    </div>
  );

  if (!isAuthenticated) {
    return <PasswordProtection onAuthenticated={() => {
      setIsAuthenticated(true);
      setViewMode('tool-select'); // Reset to home page on new authentication
    }} />;
  }

  return (
    <div className="min-h-screen w-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-10 overflow-hidden">
      {viewMode === 'tool-select' ? (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-160px)]">
          {renderToolSelector()}
        </div>
      ) : (
        <>
          {/* Header with Back Navigation */}
          <div className="w-full max-w-[1000px] mx-auto mb-8 px-4 sm:px-0">
            <div
              className="flex flex-col min-[930px]:flex-row items-center justify-center gap-4 cursor-pointer"
              onClick={() => setViewMode('tool-select')}
            >
              <img
                src="https://buylocal.org.nz/wp-content/uploads/2022/12/buy-local-nz-logo_final_circle_white.png"
                alt="Buy Local NZ Logo"
                className="w-[120px] h-[120px] min-[930px]:w-[100px] min-[930px]:h-[100px] rounded-full bg-white shadow-md object-contain"
              />
              <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight text-center">
                {viewMode === 'social'
                  ? 'Client Social Media Approval'
                  : 'Featured Upgrade Approvals'}
              </h1>
            </div>
          </div>
          <div className="flex flex-col items-center">
            {/* Error Message */}
            {error && (
              <div className="w-full max-w-[1000px] mx-auto mb-6 px-4 sm:px-0">
                <div className="bg-red-100 text-red-700 px-4 py-2 rounded">
                  {error}
                </div>
              </div>
            )}

            {/* Main Content */}
            {loadingClients ? (
              <div className="w-full mx-auto">
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="animate-spin w-8 h-8 text-blue-400" />
                  <span className="ml-3 text-blue-700 font-medium">
                    Loading clients...
                  </span>
                </div>
              </div>
            ) : (
              <div className="w-full mx-auto">
                {/* Client Selector - Only for Social Media view */}
                {viewMode === 'social' && (
                  <ClientSelector
                    clients={clients}
                    selectedClientId={selectedClientId}
                    onSelect={setSelectedClientId}
                    onRefresh={loadClients}
                  />
                )}
                {/* Approvals List */}
                {viewMode === 'featured' ? (
                  <FeaturedApprovals />
                ) : (
                  <>
                    {loadingApprovals ? (
                      <div className="bg-white rounded-xl shadow-md p-6">
                        <h2 className="text-xl font-bold mb-4 text-gray-700">
                          Items to Approve
                        </h2>
                        <div className="flex items-center justify-center py-12">
                          <Loader2 className="animate-spin w-6 h-6 text-blue-400" />
                          <span className="ml-3 text-blue-700 font-medium">
                            Loading items...
                          </span>
                        </div>
                      </div>
                    ) : (
                      <ApprovalList
                        items={approvalItems}
                        onAction={handleAction}
                        loadingIds={actionLoading}
                      />
                    )}
                  </>
                )}
              </div>
            )}

            {/* Footer */}
            {viewMode === 'social' && (
              <footer className="mt-16 text-center text-gray-400 text-sm w-full max-w-[1000px] px-4 sm:px-0 mx-auto">
                <span>
                  Built for{' '}
                  <a
                    href="https://buylocal.org.nz"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    Buy Local NZ
                  </a>{' '}
                  by{' '}
                  <a
                    href="https://marketingtech.pro"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    MarketingTech.Pro
                  </a>
                </span>
              </footer>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default App;
