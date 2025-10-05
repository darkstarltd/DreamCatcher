import React, { useContext, useEffect, useMemo, useRef } from 'react';
import * as d3 from 'd3';
import { Dream } from '../types';
import { DreamContext } from '../context/DreamContext';
import { SettingsContext } from '../context/SettingsContext';
import { MOODS } from '../constants';

interface DreamScapeProps {
    onNodeDoubleClick: (dream: Dream) => void;
}

type GraphNode = d3.SimulationNodeDatum & Dream;
type GraphLink = { source: string; target: string; weight: number; };

const moodColorMap = MOODS.reduce((acc, mood) => {
    acc[mood.label] = mood.color;
    return acc;
}, {} as Record<string, string>);

const DreamScape: React.FC<DreamScapeProps> = ({ onNodeDoubleClick }) => {
    const dreamContext = useContext(DreamContext);
    const settingsContext = useContext(SettingsContext);
    const svgRef = useRef<SVGSVGElement>(null);
    const tooltipRef = useRef<HTMLDivElement>(null);

    if (!dreamContext || !settingsContext) return null;

    const graphData = useMemo(() => {
        const { dreams } = dreamContext;
        const { dreamSigns } = settingsContext;

        const nodes: GraphNode[] = JSON.parse(JSON.stringify(dreams));
        const links: GraphLink[] = [];
        const linkSet = new Set<string>();

        for (let i = 0; i < dreams.length; i++) {
            for (let j = i + 1; j < dreams.length; j++) {
                const dreamA = dreams[i];
                const dreamB = dreams[j];
                const linkKey1 = `${dreamA.id}-${dreamB.id}`;
                const linkKey2 = `${dreamB.id}-${dreamA.id}`;
                
                if (linkSet.has(linkKey1) || linkSet.has(linkKey2)) continue;

                let weight = 0;

                // Strongest: Explicit links
                if (dreamA.linkedDreamIds?.includes(dreamB.id)) {
                    weight = 5;
                }
                // Strong: Shared dream signs
                else {
                    const dreamATags = new Set(dreamA.tags || []);
                    const sharedSigns = (dreamB.tags || []).filter(tag => dreamSigns.has(tag) && dreamATags.has(tag));
                    if (sharedSigns.length > 0) {
                        weight = 3;
                    }
                    // Weak: Shared common tags
                    else {
                        const sharedTags = (dreamB.tags || []).filter(tag => !dreamSigns.has(tag) && dreamATags.has(tag));
                        if (sharedTags.length > 1) { // Require at least 2 shared common tags
                           weight = 1;
                        }
                    }
                }

                if (weight > 0) {
                    links.push({ source: dreamA.id, target: dreamB.id, weight });
                    linkSet.add(linkKey1);
                }
            }
        }
        return { nodes, links };
    }, [dreamContext, settingsContext]);

    useEffect(() => {
        if (!graphData || !svgRef.current) return;

        const svg = d3.select(svgRef.current);
        svg.selectAll("*").remove(); // Clear previous render

        const width = svgRef.current.clientWidth;
        const height = svgRef.current.clientHeight;

        const simulation = d3.forceSimulation(graphData.nodes)
            .force("link", d3.forceLink<GraphNode, GraphLink>(graphData.links).id(d => d.id).strength(d => d.weight / 10))
            .force("charge", d3.forceManyBody().strength(-150))
            .force("center", d3.forceCenter(width / 2, height / 2))
            .force("x", d3.forceX(width / 2).strength(0.05))
            .force("y", d3.forceY(height / 2).strength(0.05));

        const link = svg.append("g")
            .attr("stroke-opacity", 0.4)
            .selectAll("line")
            .data(graphData.links)
            .join("line")
            .attr("stroke", "#4c1d95")
            .attr("stroke-width", d => Math.sqrt(d.weight) * 1.5);

        const node = svg.append("g")
            .selectAll("circle")
            .data(graphData.nodes)
            .join("circle")
            .attr("r", d => 5 + ((d.clarity || 0) + (d.lucidity || 0))) // Size based on clarity/lucidity
            .attr("fill", d => moodColorMap[d.mood || ''] || '#555')
            .attr("stroke", "#c4b5fd")
            .attr("stroke-width", 1.5)
            .style("cursor", "pointer")
            .call(d3.drag<SVGCircleElement, GraphNode>()
                .on("start", (event, d) => {
                    if (!event.active) simulation.alphaTarget(0.3).restart();
                    d.fx = d.x;
                    d.fy = d.y;
                })
                .on("drag", (event, d) => { d.fx = event.x; d.fy = event.y; })
                .on("end", (event, d) => {
                    if (!event.active) simulation.alphaTarget(0);
                    d.fx = null;
                    d.fy = null;
                })
            );

        // Tooltip logic
        const tooltip = d3.select(tooltipRef.current);
        node.on("mouseover", (event, d) => {
            tooltip.style("visibility", "visible")
                   .html(`<strong>${d.title}</strong><br/><small>${d.date}</small>`)
                   .style("left", `${event.pageX + 10}px`)
                   .style("top", `${event.pageY + 10}px`);
        }).on("mouseout", () => {
            tooltip.style("visibility", "hidden");
        }).on("dblclick", (event, d) => {
            onNodeDoubleClick(d);
        });

        simulation.on("tick", () => {
            link
                // Cast source/target to unknown first, because d3 mutates the link objects from string IDs to node objects.
                .attr("x1", d => (d.source as unknown as GraphNode).x!)
                .attr("y1", d => (d.source as unknown as GraphNode).y!)
                .attr("x2", d => (d.target as unknown as GraphNode).x!)
                .attr("y2", d => (d.target as unknown as GraphNode).y!);

            node.attr("cx", d => d.x!).attr("cy", d => d.y!);
        });
        
        const zoom = d3.zoom<SVGSVGElement, unknown>()
            .scaleExtent([0.1, 8])
            .on("zoom", (event) => {
                svg.selectAll('g').attr('transform', event.transform);
            });
        
        svg.call(zoom);

    }, [graphData, onNodeDoubleClick]);

    if (!graphData || graphData.nodes.length === 0) {
        return (
            <div className="flex items-center justify-center h-full text-purple-400 text-center bg-black/30 rounded-lg border border-purple-500/20 p-4">
                <div>
                    <h3 className="text-xl font-semibold text-white">Your DreamScape is waiting to be discovered.</h3>
                    <p className="mt-2">Record more dreams to see the connections form.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full h-full bg-black/30 rounded-lg border border-purple-500/20 relative overflow-hidden">
            <svg ref={svgRef} className="w-full h-full"></svg>
            <div
                ref={tooltipRef}
                className="absolute p-2 text-sm text-white bg-gray-800/80 border border-purple-500/50 rounded-md shadow-lg pointer-events-none"
                style={{ visibility: 'hidden', transition: 'visibility 0s linear 300ms, opacity 300ms' }}
            ></div>
             <div className="absolute top-4 left-4 text-xs text-purple-300 bg-black/30 p-2 rounded-md">
                Double-click a node to view dream details. Pan and zoom to explore.
            </div>
        </div>
    );
};

export default DreamScape;