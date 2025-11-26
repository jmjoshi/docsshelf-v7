/**
 * Document Filter Modal
 * Advanced filtering options for documents
 */

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
                <View style={styles.modalContent}>
                    {/* Header */}
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Filter Documents</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Text style={styles.closeButton}>✕</Text>
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.modalBody}>
                        {/* Categories */}
                        <View style={styles.filterSection}>
                            <Text style={styles.filterSectionTitle}>Categories</Text>
                            <View style={styles.filterOptions}>
                                {categories.map((category) => (
                                    <TouchableOpacity
                                        key={category.id}
                                        style={[
                                            styles.filterChip,
                                            localFilters.categoryIds.includes(category.id) &&
                                                styles.filterChipActive,
                                        ]}
                                        onPress={() => toggleCategory(category.id)}
                                    >
                                        <Text
                                            style={[
                                                styles.filterChipText,
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
                            <Text style={styles.filterSectionTitle}>File Types</Text>
                            <View style={styles.filterOptions}>
                                {FILE_TYPES.map((type) => (
                                    <TouchableOpacity
                                        key={type.value}
                                        style={[
                                            styles.filterChip,
                                            localFilters.fileTypes.includes(type.value) &&
                                                styles.filterChipActive,
                                        ]}
                                        onPress={() => toggleFileType(type.value)}
                                    >
                                        <Text style={styles.filterChipIcon}>{type.icon}</Text>
                                        <Text
                                            style={[
                                                styles.filterChipText,
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
                            <Text style={styles.filterSectionTitle}>Date Range</Text>
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
                                                isActive && styles.filterChipActive,
                                            ]}
                                            onPress={() => setDateRange(range.days)}
                                        >
                                            <Text
                                                style={[
                                                    styles.filterChipText,
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
                            <Text style={styles.filterSectionTitle}>File Size</Text>
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
                                                isActive && styles.filterChipActive,
                                            ]}
                                            onPress={() => setSizeRange(range.min, range.max)}
                                        >
                                            <Text
                                                style={[
                                                    styles.filterChipText,
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
                                <Text style={styles.favoriteToggleText}>Favorites Only</Text>
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
                    <View style={styles.modalFooter}>
                        <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
                            <Text style={styles.resetButtonText}>Reset</Text>
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
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: '80%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
    closeButton: {
        fontSize: 24,
        color: '#666',
    },
    modalBody: {
        flex: 1,
        padding: 20,
    },
    filterSection: {
        marginBottom: 24,
    },
    filterSectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 12,
    },
    filterOptions: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    filterChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#f0f0f0',
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    filterChipActive: {
        backgroundColor: '#2196F3',
        borderColor: '#2196F3',
    },
    filterChipIcon: {
        fontSize: 16,
        marginRight: 6,
    },
    filterChipText: {
        fontSize: 14,
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
        paddingVertical: 12,
        paddingHorizontal: 4,
    },
    favoriteToggleText: {
        fontSize: 16,
        color: '#333',
        fontWeight: '500',
    },
    toggle: {
        width: 50,
        height: 28,
        borderRadius: 14,
        backgroundColor: '#e0e0e0',
        padding: 2,
    },
    toggleActive: {
        backgroundColor: '#2196F3',
    },
    toggleThumb: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#fff',
    },
    toggleThumbActive: {
        transform: [{ translateX: 22 }],
    },
    modalFooter: {
        flexDirection: 'row',
        padding: 20,
        gap: 12,
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
    },
    resetButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 8,
        backgroundColor: '#f0f0f0',
        alignItems: 'center',
    },
    resetButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#666',
    },
    applyButton: {
        flex: 2,
        paddingVertical: 14,
        borderRadius: 8,
        backgroundColor: '#2196F3',
        alignItems: 'center',
    },
    applyButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
    },
});
