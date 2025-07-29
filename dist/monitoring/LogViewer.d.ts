import React from 'react';
import { Logger } from './Logger';
interface LogViewerProps {
    logger: Logger;
    maxLogs?: number;
    autoScroll?: boolean;
    showSearch?: boolean;
    showFilters?: boolean;
    refreshInterval?: number;
}
export declare const LogViewer: React.FC<LogViewerProps>;
export {};
//# sourceMappingURL=LogViewer.d.ts.map