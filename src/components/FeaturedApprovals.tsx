import { useState, useRef } from 'react';
import FeaturedClientSelector from './FeaturedClientSelector';
import FeaturedClientProfile from './FeaturedClientProfile';
import { RotateCw } from 'lucide-react';

export default function FeaturedApprovals() {
    const [selectedClientId, setSelectedClientId] = useState<string>('');
    const profileRef = useRef<{ fetchContactData?: () => Promise<void> }>({});

    // Handle client selection
    const handleClientSelect = (clientId: string) => {
        setSelectedClientId(clientId);
    };

    return (
        <div className="flex flex-col gap-6 max-[930px]:gap-6 min-[930px]:gap-4 mx-auto w-full px-4 min-[930px]:px-0 min-[930px]:w-[910px]">
            {/* Client Selector at the top */}
            <div className="bg-white rounded-xl shadow-md p-6 w-full">
                <div className="flex justify-between items-start">
                    <div className="flex-1">
                        <FeaturedClientSelector
                            selectedClientId={selectedClientId}
                            onSelect={handleClientSelect}
                        />
                    </div>
                    <button
                        onClick={() => location.reload()}
                        className="ml-4 p-2 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
                        title="Refresh Featured Clients List"
                    >
                        <RotateCw className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Client Profile Section */}
            {selectedClientId && (
                <div className="bg-white rounded-xl shadow-md p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-semibold text-gray-900">
                            Profile Details
                        </h2>
                        <button
                            onClick={() => profileRef.current.fetchContactData?.()}
                            className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
                            title="Refresh Profile Data"
                        >
                            <RotateCw className="w-5 h-5" />
                        </button>
                    </div>
                    <FeaturedClientProfile 
                        contactId={selectedClientId}
                        ref={profileRef}
                    />
                </div>
            )}

            {/* Show empty state when no client is selected */}
            {!selectedClientId && (
                <div className="bg-white rounded-xl shadow-md p-6">
                    <div className="text-center py-8">
                        <div className="text-gray-400 mb-4">
                            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            Select a Featured Client
                        </h3>
                        <p className="text-gray-600">
                            Choose a client from the list above to review their profile completion status and manage approvals.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
