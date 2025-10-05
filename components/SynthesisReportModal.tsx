import React, { useState, useContext, useMemo, FC } from 'react';
import { DreamContext } from '../context/DreamContext.tsx';
import { SettingsContext } from '../context/SettingsContext.tsx';
import { ToastContext } from '../context/ToastContext.tsx';
import { Dream, SynthesisReport } from '../types.ts';
import { generateSynthesisReport } from '../services/geminiService.ts';
import LoadingSpinner from './LoadingSpinner.tsx';
import { DocumentTextIcon, LinkIcon } from './icons/index.tsx';

interface SynthesisReportModalProps {
    isOpen: boolean;
    onClose: () => void;
}

type ReportStep = 'options' | 'generating' | 'report';
type DateRange = '7' | '30' | 'all';

const ReportView: FC<{ report: SynthesisReport, onDreamClick: (dream: Dream) => void }> = ({ report, onDreamClick }) => {
    const { dreams } = useContext(DreamContext)!;
    
    const getDreamById = (id: string) => dreams.find(d => d.id === id);

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="w-full">
            <div id="report-content" className="printable-area prose prose-invert max-w-none prose-headings:text-purple-300 prose-p:text-gray-300 prose-li:text-gray-300 print-bg-white print-text-black">
                <h1 className="text-3xl font-bold text-white print-text-black">Dream Synthesis Report</h1>
                
                <section>
                    <h2 className="print-text-black">Executive Summary</h2>
                    <p>{report.executiveSummary}</p>
                </section>
                
                <section>
                    <h2 className="print-text-black">Key Themes</h2>
                    {report.keyThemes.map(item => (
                        <div key={item.theme} className="mt-4 p-3 bg-black/20 rounded-lg border border-purple-500/10 print-bg-white">
                            <h3 className="print-text-black">{item.theme}</h3>
                            <p>{item.analysis}</p>
                            <div className="flex flex-wrap gap-2 mt-2">
                                {item.relevantDreamIds.map(id => {
                                    const dream = getDreamById(id);
                                    return dream ? (
                                        <button onClick={() => onDreamClick(dream)} key={id} className="flex items-center gap-1.5 text-xs bg-purple-900/40 hover:bg-purple-900/70 text-purple-200 px-2 py-1 rounded-full transition-colors no-print">
                                            <LinkIcon className="h-3 w-3" /> {dream.title}
                                        </button>
                                    ) : null;
                                })}
                            </div>
                        </div>
                    ))}
                </section>

                <section>
                    <h2 className="print-text-black">Mood Analysis</h2>
                    <p>{report.moodAnalysis}</p>
                </section>
                
                <section>
                     <h2 className="print-text-black">Symbolic Deep Dive</h2>
                     {report.symbolicDeepDive.map(item => (
                        <div key={item.symbol} className="mt-4 p-3 bg-black/20 rounded-lg border border-purple-500/10 print-bg-white">
                            <h3 className="print-text-black">{item.symbol}</h3>
                            <p>{item.interpretation}</p>
                             <div className="flex flex-wrap gap-2 mt-2">
                                {item.relevantDreamIds.map(id => {
                                    const dream = getDreamById(id);
                                    return dream ? (
                                        <button onClick={() => onDreamClick(dream)} key={id} className="flex items-center gap-1.5 text-xs bg-purple-900/40 hover:bg-purple-900/70 text-purple-200 px-2 py-1 rounded-full transition-colors no-print">
                                            <LinkIcon className="h-3 w-3" /> {dream.title}
                                        </button>
                                    ) : null;
                                })}
                            </div>
                        </div>
                    ))}
                </section>
                
                 <section>
                    <h2 className="print-text-black">Connection to Your Goal</h2>
                    <p>{report.connectionToGoal}</p>
                </section>

                <section>
                    <h2 className="print-text-black">Actionable Insights & Questions</h2>
                    <ul className="list-disc pl-5 space-y-2">
                       {report.actionableInsights.map((insight, i) => <li key={i}>{insight}</li>)}
                    </ul>
                </section>
            </div>
             <div className="flex justify-end pt-4 mt-6 border-t border-purple-500/20 no-print">
                <button onClick={handlePrint} className="py-2 px-4 bg-gray-700 hover:bg-gray-600 rounded-md transition-colors">Print Report</button>
            </div>
        </div>
    );
};


