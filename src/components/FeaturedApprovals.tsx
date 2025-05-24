import { useState } from 'react';
import FeaturedClientSelector from './FeaturedClientSelector';

export default function FeaturedApprovals() {
    const [selectedClientId, setSelectedClientId] = useState<string>('');
    const [loading, setLoading] = useState(false);

    // Handle client selection
    const handleClientSelect = (clientId: string) => {
        setSelectedClientId(clientId);
        setLoading(true);
        // We'll implement the approval fetching logic later
        setTimeout(() => setLoading(false), 1000); // Temporary simulation
    };

    return (
        <div className="flex flex-col gap-6 max-[930px]:gap-6 min-[930px]:gap-4 mx-auto w-full px-4 min-[930px]:px-0 min-[930px]:w-[910px]">
            {/* Client Selector at the top */}
            <div className="bg-white rounded-xl shadow-md p-6 w-full">
                <FeaturedClientSelector
                    selectedClientId={selectedClientId}
                    onSelect={handleClientSelect}
                />
            </div>

            {/* Approval Content */}
            {selectedClientId ? (
                loading ? (
                    <div className="bg-white rounded-xl shadow-md p-6">
                        <div className="flex items-center justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            <span className="ml-2 text-gray-600">Loading approval details...</span>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white rounded-xl shadow-md p-6">
                        <div className="space-y-4">
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                <h3 className="font-medium text-yellow-800 mb-2">
                                    Profile Completion Required
                                </h3>
                                <p className="text-yellow-700 text-sm">
                                    This featured client needs to complete their profile information
                                    before it can be approved and published.
                                </p>
                            </div>

                            <div className="flex space-x-3">
                                <button className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700">
                                    Approve Profile
                                </button>
                                <button className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700">
                                    Request Changes
                                </button>
                                <button className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700">
                                    Send Reminder
                                </button>
                            </div>
                        </div>
                    </div>
                )
            ) : (
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
                            Choose a client from the list to review their profile completion status and manage approvals.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}

