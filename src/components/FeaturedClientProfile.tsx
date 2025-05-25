import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { fieldDefinitions, getFieldValue, getFieldLabel, FieldDefinition } from '../utils/fieldDefinitions';
import { Loader2 } from 'lucide-react';

interface FeaturedClientProfileProps {
    contactId: string;
    onRefresh?: () => void;
}

// Simplified version of EditableContentSection that doesn't use details/summary
const EditableContentSection = ({ content, approval, contactData, onRefresh }: any) => {
    const [isEditing, setIsEditing] = useState(false);
    const [isExpanded, setIsExpanded] = useState(true); // Start expanded
    const [value, setValue] = useState(getFieldValue(content, contactData));
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const approvalStatus = getFieldValue(approval, contactData);

    useEffect(() => {
        if (approvalStatus === 'Approved') {
            setIsExpanded(false);
        }
    }, [approvalStatus]);

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
        <div className="border border-gray-200 rounded-lg mb-4 overflow-hidden bg-white">
            <div
                className="p-3 bg-gray-50 flex items-center justify-between cursor-pointer"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center">
                    <span className="font-semibold">{getFieldLabel(content)}</span>
                    <svg
                        className={`ml-2 w-4 h-4 transform transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </div>
                <span className={`text-sm ${approvalStatus === 'Approved' ? 'text-green-600' : approvalStatus === 'Awaiting Approval' ? 'text-orange-600' : 'text-gray-600'}`}>
                    {approvalStatus}
                </span>
            </div>

            {isExpanded && (
                <>
                    <div className="p-4">
                        {isEditing ? (
                            <div className="space-y-2">
                                <textarea
                                    value={value}
                                    onChange={(e) => setValue(e.target.value)}
                                    className="w-full p-2 border border-gray-300 rounded-md"
                                    rows={Math.max(5,
                                        value ? (Math.floor(value.split(/\s+/).length / 16) +
                                            (value.match(/\n/g) || []).length +
                                            2) : 5
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
                                        {isLoading ? 'Saving...' : 'Save'}</button>
                                    <button
                                        onClick={() => {
                                            setIsEditing(false);
                                            setValue(getFieldValue(content, contactData));
                                            setError(null);
                                        }}
                                        disabled={isLoading}
                                        className="px-3 py-1 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                                    >
                                        Cancel</button>
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

                    <div className="px-4 pb-4 pt-2 border-t border-gray-100">
                        <div className="flex gap-2 flex-wrap">
                            <button
                                onClick={onRefresh}
                                className="h-[38px] px-4 rounded-md text-sm font-medium bg-blue-50 text-blue-500 hover:bg-blue-100 inline-flex items-center"
                            >
                                <svg className="mr-1 -ml-0.5" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.3" />
                                </svg>
                                Refresh
                            </button>

                            <DisplayField
                                label="Approval Status"
                                value={getFieldValue(approval, contactData)}
                                displayAs="BUTTONS"
                                possibleValues={approval.possibleValues || ['In Progress', 'Awaiting Approval', 'Approved', 'Re-Do']}
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
            )}
        </div>
    );
};

const baseStyles = "px-4 py-2 rounded-md text-sm font-medium transition-colors";

const getStatusButtonStyle = (buttonValue: string, currentValue: string | undefined, isActionable: boolean) => {
    const isSelected = buttonValue === (currentValue || 'No'); // Default to 'No' if null

    let style = baseStyles;

    switch (buttonValue) {
        case 'In Progress':
            style += ` ${isSelected ? 'bg-gray-600 text-white' : 'bg-gray-50 text-gray-500'}`;
            if (isActionable) style += ' hover:bg-gray-200'; // Slightly more noticeable hover
            break;
        case 'Awaiting Approval':
            style += ` ${isSelected ? 'bg-orange-600 text-white' : 'bg-orange-50 text-orange-500'}`;
            if (isActionable) style += ' hover:bg-orange-200'; // Slightly more noticeable hover
            break;
        case 'Approved':
            style += ` ${isSelected ? 'bg-green-600 text-white' : 'bg-green-50 text-green-500'}`;
            if (isActionable) style += ' hover:bg-green-200'; // Slightly more noticeable hover
            break;
        case 'Re-Do':
            style += ` ${isSelected ? 'bg-red-600 text-white' : 'bg-red-50 text-red-500'}`;
            if (isActionable) style += ' hover:bg-red-200'; // Slightly more noticeable hover
            break;
        case 'Yes':
            style += `${baseStyles} ${isSelected
                ? 'bg-green-600 text-white'
                : 'bg-green-50 text-green-500'}`;
            if (isActionable) style += ' hover:bg-green-200'; // Slightly more noticeable hover
            break;
        case 'No':
            style += `${baseStyles} ${isSelected
                ? 'bg-red-600 text-white'
                : 'bg-red-50 text-red-500'}`;
            if (isActionable) style += ' hover:bg-red-200'; // Slightly more noticeable hover
            break;
        case 'EDIT':
            style += `${baseStyles} bg-blue-50 text-blue-500`;
            if (isActionable) style += ' hover:bg-blue-200'; // Slightly more noticeable hover
            break;
        default:
            style += baseStyles;
            break;
    }

    return style;
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
    // Add a check for undefined field
    if (!field) {
        console.error("DisplayField received undefined field prop");
        return null; // Or render a placeholder/error message
    }

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
            // Check for markdown-style links [text](url)
            const markdownLinkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
            if (markdownLinkRegex.test(value)) {
                return (
                    <div className="mb-4">
                        <div className="whitespace-pre-wrap">
                            {value.split(markdownLinkRegex).map((part: string, i: number) => {
                                if (i % 3 === 1) {  // Link text
                                    const url = value.split(markdownLinkRegex)[i + 1];
                                    return (
                                        <a
                                            key={i}
                                            href={url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-600 hover:text-blue-800 hover:underline"
                                        >
                                            {part}
                                        </a>
                                    );
                                } else if (i % 3 === 2) {  // URL
                                    return null;  // Skip the URL as it's used in the link above
                                }
                                return part;  // Regular text
                            })}
                        </div>
                    </div>
                );
            }
            // If it's a plain URL, check if it's an image
            else if (isValidUrl(value)) {
                const isImage = /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(value);
                if (isImage) {
                    return (
                        <div className="mb-4">
                            <img
                                src={value}
                                alt={label}
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
                                        {isLoading ? 'Saving...' : 'Save'}</button>
                                    <button
                                        onClick={() => {
                                            setIsEditing(false);
                                            setValue(initialValue);
                                            setError(null);
                                        }}
                                        disabled={isLoading}
                                        className="px-3 py-1 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                                    >
                                        Cancel</button>
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
                        {possibleValues.map((btnValue: string) => {
                            const isActionable = field.clickableValues?.includes(btnValue);

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

                                            setValue(btnValue);
                                        } catch (err) {
                                            console.error('Error updating status:', err);
                                        }
                                    } : undefined}
                                    className={`${getStatusButtonStyle(btnValue, value, isActionable)} ${!isActionable && 'cursor-default'}`}
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

export default forwardRef(function FeaturedClientProfile(
    { contactId }: FeaturedClientProfileProps,
    ref: any
) {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [contactData, setContactData] = useState<any>(null);

    const fetchContactData = async () => {
        const scrollPosition = window.scrollY;
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
            setContactData(data);

            requestAnimationFrame(() => {
                window.scrollTo({
                    top: scrollPosition,
                    behavior: 'instant'
                });
            });
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

    useImperativeHandle(ref, () => ({
        fetchContactData
    }));

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
            {Object.entries(fieldDefinitions).map(([sectionName, fields]) => (
                <section key={sectionName}>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">{sectionName}</h3>
                    <div className={`bg-gray-100 p-6 rounded-lg ${sectionName === 'Basic Information' && !fields.some(item => 'content' in item && 'approval' in item) ? 'grid grid-cols-1 md:grid-cols-2 gap-4' : 'space-y-4'}`}>
                        {fields.map((item, index) => {
                            if ('content' in item && 'approval' in item) {
                                return (
                                    <EditableContentSection
                                        key={index}
                                        content={item.content}
                                        approval={item.approval}
                                        contactData={contactData}
                                        onRefresh={fetchContactData}
                                    />
                                );
                            } else {
                                const field = item as FieldDefinition;
                                return (
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
                                );
                            }
                        })}
                    </div>
                </section>
            ))}
        </div>
    );
});
