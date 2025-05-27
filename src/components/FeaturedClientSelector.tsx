import { useState, useEffect, useCallback } from 'react';
import { Building2, AlertCircle } from 'lucide-react';

// Our normalized contact type after processing the API response
interface GHLContact {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    featuredUpgradeDate?: string;
    profileComplete?: string;
    companyName?: string;
    featuredUpgradeDelivered?: string;
}

type FeaturedClientSelectorProps = {
    selectedClientId?: string;
    onSelect: (clientId: string) => void;
    refreshTrigger?: number;
};

export default function FeaturedClientSelector({
    selectedClientId,
    onSelect,
    refreshTrigger = 0
}: FeaturedClientSelectorProps) {
    const [clients, setClients] = useState<GHLContact[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showDone, setShowDone] = useState(false);
    const [selectedDoneClient, setSelectedDoneClient] = useState<GHLContact | null>(null);

    const inProgressClients = clients.filter((client) => client.featuredUpgradeDelivered !== 'Yes');
    const doneClients = clients.filter((client) => client.featuredUpgradeDelivered === 'Yes');

    const handleSelectDoneClient = useCallback((client: GHLContact) => {
        onSelect(client.id);
        setShowDone(false);
        setSelectedDoneClient(client);
    }, [onSelect, setShowDone, setSelectedDoneClient]);

    console.log('Clients in FeaturedClientSelector:', clients);

    const searchFeaturedContacts = async (): Promise<GHLContact[]> => {
        console.log('Fetching featured contacts from Netlify function...');

        const response = await fetch('/.netlify/functions/fetch-featured-contacts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to fetch featured contacts: ${errorText}`);
        }

        const data = await response.json();
        return data.contacts;
    };

    const loadFeaturedClients = async () => {
        try {
            setLoading(true);
            setError(null);

            // Search for featured contacts
            console.log('Starting featured contacts fetch...');
            const contacts = await searchFeaturedContacts();
            console.log('GHL API Response received:', {
                contactsCount: contacts.length,
                sampleId: contacts[0]?.id
            });

            // Set the clients directly since they're already in the right format
            console.log('Setting clients:', {
                clientsCount: contacts.length,
                sample: contacts[0]
            });

            setClients(contacts);

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
            console.error('Failed to load featured clients:', {
                error,
                message: errorMessage,
                stack: error instanceof Error ? error.stack : undefined
            });
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    // Add useEffect with refreshTrigger dependency
    useEffect(() => {
        loadFeaturedClients();
    }, [refreshTrigger]);

    const renderContent = () => {
        if (loading) {
            return (
                <>
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-2">
                            <Building2 className="h-5 w-5 text-gray-600" />
                            <h2 className="text-lg font-semibold text-gray-900">Featured Clients</h2>
                        </div>
                    </div>
                    <div className="border rounded-lg p-4">
                        <div className="space-y-3">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="animate-pulse">
                                    <div className="flex items-center gap-2">
                                        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                                        <div className="h-4 bg-gray-200 rounded w-16"></div>
                                    </div>
                                    <div className="mt-2 flex gap-2">
                                        <div className="h-3 bg-gray-100 rounded w-1/3"></div>
                                        <div className="h-3 bg-gray-100 rounded w-1/4"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            );
        }

        if (error) {
            return (
                <>
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-2">
                            <Building2 className="h-5 w-5 text-gray-600" />
                            <h2 className="text-lg font-semibold text-gray-900">Featured Clients</h2>
                        </div>
                    </div>
                    <div className="border rounded-lg p-8 text-center">
                        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                        <p className="text-red-600 font-medium mb-2">Error Loading Featured Clients</p>
                        <p className="text-gray-500 text-sm">{error}</p>
                    </div>
                </>
            );
        }

        return (
            <>
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                        <Building2 className="h-5 w-5 text-gray-600" />
                        <h2 className="text-lg font-semibold text-gray-900">Featured Clients</h2>
                        <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-sm">
                            {clients.length}
                        </span>
                    </div>
                    <div className="text-sm text-gray-500">
                        Select a client to review their profile
                    </div>
                </div>

                <div className="max-h-72 overflow-y-auto border rounded-lg">
                    {inProgressClients.length === 0 ? (
                        <div className="p-8 text-center">
                            <Building2 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500">No featured clients found</p>
                            <p className="text-gray-400 text-sm mt-1">
                                All clients have completed their featured profiles
                            </p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {inProgressClients.map((client) => (
                                <button
                                    key={client.id}
                                    onClick={() => onSelect(client.id)}
                                    className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors duration-150 ${selectedClientId === client.id
                                        ? 'bg-blue-50'
                                        : ''
                                        }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <p className={`text-sm font-medium truncate ${selectedClientId === client.id
                                                    ? 'text-blue-900'
                                                    : 'text-gray-900'
                                                    }`}>
                                                    {client.companyName}
                                                </p>
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${client.featuredUpgradeDelivered === 'Yes' ? 'bg-green-100 text-green-600' : selectedClientId === client.id
                                                    ? 'bg-blue-100 text-blue-800'
                                                    : 'bg-orange-100 text-orange-800'
                                                    }`}>
                                                    {client.featuredUpgradeDelivered === 'Yes' ? <><span className="text-green-600">Done</span></> : <><span >Pending Review</span></>}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="mt-1 flex items-center gap-3 text-xs text-gray-500">
                                            {client.featuredUpgradeDate && (
                                                <span className="flex items-center">
                                                    <span className="w-1 h-1 rounded-full bg-gray-300 mr-2"></span>
                                                    Upgraded {new Date(client.featuredUpgradeDate).toLocaleDateString()}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div className="mt-4 border rounded-lg">
                    <button
                        onClick={() => setShowDone(!showDone)}
                        className="w-full text-left py-2 px-4 bg-gray-50 hover:bg-gray-100 rounded-md transition-colors duration-150"
                    >
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-medium text-gray-700">
                                Completed Upgrades ({doneClients.length})
                            </h3>
                            <svg
                                className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${showDone ? 'rotate-90' : ''}`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                            </svg>
                        </div>
                    </button>
                </div>

                <div className={`max-h-72 overflow-y-auto border rounded-lg mt-2 transition-all duration-300 ease-in-out ${showDone ? 'block' : 'hidden'}`}>
                    {doneClients.length === 0 ? (
                        <div className="p-8 text-center">
                            <Building2 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500">No completed featured clients found</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {doneClients.map((client) => (
                                <button
                                    key={client.id}
                                    onClick={() => handleSelectDoneClient(client)}
                                    className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors duration-150 ${selectedClientId === client.id
                                        ? 'bg-blue-50'
                                        : ''
                                        }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <p className={`text-sm font-medium truncate ${selectedClientId === client.id
                                                    ? 'text-blue-900'
                                                    : 'text-gray-900'
                                                    }`}>
                                                    {client.companyName}
                                                </p>
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${selectedClientId === client.id
                                                    ? 'bg-blue-100 text-blue-800'
                                                    : 'bg-green-100 text-green-600'
                                                    }`}>
                                                    <span className="text-green-600">Done</span>
                                                </span>
                                            </div>
                                        </div>
                                        <div className="mt-1 flex items-center gap-3 text-xs text-gray-500">
                                            {client.featuredUpgradeDate && (
                                                <span className="flex items-center">
                                                    <span className="w-1 h-1 rounded-full bg-gray-300 mr-2"></span>
                                                    Upgraded {new Date(client.featuredUpgradeDate).toLocaleDateString()}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </>
        );
    };

    const renderSelectedDoneClient = () => {
        if (!selectedDoneClient) {
            return null;
        }

        return (
            <div className="mt-4 border rounded-lg p-4">
                <p className="text-sm font-medium text-gray-900">
                    Selected: {selectedDoneClient.companyName}
                </p>
            </div>
        );
    };

    return (
        <div>
            {renderContent()}
            {renderSelectedDoneClient()}
        </div>
    );
}
