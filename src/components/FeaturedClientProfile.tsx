import { useState, useEffect } from 'react';
import { fieldDefinitions, getFieldValue, getFieldLabel } from '../utils/fieldDefinitions';
import { Loader2 } from 'lucide-react';

interface FeaturedClientProfileProps {
    contactId: string;
    onRefresh?: () => void;
}

const EditableContentSection = ({ content, approval, contactData }: any) => {
    const [isEditing, setIsEditing] = useState(false);
    const [value, setValue] = useState(getFieldValue(content, contactData));
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSave = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const payload = {
                contactId: contactData.contact.id,
                fieldKey: content.fieldKey,
                value,
                isCustomField: content.type === 'CUSTOM',
                custom_field_id: content.custom_field_id
            };

            const response = await fetch('/.netlify/functions/update-ghl-record', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to update field');
            }

            setIsEditing(false);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to save changes';
            setError(errorMessage);
            console.error('Error updating field:', err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <div>
                <div className="text-sm font-medium text-gray-700 mb-1">
                    {getFieldLabel(content)}
                </div>
                {isEditing ? (
                    <div className="space-y-2">
                        <textarea
                            value={value}
                            onChange={(e) => setValue(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md"
                            rows={Math.max(5, 
                                Math.floor(value.split(/\s+/).length / 16) + 
                                (value.match(/\n/g) || []).length + 
                                2
                            )}
                            style={{ minHeight: '100px' }}
                        />
                        {error && (
                            <div className="text-red-600 text-sm">{error}</div>
                        )}
                        <div className="flex gap-2">
                            <button
                                onClick={handleSave}
                                disabled={isLoading}
                                className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                            >
                                {isLoading ? 'Saving...' : 'Save'}
                            </button>
                            <button
                                onClick={() => {
                                    setIsEditing(false);
                                    setValue(getFieldValue(content, contactData));
                                    setError(null);
                                }}
                                disabled={isLoading}
                                className="px-3 py-1 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                ) : (
                    <DisplayField
                        label={getFieldLabel(content)}
                        value={value}
                        displayAs={content.displayAs}
                        field={content}
                        contactId={contactData.contact.id}
                    />
                )}
            </div>
            <div>
                <div className="text-sm font-medium text-gray-700 mb-1">
                    Approval Status
                </div>
                <div className="flex gap-2 flex-wrap">
                    <DisplayField
                        label="Approval Status"
                        value={getFieldValue(approval, contactData)}
                        displayAs={approval.displayAs}
                        possibleValues={approval.possibleValues}
                        field={approval}
                        contactId={contactData.contact.id}
                    />
                    {content.editable && !isEditing && (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="h-[38px] px-4 rounded-md text-sm font-medium bg-blue-50 text-blue-500 hover:bg-blue-100 inline-flex items-center"
                        >
                            <svg className="mr-1 -ml-0.5" xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
                            </svg>
                            Edit
                        </button>
                    )}
                </div>
            </div>
        </>
    );
};

const baseStyles = "px-4 py-2 rounded-md text-sm font-medium transition-colors";

const getStatusButtonStyle = (buttonValue: string, currentValue: string | undefined) => {
    const isSelected = buttonValue === (currentValue || 'No'); // Default to 'No' if null

    switch (buttonValue) {
        case 'In Progress':
            return `${baseStyles} ${isSelected 
                ? 'bg-gray-600 text-white' 
                : 'bg-gray-50 text-gray-500'}`;
        case 'Awaiting Approval':
            return `${baseStyles} ${isSelected 
                ? 'bg-orange-600 text-white' 
                : 'bg-orange-50 text-orange-500'}`;
        case 'Approved':
            return `${baseStyles} ${isSelected 
                ? 'bg-green-600 text-white' 
                : 'bg-green-50 text-green-500 hover:bg-green-100'}`;
        case 'Re-Do':
            return `${baseStyles} ${isSelected 
                ? 'bg-red-600 text-white' 
                : 'bg-red-50 text-red-500 hover:bg-red-100'}`;
        case 'Yes':
            return `${baseStyles} ${isSelected 
                ? 'bg-green-600 text-white' 
                : 'bg-green-50 text-green-500 hover:bg-green-100'}`;
        case 'No':
            return `${baseStyles} ${isSelected 
                ? 'bg-red-600 text-white' 
                : 'bg-red-50 text-red-500 hover:bg-red-100'}`;
        case 'EDIT':
            return `${baseStyles} bg-blue-50 text-blue-500 hover:bg-blue-100`;
        default:
            return baseStyles;
    }
};

const isValidUrl = (str: string) => {
    try {
        new URL(str);
        return true;
    } catch {
        return false;
    }
};

const DisplayField = ({ label, value: initialValue, displayAs, possibleValues, field, contactId }: any) => {
    const [isEditing, setIsEditing] = useState(false);
    const [value, setValue] = useState(initialValue);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSave = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const payload = {
                contactId,
                fieldKey: field.fieldKey,
                value,
                isCustomField: field.type === 'CUSTOM',
                custom_field_id: field.custom_field_id
            };
            
            console.log('Sending update payload:', payload);

            const response = await fetch('/.netlify/functions/update-ghl-record', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await response.json();
            console.log('Update response:', data);

            if (!response.ok) {
                throw new Error(data.error || 'Failed to update field');
            }

            setIsEditing(false);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to save changes';
            setError(errorMessage);
            console.error('Error updating field:', err);
        } finally {
            setIsLoading(false);
        }
    };

    if (!value && displayAs !== 'BUTTONS') {
        return (
            <div className="mb-4">
                <span className="text-gray-500 italic">Not provided</span>
            </div>
        );
    }

    // DEBUGGING EMBEDDED MEDIA
    if (value && (displayAs.includes('EMBEDDED'))) {
        console.log('🎯 EMBEDDED TYPE FOUND:', {
            displayAs,
            value,
            matches: {
                isImage: displayAs === 'EMBEDDED IMAGE',
                isVideo: displayAs === 'EMBEDDED VIDEO'
            }
        });
    }
    switch (displayAs) {
        case 'TEXT':
            // If the text looks like a URL, check if it's an image
            if (isValidUrl(value)) {
                const isImage = /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(value);
                if (isImage) {
                    return (
                        <div className="mb-4">
                            <img 
                                src={value} 
                                alt="Content"
                                className="max-w-full h-auto rounded-lg shadow-sm"
                            />
                        </div>
                    );
                }
                return (
                    <div className="mb-4">
                        <div className="whitespace-pre-wrap">
                            <a 
                                href={value} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 hover:underline"
                            >
                                {value}
                            </a>
                        </div>
                    </div>
                );
            }

            // Handle editable text fields
            if (field?.editable) {
                return (
                    <div className="mb-4">
                        {isEditing ? (
                            <div className="space-y-2">
                                <textarea
                                    value={value}
                                    onChange={(e) => setValue(e.target.value)}
                                    className="w-full p-2 border border-gray-300 rounded-md"
                                    rows={Math.max(5, 
                                        Math.floor(value.split(/\s+/).length / 16) + 
                                        (value.match(/\n/g) || []).length + 
                                        2
                                    )}
                                    style={{ minHeight: '100px' }}
                                />
                                {error && (
                                    <div className="text-red-600 text-sm">{error}</div>
                                )}
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleSave}
                                        disabled={isLoading}
                                        className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                                    >
                                        {isLoading ? 'Saving...' : 'Save'}
                                    </button>
                                    <button
                                        onClick={() => {
                                            setIsEditing(false);
                                            setValue(initialValue);
                                            setError(null);
                                        }}
                                        disabled={isLoading}
                                        className="px-3 py-1 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="whitespace-pre-wrap mb-4">{value}</div>

                        )}
                    </div>
                );
            }

            // Non-editable text
            return (
                <div className="mb-4">
                    <div className="whitespace-pre-wrap">{value}</div>
                </div>
            );

        case 'LINK':
            return (
                <div className="mb-4">
                    <a 
                        href={value} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 hover:underline"
                    >
                        {value}
                    </a>
                </div>
            );

        case 'EMBEDDED IMAGE':
            if (!isValidUrl(value)) return <div className="mb-4">Invalid image URL</div>;
            return (
                <div className="mb-4">
                    <img 
                        src={value} 
                        alt={label}
                        className="max-w-full h-auto rounded-lg shadow-sm"
                    />
                </div>
            );

        case 'EMBEDDED VIDEO':
            if (!isValidUrl(value)) return <div className="mb-4">Invalid video URL</div>;
            // Convert URL if it's a YouTube URL
            let embedUrl = value;
            if (value.includes('youtube.com') || value.includes('youtu.be')) {
                const videoId = value.includes('youtube.com') 
                    ? value.split('v=')[1]
                    : value.split('youtu.be/')[1];
                if (videoId) {
                    // Add parameters to prevent autoplay and showing related videos
                    embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=0&rel=0`;
                }
            }
            return (
                <div className="mb-4">
                    <div className="aspect-video w-full">
                        <iframe
                            src={embedUrl}
                            className="w-full h-full rounded-lg shadow-sm"
                            frameBorder="0"
                            allowFullScreen
                            allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            loading="lazy"
                        />
                    </div>
                </div>
            );

        case 'BUTTONS':
            return (
                <div className="mb-4">
                    <div className="flex gap-2 flex-wrap">
                        {possibleValues?.map((btnValue: string) => {
                            const isActionable = btnValue === 'Approved' || btnValue === 'Re-Do';
                            return (
                                <button
                                    key={btnValue}
                                    onClick={isActionable ? async () => {
                                        try {
                                            const response = await fetch('/.netlify/functions/update-ghl-record', {
                                                method: 'POST',
                                                headers: { 'Content-Type': 'application/json' },
                                                body: JSON.stringify({
                                                    contactId,
                                                    fieldKey: field.fieldKey,
                                                    value: btnValue,
                                                    isCustomField: field.type === 'CUSTOM',
                                                    custom_field_id: field.custom_field_id
                                                })
                                            });
                                            
                                            if (!response.ok) {
                                                throw new Error('Failed to update status');
                                            }
                                            
                                            // Update local state
                                            setValue(btnValue);
                                        } catch (err) {
                                            console.error('Error updating status:', err);
                                        }
                                    } : undefined}
                                    className={`${getStatusButtonStyle(btnValue, value)} ${!isActionable && 'cursor-default'}`}
                                >
                                    {btnValue}
                                </button>
                            );
                        })}
                    </div>
                </div>
            );

        default:
            return (
                <div className="mb-4">
                    <span className="block">{value}</span>
                </div>
            );
    }
};

export default function FeaturedClientProfile({ contactId, onRefresh }: FeaturedClientProfileProps) {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [contactData, setContactData] = useState<any>(null);

    const fetchContactData = async () => {
        setLoading(true);
        setError(null);
        
        try {
            const response = await fetch('/.netlify/functions/fetch-featured-client-profile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contactId })
            });

            if (!response.ok) {
                throw new Error('Failed to fetch contact data');
            }

            const data = await response.json();
            console.log('GHL Response:', data);
            setContactData(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
            console.error('Error fetching contact:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchContactData();
    }, [contactId]);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
                <span className="ml-3 text-gray-600">Loading profile data...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h3 className="text-red-800 font-medium">Error Loading Profile</h3>
                <p className="text-red-600 mt-1">{error}</p>
            </div>
        );
    }

    if (!contactData?.contact) {
        return (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="text-yellow-800 font-medium">No Data Available</h3>
                <p className="text-yellow-600 mt-1">Could not find contact information</p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Basic Information */}
            <section>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-100 p-6 rounded-lg">
                    {fieldDefinitions.basicInfo.map((field) => (
                        <div key={field.fieldKey}>
                            <div className="text-sm font-medium text-gray-700 mb-1">
                                {getFieldLabel(field)}
                            </div>
                            <DisplayField
                                label={getFieldLabel(field)}
                                value={getFieldValue(field, contactData)}
                                displayAs={field.displayAs}
                                possibleValues={field.possibleValues}
                                field={field}
                                contactId={contactData.contact.id}
                            />
                        </div>
                    ))}
                </div>
            </section>

            {/* Content Review Section */}
            <section>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Content Review</h3>
                <div className="space-y-6">
                    {fieldDefinitions.contentPairs.map(({ content, approval }, index) => (
                        <div key={index} className="bg-gray-100 p-6 rounded-lg space-y-4">
                            <EditableContentSection 
                                content={content}
                                approval={approval}
                                contactData={contactData}
                            />
                        </div>
                    ))}
                </div>
            </section>

            {/* Important Links */}
            <section>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Important Links</h3>
                <div className="bg-gray-100 p-6 rounded-lg space-y-4">
                    {fieldDefinitions.links.map((field) => (
                        <div key={field.fieldKey}>
                            <div className="text-sm font-medium text-gray-700 mb-1">
                                {getFieldLabel(field)}
                            </div>
                            <DisplayField
                                label={getFieldLabel(field)}
                                value={getFieldValue(field, contactData)}
                                displayAs={field.displayAs}
                                field={field}
                                contactId={contactData.contact.id}
                            />
                        </div>
                    ))}
                </div>
            </section>

            {/* Overall Status */}
            <section>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Status</h3>
                <div className="bg-gray-100 p-6 rounded-lg space-y-4">
                    {fieldDefinitions.status.map((field) => (
                        <div key={field.fieldKey}>
                            <div className="text-sm font-medium text-gray-700 mb-1">
                                {getFieldLabel(field)}
                            </div>
                            <DisplayField
                                value={getFieldValue(field, contactData)}
                                displayAs={field.displayAs}
                                possibleValues={field.possibleValues}
                            />
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}
