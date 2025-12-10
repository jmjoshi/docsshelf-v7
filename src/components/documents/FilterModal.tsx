/**
 * Document Filter Modal
 * Advanced filtering options for documents
 */

import { useColorScheme } from '@/hooks/use-color-scheme';
import React, { useState } from 'react';
import {
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import type { Category } from '../../types/category';

export interface DocumentFilters {
    categoryIds: number[];
    fileTypes: string[];
    dateRange: {
        start: Date | null;
        end: Date | null;
    };
    sizeRange: {
        min: number | null;
        max: number | null;
    };
    favoritesOnly: boolean;
}

interface FilterModalProps {
    visible: boolean;
    filters: DocumentFilters;
    categories: Category[];
    onApply: (filters: DocumentFilters) => void;
    onReset: () => void;
    onClose: () => void;
}

const FILE_TYPES = [
    { label: 'PDF', value: 'application/pdf', icon: '📄' },
    { label: 'Images', value: 'image/', icon: '🖼️' },
    { label: 'Text', value: 'text/', icon: '📝' },
];

const SIZE_RANGES = [
    { label: 'All Sizes', min: null, max: null },
    { label: '< 1 MB', min: null, max: 1024 * 1024 },
    { label: '1-5 MB', min: 1024 * 1024, max: 5 * 1024 * 1024 },
    { label: '5-10 MB', min: 5 * 1024 * 1024, max: 10 * 1024 * 1024 },
    { label: '> 10 MB', min: 10 * 1024 * 1024, max: null },
];

const DATE_RANGES = [
    { label: 'All Time', days: null },
    { label: 'Today', days: 0 },
    { label: 'Last 7 Days', days: 7 },
    { label: 'Last 30 Days', days: 30 },
    { label: 'Last 90 Days', days: 90 },
];

export default function FilterModal({
    visible,
    filters,
    categories,
    onApply,
    onReset,
    onClose,
}: FilterModalProps) {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const [localFilters, setLocalFilters] = useState<DocumentFilters>(filters);

    const toggleCategory = (categoryId: number) => {
        const newCategoryIds = localFilters.categoryIds.includes(categoryId)
            ? localFilters.categoryIds.filter((id) => id !== categoryId)
            : [...localFilters.categoryIds, categoryId];
        
        setLocalFilters({ ...localFilters, categoryIds: newCategoryIds });
    };

    const toggleFileType = (fileType: string) => {
        const newFileTypes = localFilters.fileTypes.includes(fileType)
            ? localFilters.fileTypes.filter((type) => type !== fileType)
            : [...localFilters.fileTypes, fileType];
        
        setLocalFilters({ ...localFilters, fileTypes: newFileTypes });
    };

    const setDateRange = (days: number | null) => {
        if (days === null) {
            setLocalFilters({
                ...localFilters,
                dateRange: { start: null, end: null },
            });
        } else {
            const end = new Date();
            const start = new Date();
            start.setDate(start.getDate() - days);
            setLocalFilters({
                ...localFilters,
                dateRange: { start, end },
            });
        }
    };

    const setSizeRange = (min: number | null, max: number | null) => {
        setLocalFilters({
            ...localFilters,
            sizeRange: { min, max },
        });
    };

    const handleApply = () => {
        onApply(localFilters);
        onClose();
    };

    const handleReset = () => {
        const resetFilters: DocumentFilters = {
            categoryIds: [],
            fileTypes: [],
            dateRange: { start: null, end: null },
            sizeRange: { min: null, max: null },
            favoritesOnly: false,
        };
        setLocalFilters(resetFilters);
        onReset();
        onClose();
    };

    const getActiveFilterCount = () => {
        let count = 0;
        if (localFilters.categoryIds.length > 0) count++;
        if (localFilters.fileTypes.length > 0) count++;
        if (localFilters.dateRange.start || localFilters.dateRange.end) count++;
        if (localFilters.sizeRange.min !== null || localFilters.sizeRange.max !== null) count++;
        if (localFilters.favoritesOnly) count++;
        return count;
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={[styles.modalContent, isDark && styles.modalContentDark]}>
                    {/* Header */}
                    <View style={[styles.modalHeader, isDark && styles.modalHeaderDark]}>
                        <Text style={[styles.modalTitle, isDark && styles.modalTitleDark]}>Filter Documents</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Text style={styles.closeButton}>✕</Text>
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.modalBody}>
                        {/* Categories */}
                        <View style={styles.filterSection}>
                            <Text style={[styles.filterSectionTitle, isDark && styles.filterSectionTitleDark]}>Categories</Text>
                            <View style={styles.filterOptions}>
                                {categories.map((category) => (
                                    <TouchableOpacity
                                        key={category.id}
                                        style={[
                                            styles.filterChip,
                                            isDark && styles.filterChipDark,
                                            localFilters.categoryIds.includes(category.id) &&
                                                styles.filterChipActive,
                                        ]}
                                        onPress={() => toggleCategory(category.id)}
                                    >
                                        <Text
                                            style={[
                                                styles.filterChipText,
                                                isDark && styles.filterChipTextDark,
                                                localFilters.categoryIds.includes(category.id) &&
                                                    styles.filterChipTextActive,
                                            ]}
                                        >
                                            {category.name}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        {/* File Types */}
                        <View style={styles.filterSection}>
                            <Text style={[styles.filterSectionTitle, isDark && styles.filterSectionTitleDark]}>File Types</Text>
                            <View style={styles.filterOptions}>
                                {FILE_TYPES.map((type) => (
                                    <TouchableOpacity
                                        key={type.value}
                                        style={[
                                            styles.filterChip,
                                            isDark && styles.filterChipDark,
                                            localFilters.fileTypes.includes(type.value) &&
                                                styles.filterChipActive,
                                        ]}
                                        onPress={() => toggleFileType(type.value)}
                                    >
                                        <Text style={styles.filterChipIcon}>{type.icon}</Text>
                                        <Text
                                            style={[
                                                styles.filterChipText,
                                                isDark && styles.filterChipTextDark,
                                                localFilters.fileTypes.includes(type.value) &&
                                                    styles.filterChipTextActive,
                                            ]}
                                        >
                                            {type.label}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        {/* Date Range */}
                        <View style={styles.filterSection}>
                            <Text style={[styles.filterSectionTitle, isDark && styles.filterSectionTitleDark]}>Date Range</Text>
                            <View style={styles.filterOptions}>
                                {DATE_RANGES.map((range) => {
                                    const isActive =
                                        range.days === null
                                            ? !localFilters.dateRange.start && !localFilters.dateRange.end
                                            : localFilters.dateRange.start !== null;
                                    
                                    return (
                                        <TouchableOpacity
                                            key={range.label}
                                            style={[
                                                styles.filterChip,
                                                isDark && styles.filterChipDark,
                                                isActive && styles.filterChipActive,
                                            ]}
                                            onPress={() => setDateRange(range.days)}
                                        >
                                            <Text
                                                style={[
                                                    styles.filterChipText,
                                                    isDark && styles.filterChipTextDark,
                                                    isActive && styles.filterChipTextActive,
                                                ]}
                                            >
                                                {range.label}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        </View>

                        {/* File Size */}
                        <View style={styles.filterSection}>
                            <Text style={[styles.filterSectionTitle, isDark && styles.filterSectionTitleDark]}>File Size</Text>
                            <View style={styles.filterOptions}>
                                {SIZE_RANGES.map((range) => {
                                    const isActive =
                                        localFilters.sizeRange.min === range.min &&
                                        localFilters.sizeRange.max === range.max;
                                    
                                    return (
                                        <TouchableOpacity
                                            key={range.label}
                                            style={[
                                                styles.filterChip,
                                                isDark && styles.filterChipDark,
                                                isActive && styles.filterChipActive,
                                            ]}
                                            onPress={() => setSizeRange(range.min, range.max)}
                                        >
                                            <Text
                                                style={[
                                                    styles.filterChipText,
                                                    isDark && styles.filterChipTextDark,
                                                    isActive && styles.filterChipTextActive,
                                                ]}
                                            >
                                                {range.label}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        </View>

                        {/* Favorites Only */}
                        <View style={styles.filterSection}>
                            <TouchableOpacity
                                style={styles.favoriteToggle}
                                onPress={() =>
                                    setLocalFilters({
                                        ...localFilters,
                                        favoritesOnly: !localFilters.favoritesOnly,
                                    })
                                }
                            >
                                <Text style={[styles.favoriteToggleText, isDark && styles.favoriteToggleTextDark]}>Favorites Only</Text>
                                <View
                                    style={[
                                        styles.toggle,
                                        localFilters.favoritesOnly && styles.toggleActive,
                                    ]}
                                >
                                    <View
                                        style={[
                                            styles.toggleThumb,
                                            localFilters.favoritesOnly && styles.toggleThumbActive,
                                        ]}
                                    />
                                </View>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>

                    {/* Footer */}
                    <View style={[styles.modalFooter, isDark && styles.modalFooterDark]}>
                        <TouchableOpacity style={[styles.resetButton, isDark && styles.resetButtonDark]} onPress={handleReset}>
                            <Text style={[styles.resetButtonText, isDark && styles.resetButtonTextDark]}>Reset</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
                            <Text style={styles.applyButtonText}>
                                Apply {getActiveFilterCount() > 0 && `(${getActiveFilterCount()})`}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        height: '75%', // Changed from maxHeight to height for consistent size
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8, // Reduced for compactness
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    modalTitle: {
        fontSize: 16, // Smaller for compactness
        fontWeight: 'bold',
        color: '#333',
    },
    closeButton: {
        fontSize: 24,
        color: '#666',
        padding: 4,
    },
    modalBody: {
        flexGrow: 1, // Changed from flex: 1 to allow ScrollView to expand
        paddingHorizontal: 14, // Reduced padding
        paddingTop: 8, // Minimal top padding
        paddingBottom: 4, // Minimal bottom padding
    },
    filterSection: {
        marginBottom: 10, // More compact
    },
    filterSectionTitle: {
        fontSize: 13, // Smaller
        fontWeight: '600',
        color: '#333',
        marginBottom: 5, // Tighter
        letterSpacing: 0.2,
    },
    filterOptions: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 5, // Tighter spacing
    },
    filterChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 9, // More compact
        paddingVertical: 4, // More compact
        borderRadius: 12, // Smaller
        backgroundColor: '#f5f5f5',
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    filterChipActive: {
        backgroundColor: '#2196F3',
        borderColor: '#2196F3',
    },
    filterChipIcon: {
        fontSize: 13, // Smaller
        marginRight: 3, // Tighter
    },
    filterChipText: {
        fontSize: 12, // Smaller
        color: '#666',
    },
    filterChipTextActive: {
        color: '#fff',
        fontWeight: '600',
    },
    favoriteToggle: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 4, // More compact
        paddingHorizontal: 0,
    },
    favoriteToggleText: {
        fontSize: 13, // Smaller
        color: '#333',
        fontWeight: '500',
    },
    toggle: {
        width: 42, // Slightly smaller
        height: 22, // Slightly smaller
        borderRadius: 11,
        backgroundColor: '#e0e0e0',
        padding: 2,
    },
    toggleActive: {
        backgroundColor: '#2196F3',
    },
    toggleThumb: {
        width: 18, // Proportional
        height: 18,
        borderRadius: 9,
        backgroundColor: '#fff',
    },
    toggleThumbActive: {
        transform: [{ translateX: 20 }],
    },
    modalFooter: {
        flexDirection: 'row',
        paddingHorizontal: 14,
        paddingVertical: 8, // More compact
        gap: 8,
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
        backgroundColor: '#fafafa',
    },
    resetButton: {
        flex: 1,
        paddingVertical: 9, // More compact
        borderRadius: 8,
        backgroundColor: '#f0f0f0',
        alignItems: 'center',
    },
    resetButtonText: {
        fontSize: 13, // Smaller
        fontWeight: '600',
        color: '#666',
    },
    applyButton: {
        flex: 2,
        paddingVertical: 9, // More compact
        borderRadius: 8,
        backgroundColor: '#2196F3',
        alignItems: 'center',
    },
    applyButtonText: {
        fontSize: 13, // Smaller
        fontWeight: '600',
        color: '#fff',
    },
    // Dark mode styles
    modalContentDark: {
        backgroundColor: '#1c1c1e',
    },
    modalHeaderDark: {
        borderBottomColor: '#38383a',
    },
    modalTitleDark: {
        color: '#fff',
    },
    filterSectionTitleDark: {
        color: '#e5e5e7',
    },
    filterChipDark: {
        backgroundColor: '#2c2c2e',
        borderColor: '#38383a',
    },
    filterChipTextDark: {
        color: '#e5e5e7',
    },
    favoriteToggleTextDark: {
        color: '#e5e5e7',
    },
    modalFooterDark: {
        borderTopColor: '#38383a',
        backgroundColor: '#2c2c2e',
    },
    resetButtonDark: {
        backgroundColor: '#38383a',
    },
    resetButtonTextDark: {
        color: '#e5e5e7',
    },
});
