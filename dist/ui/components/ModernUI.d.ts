import React from 'react';
import './ModernUI.css';
interface ModernUIProps {
    onStartScraping: () => void;
    onStopScraping: () => void;
    isScrapingActive: boolean;
    progress: number;
    membersCount: number;
    groupName?: string;
    error?: string;
}
export declare const ModernUI: React.FC<ModernUIProps>;
export {};
//# sourceMappingURL=ModernUI.d.ts.map