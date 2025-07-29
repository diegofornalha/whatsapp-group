import React, { useState, useEffect } from 'react';
import { ThemeProvider } from '../themes/ThemeManager';
import { ResponsiveLayout } from '../layouts/ResponsiveLayout';
import { PerformanceCounter } from './PerformanceCounter';
import './ModernUI.css';
export const ModernUI = ({ onStartScraping, onStopScraping, isScrapingActive, progress, membersCount, groupName = 'WhatsApp Group', error }) => {
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    useEffect(() => {
        // Check system preference
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setIsDarkMode(prefersDark);
    }, []);
    useEffect(() => {
        if (progress === 100 && !error) {
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 3000);
        }
    }, [progress, error]);
    const toggleTheme = () => {
        setIsDarkMode(!isDarkMode);
    };
    return (React.createElement(ThemeProvider, { isDarkMode: isDarkMode },
        React.createElement(ResponsiveLayout, null,
            React.createElement("div", { className: "modern-ui" },
                React.createElement("header", { className: "header" },
                    React.createElement("div", { className: "header-content" },
                        React.createElement("h1", { className: "app-title" },
                            React.createElement("span", { className: "icon" }, "\uD83D\uDCF1"),
                            "WhatsApp Scraper"),
                        React.createElement("button", { className: "theme-toggle", onClick: toggleTheme, "aria-label": "Toggle dark mode" }, isDarkMode ? '☀️' : '🌙'))),
                React.createElement("main", { className: "main-content" },
                    React.createElement("div", { className: "card" },
                        React.createElement("h2", { className: "card-title" }, groupName),
                        React.createElement("div", { className: "status-section" },
                            React.createElement("div", { className: `status-indicator ${isScrapingActive ? 'active' : ''}` },
                                React.createElement("span", { className: "status-dot" }),
                                React.createElement("span", { className: "status-text" }, isScrapingActive ? 'Coletando dados...' : 'Pronto para iniciar'))),
                        isScrapingActive && (React.createElement("div", { className: "progress-section" },
                            React.createElement("div", { className: "progress-header" },
                                React.createElement("span", null, "Progresso"),
                                React.createElement("span", null,
                                    Math.round(progress),
                                    "%")),
                            React.createElement("div", { className: "progress-bar" },
                                React.createElement("div", { className: "progress-fill", style: { width: `${progress}%` } })))),
                        React.createElement(PerformanceCounter, { membersCount: membersCount, isActive: isScrapingActive }),
                        React.createElement("div", { className: "action-buttons" }, !isScrapingActive ? (React.createElement("button", { className: "btn btn-primary", onClick: onStartScraping },
                            React.createElement("span", { className: "btn-icon" }, "\u25B6\uFE0F"),
                            "Iniciar Coleta")) : (React.createElement("button", { className: "btn btn-danger", onClick: onStopScraping },
                            React.createElement("span", { className: "btn-icon" }, "\u23F9\uFE0F"),
                            "Parar Coleta"))),
                        error && (React.createElement("div", { className: "error-message" },
                            React.createElement("span", { className: "error-icon" }, "\u26A0\uFE0F"),
                            error)),
                        showSuccess && (React.createElement("div", { className: "success-animation" },
                            React.createElement("span", { className: "success-icon" }, "\u2705"),
                            React.createElement("span", null, "Coleta conclu\u00EDda com sucesso!")))),
                    React.createElement("div", { className: "stats-grid" },
                        React.createElement("div", { className: "stat-card" },
                            React.createElement("div", { className: "stat-icon" }, "\uD83D\uDC65"),
                            React.createElement("div", { className: "stat-content" },
                                React.createElement("div", { className: "stat-value" }, membersCount),
                                React.createElement("div", { className: "stat-label" }, "Membros Coletados"))),
                        React.createElement("div", { className: "stat-card" },
                            React.createElement("div", { className: "stat-icon" }, "\u23F1\uFE0F"),
                            React.createElement("div", { className: "stat-content" },
                                React.createElement("div", { className: "stat-value" }, isScrapingActive ? 'Ativo' : 'Pausado'),
                                React.createElement("div", { className: "stat-label" }, "Status"))),
                        React.createElement("div", { className: "stat-card" },
                            React.createElement("div", { className: "stat-icon" }, "\uD83D\uDCCA"),
                            React.createElement("div", { className: "stat-content" },
                                React.createElement("div", { className: "stat-value" },
                                    Math.round(progress),
                                    "%"),
                                React.createElement("div", { className: "stat-label" }, "Progresso"))))),
                React.createElement("footer", { className: "footer" },
                    React.createElement("p", null, "WhatsApp Group Scraper \u00A9 2025"))))));
};
//# sourceMappingURL=ModernUI.js.map