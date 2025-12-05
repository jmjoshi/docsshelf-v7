/**
 * PDF Viewer Component
 * Displays PDF documents with navigation and zoom controls
 */

import React, { useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    StyleSheet,
    Text,
    TouchableOpacity,
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
    const [scale, setScale] = useState(1.0);

    const handleLoadComplete = (numberOfPages: number) => {
        setTotalPages(numberOfPages);
        setIsLoading(false);
        console.log(`PDF loaded: ${numberOfPages} pages`);
    };

    const handlePageChanged = (page: number) => {
        setCurrentPage(page);
    };

    const handleError = (error: object) => {
        console.error('PDF Error:', error);
        setIsLoading(false);
        if (onError) {
            onError(error);
        }
    };

    const zoomIn = () => {
        setScale((prevScale) => Math.min(prevScale + 0.25, 3.0));
    };

    const zoomOut = () => {
        setScale((prevScale) => Math.max(prevScale - 0.25, 0.5));
    };

    const resetZoom = () => {
        setScale(1.0);
    };

    return (
        <View style={styles.container}>
            {isLoading && (
                <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="large" color="#2196F3" />
                    <Text style={styles.loadingText}>Loading PDF...</Text>
                </View>
            )}

            <Pdf
                trustAllCerts={false}
                source={source}
                onLoadComplete={handleLoadComplete}
                onPageChanged={handlePageChanged}
                onError={handleError}
                style={styles.pdf}
                scale={scale}
                minScale={0.5}
                maxScale={3.0}
                enablePaging={true}
                horizontal={false}
                spacing={10}
                page={currentPage}
            />

            {/* Page Navigation */}
            {!isLoading && totalPages > 0 && (
                <View style={styles.navigationBar}>
                    <View style={styles.pageInfo}>
                        <Text style={styles.pageText}>
                            Page {currentPage} of {totalPages}
                        </Text>
                    </View>

                    <View style={styles.zoomControls}>
                        <TouchableOpacity
                            style={[styles.zoomButton, scale <= 0.5 && styles.zoomButtonDisabled]}
                            onPress={zoomOut}
                            disabled={scale <= 0.5}
                        >
                            <Text style={styles.zoomButtonText}>−</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.resetZoomButton} onPress={resetZoom}>
                            <Text style={styles.resetZoomText}>
                                {Math.round(scale * 100)}%
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.zoomButton, scale >= 3.0 && styles.zoomButtonDisabled]}
                            onPress={zoomIn}
                            disabled={scale >= 3.0}
                        >
                            <Text style={styles.zoomButtonText}>+</Text>
                        </TouchableOpacity>
                    </View>
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
    pdf: {
        flex: 1,
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT,
    },
    loadingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: '#666',
        fontWeight: '500',
    },
    navigationBar: {
        position: 'absolute',
        bottom: 20,
        left: 20,
        right: 20,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        borderRadius: 12,
        padding: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
    },
    pageInfo: {
        flex: 1,
    },
    pageText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    zoomControls: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    zoomButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#2196F3',
        justifyContent: 'center',
        alignItems: 'center',
    },
    zoomButtonDisabled: {
        backgroundColor: '#666',
        opacity: 0.5,
    },
    zoomButtonText: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
    },
    resetZoomButton: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
    },
    resetZoomText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
    },
});
