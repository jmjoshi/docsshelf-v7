/**
 * PDF Viewer Component
 * Displays PDF documents with navigation and zoom controls using native PDF viewer
 */

import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import Pdf, { Source } from 'react-native-pdf';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface PdfViewerProps {
    source: Source;
    filename?: string;
    onError?: (error: object) => void;
}

export default function PdfViewer({ source, onError }: PdfViewerProps) {
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    const handleLoadComplete = (numberOfPages: number, filePath: string) => {
        setIsLoading(false);
        setTotalPages(numberOfPages);
        console.log(`PDF loaded successfully: ${numberOfPages} pages from ${filePath}`);
    };

    const handlePageChanged = (page: number, numberOfPages: number) => {
        setCurrentPage(page);
    };

    const handleError = (error: object) => {
        setIsLoading(false);
        console.error('PDF viewer error:', error);
        Alert.alert('Error', 'Failed to load PDF document');
        if (onError) {
            onError(error);
        }
    };

    return (
        <View style={styles.container}>
            {isLoading && (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#007AFF" />
                    <Text style={styles.loadingText}>Loading PDF...</Text>
                </View>
            )}
            <Pdf
                source={source}
                style={styles.pdf}
                onLoadComplete={handleLoadComplete}
                onPageChanged={handlePageChanged}
                onError={handleError}
                trustAllCerts={false}
                enablePaging={true}
                horizontal={false}
            />
            {!isLoading && totalPages > 0 && (
                <View style={styles.pageIndicator}>
                    <Text style={styles.pageText}>
                        Page {currentPage} of {totalPages}
                    </Text>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    loadingContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        zIndex: 10,
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: '#666',
    },
    pdf: {
        flex: 1,
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT,
    },
    pageIndicator: {
        position: 'absolute',
        bottom: 20,
        left: 0,
        right: 0,
        alignItems: 'center',
    },
    pageText: {
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        color: '#fff',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        fontSize: 14,
        fontWeight: '600',
    },
});
