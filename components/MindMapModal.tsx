import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { Dream } from '../types';
import { extractMindMapData } from '../services/geminiService';
import LoadingSpinner from './LoadingSpinner';
import { SparklesIcon } from './icons';

interface MindMapModalProps {
    isOpen: boolean;
    onClose: () => void;
    dream: Dream;
    onInterpretSymbol: (symbol: string) => void;
}

// Extend Node type with d3.SimulationNodeDatum to include x, y, etc. properties for d3 force simulation.
type Node = d3.SimulationNodeDatum & { id: string; label: string; type: string; radius: number; };
type Link = { source: string; target: string; };

const MindMapModal: React.FC<MindMapModalProps> = ({ isOpen, onClose, dream, onInterpretSymbol }) => {
    const [data, setData] = useState<{ nodes: Node[], links: Link[] } | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const svgRef = useRef<SVGSVGElement>(null);

    useEffect(() => {
        if (isOpen) {
            const fetchData = async () => {
                setIsLoading(true);
                setError(null);
                setData(null);
                try {
                    const mindMapData = await extractMindMapData(dream);
                    
                    const nodes: Node[] = [];
                    const links: Link[] = [];

                    // Root node
                    nodes.push({ id: dream.id, label: dream.title, type: 'root', radius: 40 });
                    
                    // Central Theme node
                    nodes.push({ id: 'theme', label: mindMapData.centralTheme, type: 'theme', radius: 30 });
                    links.push({ source: dream.id, target: 'theme' });

                    const createChildNodes = (parentId: string, items: string[], type: string) => {
                        items.forEach((item, index) => {
                            if (item.trim()) {
                                const nodeId = `${type}-${index}`;
                                nodes.push({ id: nodeId, label: item, type: type, radius: 20 });
                                links.push({ source: parentId, target: nodeId });
                            }
                        });
                    };

                    createChildNodes('theme', mindMapData.keySymbols, 'symbol');
                    createChildNodes('theme', mindMapData.emotions, 'emotion');
                    createChildNodes('theme', mindMapData.characters, 'character');
                    createChildNodes('theme', mindMapData.settings, 'setting');

                    setData({ nodes, links });
                } catch (err) {
                    setError(err instanceof Error ? err.message : "Failed to generate mind map data.");
                } finally {
                    setIsLoading(false);
                }
            };
            fetchData();
        }
    }, [isOpen, dream]);

    useEffect(() => {
        if (!isOpen || !data || !svgRef.current) return;

        const svg = d3.select(svgRef.current);
        svg.selectAll("*").remove(); // Clear previous render

        const width = svgRef.current.clientWidth;
        const height = svgRef.current.clientHeight;

        const simulation = d3.forceSimulation(data.nodes)
            .force("link", d3.forceLink<Node, Link>(data.links).id((d) => d.id).distance(100))
            .force("charge", d3.forceManyBody().strength(-300))
            .force("center", d3.forceCenter(width / 2, height / 2));

        const link = svg.append("g")
            .attr("stroke", "#4c1d95")
            .attr("stroke-opacity", 0.6)
            .selectAll("line")
            .data(data.links)
            .enter().append("line")
            .attr("stroke-width", 1.5);

        const node = svg.append("g")
            .selectAll("g")
            .data(data.nodes)
            .enter().append("g")
            .attr("class", d => d.type === 'symbol' ? 'cursor-pointer' : 'cursor-grab')
            .call(d3.drag<SVGGElement, Node>()
                .on("start", (event, d) => {
                    if (!event.active) simulation.alphaTarget(0.3).restart();
                    d.fx = d.x;
                    d.fy = d.y;
                })
                .on("drag", (event, d) => {
                    d.fx = event.x;
                    d.fy = event.y;
                })
                .on("end", (event, d) => {
                    if (!event.active) simulation.alphaTarget(0);
                    d.fx = null;
                    d.fy = null;
                })
            );

        node.append("circle")
            .attr("r", d => d.radius)
            .attr("fill", d => {
                switch(d.type) {
                    case 'root': return '#6d28d9';
                    case 'theme': return '#8b5cf6';
                    case 'symbol': return '#a78bfa';
                    default: return '#374151';
                }
            })
            .attr("stroke", "#c4b5fd")
            .attr("stroke-width", 1.5);

        node.append("text")
            .text(d => d.label)
            .attr("text-anchor", "middle")
            .attr("dy", ".3em")
            .attr("fill", "white")
            .style("font-size", d => d.radius > 30 ? "14px" : "12px")
            .style("pointer-events", "none");

        node.filter(d => d.type === 'symbol').on('click', (event, d) => {
            onInterpretSymbol(d.label);
        });
        
        simulation.on("tick", () => {
            link
                // D3 mutates the link objects, replacing string IDs with node object references.
                // We must cast to unknown first, then to Node, to satisfy TypeScript.
                .attr("x1", d => (d.source as unknown as Node).x!)
                .attr("y1", d => (d.source as unknown as Node).y!)
                .attr("x2", d => (d.target as unknown as Node).x!)
                .attr("y2", d => (d.target as unknown as Node).y!);
            node.attr("transform", d => `translate(${d.x!},${d.y!})`);
        });

        // Zoom functionality
        const zoom = d3.zoom<SVGSVGElement, unknown>()
            .scaleExtent([0.1, 4])
            .on("zoom", (event) => {
                svg.selectAll('g').attr('transform', event.transform);
            });
        
        svg.call(zoom);

    }, [data, isOpen, onInterpretSymbol]);

    if (!isOpen) return null;

    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="flex flex-col items-center justify-center h-full">
                    <LoadingSpinner />
                    <p className="mt-4 text-purple-300">Generating mind map from your dream...</p>
                </div>
            );
        }
        if (error) {
            return (
                <div className="flex items-center justify-center h-full">
                    <div className="p-3 bg-red-500/20 border border-red-500 text-red-300 rounded-lg">
                        <p className="font-bold">Mind Map Failed</p>
                        <p>{error}</p>
                    </div>
                </div>
            );
        }
        return <svg ref={svgRef} className="w-full h-full"></svg>;
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-gray-900/50 border border-purple-500/50 rounded-lg shadow-2xl shadow-purple-500/20 w-full h-full max-w-6xl max-h-[90vh] p-6 flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-3xl font-bold text-purple-300">Dream Mind Map</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white text-3xl leading-none">&times;</button>
                </div>
                 <p className="text-sm text-purple-300 mb-2 flex items-center gap-1.5"><SparklesIcon className="h-4 w-4" /> Click on a symbol node to interpret its meaning.</p>
                <div className="flex-grow bg-black/20 rounded-lg border border-purple-500/20 overflow-hidden">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};

export default MindMapModal;