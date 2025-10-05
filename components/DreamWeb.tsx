import React, { useEffect, useRef, useContext } from 'react';
import * as d3 from 'd3';
import { Dream } from '../types';
import { DreamContext } from '../context/DreamContext';
import { MOODS } from '../constants';

interface DreamWebProps {
    isOpen: boolean;
    onClose: () => void;
    currentDream: Dream;
    onNodeClick: (dream: Dream) => void;
}

type GraphNode = d3.SimulationNodeDatum & Dream;
type GraphLink = { source: string; target: string; };

const moodColorMap = MOODS.reduce((acc, mood) => {
    acc[mood.label] = mood.color;
    return acc;
}, {} as Record<string, string>);


const DreamWeb: React.FC<DreamWebProps> = ({ isOpen, onClose, currentDream, onNodeClick }) => {
    const svgRef = useRef<SVGSVGElement>(null);
    const dreamContext = useContext(DreamContext);

    if (!dreamContext) return null;

    useEffect(() => {
        if (!isOpen || !svgRef.current) return;

        const { dreams } = dreamContext;
        const linkedDreams = dreams.filter(d => currentDream.linkedDreamIds?.includes(d.id));

        const nodes: GraphNode[] = [
            JSON.parse(JSON.stringify(currentDream)),
            ...JSON.parse(JSON.stringify(linkedDreams))
        ];

        if (nodes.length <= 1) {
            // Handle case with no links - show just the central node
            nodes[0].fx = svgRef.current.clientWidth / 2;
            nodes[0].fy = svgRef.current.clientHeight / 2;
        }

        const links: GraphLink[] = (currentDream.linkedDreamIds || [])
            .map(id => ({ source: currentDream.id, target: id }));

        const svg = d3.select(svgRef.current);
        svg.selectAll("*").remove();

        const width = svgRef.current.clientWidth;
        const height = svgRef.current.clientHeight;

        const simulation = d3.forceSimulation(nodes)
            .force("link", d3.forceLink<GraphNode, GraphLink>(links).id(d => d.id).distance(150))
            .force("charge", d3.forceManyBody().strength(-400))
            .force("center", d3.forceCenter(width / 2, height / 2));

        const link = svg.append("g")
            .attr("stroke", "#4c1d95")
            .attr("stroke-opacity", 0.6)
            .selectAll("line")
            .data(links)
            .join("line")
            .attr("stroke-width", 2);

        const node = svg.append("g")
            .selectAll("g")
            .data(nodes)
            .join("g")
            .style("cursor", "pointer")
            .on("click", (event, d) => {
                if (d.id !== currentDream.id) {
                    onNodeClick(d);
                }
            })
            .call(d3.drag<SVGGElement, GraphNode>()
                .on("start", (event, d) => {
                    if (!event.active) simulation.alphaTarget(0.3).restart();
                    d.fx = d.x; d.fy = d.y;
                })
                .on("drag", (event, d) => { d.fx = event.x; d.fy = event.y; })
                .on("end", (event, d) => {
                    if (!event.active) simulation.alphaTarget(0);
                    if (d.id !== currentDream.id) {
                        d.fx = null; d.fy = null;
                    }
                })
            );

        node.append("circle")
            .attr("r", d => d.id === currentDream.id ? 25 : 15)
            .attr("fill", d => moodColorMap[d.mood || ''] || '#555')
            .attr("stroke", d => d.id === currentDream.id ? "#f59e0b" : "#c4b5fd")
            .attr("stroke-width", d => d.id === currentDream.id ? 3 : 1.5);

        node.append("text")
            .text(d => d.title)
            .attr("text-anchor", "middle")
            .attr("y", d => d.id === currentDream.id ? 38 : 25)
            .attr("fill", "white")
            .style("font-size", d => d.id === currentDream.id ? "14px" : "12px")
            .style("pointer-events", "none");
        
        simulation.on("tick", () => {
            link
                .attr("x1", d => (d.source as unknown as GraphNode).x!)
                .attr("y1", d => (d.source as unknown as GraphNode).y!)
                .attr("x2", d => (d.target as unknown as GraphNode).x!)
                .attr("y2", d => (d.target as unknown as GraphNode).y!);
            node.attr("transform", d => `translate(${d.x!},${d.y!})`);
        });
        
        const zoom = d3.zoom<SVGSVGElement, unknown>().scaleExtent([0.2, 5]).on("zoom", (event) => {
            svg.selectAll('g').attr('transform', event.transform);
        });
        
        svg.call(zoom);

    }, [isOpen, currentDream, dreamContext, onNodeClick]);

    return (
        <div className={`fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'} transition-opacity`} onClick={onClose}>
            <div className="bg-gray-900/50 border border-purple-500/50 rounded-lg shadow-2xl w-full h-full max-w-6xl max-h-[90vh] p-6 flex flex-col" onClick={e => e.stopPropagation()}>
                 <div className="flex justify-between items-center mb-4">
                    <h2 className="text-3xl font-bold text-purple-300">Dream Web: {currentDream.title}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white text-3xl leading-none">&times;</button>
                </div>
                <div className="flex-grow bg-black/20 rounded-lg border border-purple-500/20 overflow-hidden">
                    <svg ref={svgRef} className="w-full h-full"></svg>
                </div>
            </div>
        </div>
    );
}

export default DreamWeb;