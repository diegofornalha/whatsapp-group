import { Group, Member, Message } from '../types';
export interface ExportOptions {
    format: 'csv' | 'json' | 'excel';
    filename?: string;
    includeMetadata?: boolean;
    customFields?: string[];
}
export declare class MultiFormatExporter {
    /**
     * Export groups data in multiple formats
     */
    static exportGroups(groups: Group[], options: ExportOptions): Promise<Blob>;
    /**
     * Export members data in multiple formats
     */
    static exportMembers(members: Member[], options: ExportOptions): Promise<Blob>;
    /**
     * Export messages data in multiple formats
     */
    static exportMessages(messages: Message[], options: ExportOptions): Promise<Blob>;
    /**
     * Generic JSON export
     */
    private static exportToJSON;
    /**
     * Export groups to CSV
     */
    private static exportGroupsToCSV;
    /**
     * Export members to CSV
     */
    private static exportMembersToCSV;
    /**
     * Export messages to CSV
     */
    private static exportMessagesToCSV;
    /**
     * Export groups to Excel
     */
    private static exportGroupsToExcel;
    /**
     * Export members to Excel
     */
    private static exportMembersToExcel;
    /**
     * Export messages to Excel
     */
    private static exportMessagesToExcel;
    /**
     * Create CSV blob from headers and rows
     */
    private static createCSVBlob;
    /**
     * Create Excel blob from worksheet
     */
    private static createExcelBlob;
    /**
     * Download file helper
     */
    static downloadFile(blob: Blob, filename: string): void;
}
//# sourceMappingURL=MultiFormatExporter.d.ts.map