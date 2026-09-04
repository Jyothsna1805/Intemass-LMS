import React, { useState, useRef, useEffect } from 'react';
import { Folder, FolderOpen, ChevronRight, ChevronDown, Search, Plus, Check } from 'lucide-react';
import { PRESET_TAXONOMY, SubjectNode } from '../utils/subjectTaxonomy';

interface SubjectFolderPickerProps {
    selectedSubject: string;
    selectedSubCategory: string;
    onSelect: (subject: string, subCategory: string) => void;
    placeholder?: string;
    label?: string;
    required?: boolean;
}

export default function SubjectFolderPicker({
    selectedSubject,
    selectedSubCategory,
    onSelect,
    placeholder = "Click or focus to choose Subject & Subfolder...",
    label = "Destination Folder / Subject Directory",
    required = false
}: SubjectFolderPickerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({
        'economics': true,
        'ai_cs': true,
        'science': true
    });
    const [isCustomMode, setIsCustomMode] = useState(false);
    const [customSubject, setCustomSubject] = useState('');
    const [customSubCategory, setCustomSubCategory] = useState('');

    const containerRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);

    // Close on click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleFolder = (folderId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setExpandedFolders(prev => ({ ...prev, [folderId]: !prev[folderId] }));
    };

    const handleSelectSubfolder = (subj: string, sub: string) => {
        onSelect(subj, sub);
        setIsOpen(false);
        setIsCustomMode(false);
    };

    const handleCustomSave = (e: React.FormEvent) => {
        e.preventDefault();
        if (customSubject.trim()) {
            onSelect(customSubject.trim(), customSubCategory.trim() || 'General');
            setIsOpen(false);
            setIsCustomMode(false);
        }
    };

    // Filter taxonomy by search query
    const filteredTaxonomy: SubjectNode[] = PRESET_TAXONOMY.map(node => {
        const matchesSubject = node.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchingSubs = node.subCategories.filter(sub =>
            sub.toLowerCase().includes(searchQuery.toLowerCase())
        );

        if (matchesSubject) {
            return node;
        } else if (matchingSubs.length > 0) {
            return {
                ...node,
                subCategories: matchingSubs
            };
        }
        return null;
    }).filter(Boolean) as SubjectNode[];

    const displayValue = selectedSubject
        ? `${selectedSubject}${selectedSubCategory && selectedSubCategory !== 'General' ? ` / ${selectedSubCategory}` : ''}`
        : '';

    return (
        <div className="relative w-full" ref={containerRef}>
            {label && (
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                        <Folder className="w-3.5 h-3.5 text-primary-600" />
                        {label} {required && <span className="text-red-500">*</span>}
                    </span>
                    {displayValue && (
                        <span className="text-[10px] text-primary-700 font-semibold lowercase">
                            selected
                        </span>
                    )}
                </label>
            )}

            {/* Main Interactive Slot */}
            <div
                className={`w-full border rounded-md p-2.5 text-sm bg-white cursor-pointer transition-all flex items-center justify-between ${
                    isOpen ? 'border-primary-600 ring-2 ring-primary-100 shadow-sm' : 'border-gray-300 hover:border-gray-400'
                }`}
                onClick={() => {
                    setIsOpen(true);
                    setTimeout(() => searchInputRef.current?.focus(), 50);
                }}
            >
                <div className="flex items-center gap-2 overflow-hidden">
                    {displayValue ? (
                        <>
                            <span className="inline-flex items-center gap-1 bg-primary-50 text-primary-900 border border-primary-200 px-2 py-0.5 rounded text-xs font-bold whitespace-nowrap">
                                <FolderOpen className="w-3 h-3 text-primary-600" />
                                {selectedSubject}
                            </span>
                            {selectedSubCategory && selectedSubCategory !== 'General' && (
                                <>
                                    <ChevronRight className="w-3 h-3 text-gray-400 flex-shrink-0" />
                                    <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-800 border border-slate-200 px-2 py-0.5 rounded text-xs font-semibold whitespace-nowrap">
                                        {selectedSubCategory}
                                    </span>
                                </>
                            )}
                        </>
                    ) : (
                        <span className="text-gray-400 text-xs flex items-center gap-1.5">
                            <Folder className="w-3.5 h-3.5 text-gray-400" />
                            {placeholder}
                        </span>
                    )}
                </div>

                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180 text-primary-600' : ''}`} />
            </div>

            {/* Scrollable Folder Directory Popover */}
            {isOpen && (
                <div className="absolute z-50 mt-1.5 w-full bg-white border border-gray-200 rounded-lg shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                    
                    {/* Header with Search & Custom Toggle */}
                    <div className="p-2.5 bg-slate-50 border-b border-gray-200 space-y-2">
                        <div className="relative">
                            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                ref={searchInputRef}
                                type="text"
                                className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-gray-300 rounded focus:border-primary-500 focus:outline-none placeholder:text-gray-400"
                                placeholder="Search folders or sub-topics (e.g. Microeconomics, Vision, Calculus)..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        <div className="flex justify-between items-center text-[11px]">
                            <span className="text-gray-500 font-medium">Available Course Folders</span>
                            <button
                                type="button"
                                onClick={() => setIsCustomMode(!isCustomMode)}
                                className="text-primary-700 hover:text-primary-900 font-bold flex items-center gap-1 hover:underline"
                            >
                                <Plus className="w-3 h-3" />
                                {isCustomMode ? 'Browse standard folders' : 'Create new custom folder'}
                            </button>
                        </div>
                    </div>

                    {/* Custom Folder Creator Mode */}
                    {isCustomMode ? (
                        <div className="p-3 bg-amber-50/50 border-b border-amber-200">
                            <p className="text-xs font-bold text-amber-900 mb-2">Create Custom Subject Folder / Subfolder</p>
                            <div className="space-y-2">
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-600 uppercase mb-0.5">Parent Subject / Folder</label>
                                    <input
                                        type="text"
                                        className="w-full border border-gray-300 rounded p-1.5 text-xs focus:border-primary-500 outline-none"
                                        placeholder="e.g. Cambridge IGCSE Business"
                                        value={customSubject}
                                        onChange={(e) => setCustomSubject(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-600 uppercase mb-0.5">Subfolder / Topic Name</label>
                                    <input
                                        type="text"
                                        className="w-full border border-gray-300 rounded p-1.5 text-xs focus:border-primary-500 outline-none"
                                        placeholder="e.g. Marketing Mix & 4Ps"
                                        value={customSubCategory}
                                        onChange={(e) => setCustomSubCategory(e.target.value)}
                                    />
                                </div>
                                <div className="flex gap-2 pt-1">
                                    <button
                                        type="button"
                                        onClick={handleCustomSave}
                                        className="flex-1 bg-primary-700 text-white py-1.5 rounded text-xs font-bold hover:bg-primary-800 transition"
                                    >
                                        Apply Folder Path
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setIsCustomMode(false)}
                                        className="px-3 border border-gray-300 rounded text-xs font-medium hover:bg-gray-100"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : null}

                    {/* Scrollable Folder Hierarchy Tree */}
                    <div className="max-h-64 overflow-y-auto divide-y divide-gray-100 p-1">
                        {filteredTaxonomy.length > 0 ? (
                            filteredTaxonomy.map(subject => {
                                const isExpanded = expandedFolders[subject.id] || searchQuery.length > 0;
                                const isSubjectActive = selectedSubject.toLowerCase() === subject.name.toLowerCase();

                                return (
                                    <div key={subject.id} className="py-1">
                                        {/* Subject Folder Header */}
                                        <div
                                            className={`flex items-center justify-between px-2.5 py-1.5 rounded text-xs font-bold cursor-pointer transition ${
                                                isSubjectActive ? 'bg-primary-50 text-primary-900' : 'hover:bg-gray-100 text-gray-800'
                                            }`}
                                            onClick={(e) => toggleFolder(subject.id, e)}
                                        >
                                            <div className="flex items-center gap-2">
                                                {isExpanded ? (
                                                    <FolderOpen className="w-4 h-4 text-primary-600" />
                                                ) : (
                                                    <Folder className="w-4 h-4 text-amber-500" />
                                                )}
                                                <span>{subject.name}</span>
                                                <span className="text-[10px] text-gray-400 font-normal">
                                                    ({subject.subCategories.length})
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-1.5">
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleSelectSubfolder(subject.name, 'General');
                                                    }}
                                                    className="text-[10px] text-primary-700 hover:text-white hover:bg-primary-700 border border-primary-300 px-1.5 py-0.5 rounded font-medium transition"
                                                    title="Select entire subject folder"
                                                >
                                                    Select All
                                                </button>
                                                <ChevronRight className={`w-3.5 h-3.5 text-gray-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                                            </div>
                                        </div>

                                        {/* Subfolders list */}
                                        {isExpanded && (
                                            <div className="ml-5 pl-2 border-l border-gray-200 mt-1 space-y-0.5">
                                                {subject.subCategories.map(sub => {
                                                    const isSubActive =
                                                        isSubjectActive &&
                                                        selectedSubCategory.toLowerCase() === sub.toLowerCase();

                                                    return (
                                                        <div
                                                            key={sub}
                                                            onClick={() => handleSelectSubfolder(subject.name, sub)}
                                                            className={`flex items-center justify-between px-2.5 py-1.5 rounded text-xs cursor-pointer transition ${
                                                                isSubActive
                                                                    ? 'bg-primary-700 text-white font-bold'
                                                                    : 'hover:bg-primary-50 text-gray-700 hover:text-primary-900 font-medium'
                                                            }`}
                                                        >
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-gray-400 text-[10px]">└</span>
                                                                <span>{sub}</span>
                                                            </div>
                                                            {isSubActive && <Check className="w-3.5 h-3.5 text-white" />}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        ) : (
                            <div className="p-4 text-center text-xs text-gray-400">
                                No matching folders found for "{searchQuery}".
                                <div className="mt-2">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setCustomSubject(searchQuery);
                                            setIsCustomMode(true);
                                        }}
                                        className="text-primary-700 font-bold underline"
                                    >
                                        Create "{searchQuery}" as new folder
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-2 bg-gray-50 border-t border-gray-200 flex justify-between items-center text-[10px] text-gray-500">
                        <span>Click any subfolder to assign instantly</span>
                        <button
                            type="button"
                            onClick={() => setIsOpen(false)}
                            className="text-gray-600 hover:text-gray-900 font-semibold"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
