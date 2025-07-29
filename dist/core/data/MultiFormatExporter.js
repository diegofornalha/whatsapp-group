import * as XLSX from 'xlsx';
export class MultiFormatExporter {
    /**
     * Export groups data in multiple formats
     */
    static async exportGroups(groups, options) {
        switch (options.format) {
            case 'json':
                return this.exportToJSON(groups, options);
            case 'csv':
                return this.exportGroupsToCSV(groups, options);
            case 'excel':
                return this.exportGroupsToExcel(groups, options);
            default:
                throw new Error(`Unsupported format: ${options.format}`);
        }
    }
    /**
     * Export members data in multiple formats
     */
    static async exportMembers(members, options) {
        switch (options.format) {
            case 'json':
                return this.exportToJSON(members, options);
            case 'csv':
                return this.exportMembersToCSV(members, options);
            case 'excel':
                return this.exportMembersToExcel(members, options);
            default:
                throw new Error(`Unsupported format: ${options.format}`);
        }
    }
    /**
     * Export messages data in multiple formats
     */
    static async exportMessages(messages, options) {
        switch (options.format) {
            case 'json':
                return this.exportToJSON(messages, options);
            case 'csv':
                return this.exportMessagesToCSV(messages, options);
            case 'excel':
                return this.exportMessagesToExcel(messages, options);
            default:
                throw new Error(`Unsupported format: ${options.format}`);
        }
    }
    /**
     * Generic JSON export
     */
    static exportToJSON(data, options) {
        const jsonData = options.includeMetadata ? {
            metadata: {
                exportDate: new Date().toISOString(),
                recordCount: data.length,
                format: 'json',
                version: '1.0'
            },
            data: data
        } : data;
        const jsonString = JSON.stringify(jsonData, null, 2);
        return new Blob([jsonString], { type: 'application/json' });
    }
    /**
     * Export groups to CSV
     */
    static exportGroupsToCSV(groups, options) {
        const headers = ['Nome', 'Descrição', 'Membros', 'Admins', 'Criado em'];
        const rows = groups.map(group => [
            group.name,
            group.description || '',
            group.memberCount || 0,
            group.adminCount || 0,
            group.createdAt || ''
        ]);
        return this.createCSVBlob(headers, rows);
    }
    /**
     * Export members to CSV
     */
    static exportMembersToCSV(members, options) {
        const headers = ['Nome', 'Telefone', 'Admin', 'Grupos', 'Ativo'];
        const rows = members.map(member => [
            member.name,
            member.phone,
            member.isAdmin ? 'Sim' : 'Não',
            member.groupCount || 0,
            member.isActive ? 'Sim' : 'Não'
        ]);
        return this.createCSVBlob(headers, rows);
    }
    /**
     * Export messages to CSV
     */
    static exportMessagesToCSV(messages, options) {
        const headers = ['Grupo', 'Autor', 'Mensagem', 'Data', 'Tipo'];
        const rows = messages.map(msg => [
            msg.groupName || '',
            msg.authorName || '',
            msg.content,
            msg.timestamp,
            msg.type || 'text'
        ]);
        return this.createCSVBlob(headers, rows);
    }
    /**
     * Export groups to Excel
     */
    static exportGroupsToExcel(groups, options) {
        const worksheet = XLSX.utils.json_to_sheet(groups.map(group => ({
            'Nome': group.name,
            'Descrição': group.description || '',
            'Membros': group.memberCount || 0,
            'Administradores': group.adminCount || 0,
            'Criado em': group.createdAt || ''
        })));
        return this.createExcelBlob(worksheet, 'Grupos');
    }
    /**
     * Export members to Excel
     */
    static exportMembersToExcel(members, options) {
        const worksheet = XLSX.utils.json_to_sheet(members.map(member => ({
            'Nome': member.name,
            'Telefone': member.phone,
            'Administrador': member.isAdmin ? 'Sim' : 'Não',
            'Grupos': member.groupCount || 0,
            'Ativo': member.isActive ? 'Sim' : 'Não'
        })));
        return this.createExcelBlob(worksheet, 'Membros');
    }
    /**
     * Export messages to Excel
     */
    static exportMessagesToExcel(messages, options) {
        const worksheet = XLSX.utils.json_to_sheet(messages.map(msg => ({
            'Grupo': msg.groupName || '',
            'Autor': msg.authorName || '',
            'Mensagem': msg.content,
            'Data': msg.timestamp,
            'Tipo': msg.type || 'text'
        })));
        return this.createExcelBlob(worksheet, 'Mensagens');
    }
    /**
     * Create CSV blob from headers and rows
     */
    static createCSVBlob(headers, rows) {
        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');
        return new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    }
    /**
     * Create Excel blob from worksheet
     */
    static createExcelBlob(worksheet, sheetName) {
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        return new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    }
    /**
     * Download file helper
     */
    static downloadFile(blob, filename) {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }
}
//# sourceMappingURL=MultiFormatExporter.js.map