const SynthesisReportModal: React.FC<SynthesisReportModalProps> = ({ isOpen, onClose }) => {
    const dreamContext = useContext(DreamContext);
    const settingsContext = useContext(SettingsContext);
    const toastContext = useContext(ToastContext);

    const [step, setStep] = useState<ReportStep>('options');
    const [dateRange, setDateRange] = useState<DateRange>('30');
    const [error, setError] = useState<string | null>(null);
    const [report, setReport] = useState<SynthesisReport | null>(null);

    if (!isOpen || !dreamContext || !settingsContext || !toastContext) return null;

    const { dreams, selectDream } = dreamContext;
    const { userGoal } = settingsContext;
    const { addToast } = toastContext;

    const filteredDreams = useMemo(() => {
        if (dateRange === 'all') return dreams;
        const rangeInDays = parseInt(dateRange, 10);
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - rangeInDays);
        return dreams.filter(d => new Date(d.date) >= cutoffDate);
    }, [dreams, dateRange]);

    const handleGenerate = async () => {
        if (filteredDreams.length < 5) {
            addToast(`You need at least 5 dreams in the selected date range to generate a report. You have ${filteredDreams.length}.`, 'error');
            return;
        }

        setStep('generating');
        setError(null);
        try {
            const result = await generateSynthesisReport(filteredDreams, userGoal);
            setReport(result);
            setStep('report');
        } catch (err) {
            const msg = err instanceof Error ? err.message : "Failed to generate report.";
            setError(msg);
            setStep('options'); // Go back to options on error
        }
    };

    const handleDreamClick = (dream: Dream) => {
        onClose();
        selectDream(dream);
    };

    const renderContent = () => {
        switch (step) {
            case 'generating':
                return (
                    <div className="flex flex-col items-center justify-center p-8 min-h-[300px]">
                        <LoadingSpinner />
                        <p className="mt-4 text-purple-300">Synthesizing your dream journal... This may take a moment.</p>
                    </div>
                );
            case 'report':
                return report ? <ReportView report={report} onDreamClick={handleDreamClick} /> : null;
            case 'options':
            default:
                return (
                    <div className="text-center space-y-6">
                        <h3 className="text-xl font-semibold text-purple-200">Select Date Range for Report</h3>
                        <div className="flex justify-center gap-4">
                            {(['7', '30', 'all'] as DateRange[]).map(range => (
                                <button key={range} onClick={() => setDateRange(range)} className={`px-4 py-2 rounded-md transition-colors ${dateRange === range ? 'bg-purple-600 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}>
                                    {range === 'all' ? 'All Time' : `Last ${range} Days`}
                                </button>
                            ))}
                        </div>
                        <p className="text-sm text-purple-400">Selected dreams in range: {filteredDreams.length}</p>
                        {error && <p className="text-red-400 p-2 bg-red-500/10 rounded-md">{error}</p>}
                        <button
                            onClick={handleGenerate}
                            disabled={filteredDreams.length < 5}
                            title={filteredDreams.length < 5 ? "Not enough dreams in range" : "Generate report"}
                            className="w-full max-w-xs mx-auto py-2 px-4 bg-purple-600 hover:bg-purple-500 rounded-md font-semibold transition-colors disabled:opacity-50"
                        >
                            Generate Report
                        </button>
                    </div>
                );
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-gray-900 border border-purple-500/50 rounded-lg shadow-2xl shadow-purple-500/20 w-full max-w-4xl max-h-[90vh] p-8 flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="flex-shrink-0 no-print">
                    <div className="flex justify-between items-start mb-4">
                        <h2 className="text-3xl font-bold text-purple-300 flex items-center gap-3">
                           <DocumentTextIcon /> Dream Synthesis Report
                        </h2>
                        <button onClick={onClose} className="text-gray-400 hover:text-white text-3xl leading-none">&times;</button>
                    </div>
                </div>
                <div className="flex-grow overflow-y-auto pr-4">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};

export default SynthesisReportModal;