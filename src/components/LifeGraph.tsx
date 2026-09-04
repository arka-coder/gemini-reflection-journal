import React, { useState } from 'react';
import { LifeGraphNode, LifeGraphEdge } from '../types';
import { Network, Sparkles, X, ChevronRight, Clock, Target, Compass, Flame, Brain, Shield } from 'lucide-react';

interface LifeGraphProps {
  nodes: LifeGraphNode[];
  edges: LifeGraphEdge[];
  onSelectNode?: (node: LifeGraphNode) => void;
}

const TYPE_CONFIG = {
  value: { label: 'Value', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 ring-emerald-500/30', fill: '#10b981', icon: Shield },
  goal: { label: 'Goal', color: 'bg-blue-500/20 text-blue-300 border-blue-500/40 ring-blue-500/30', fill: '#3b82f6', icon: Target },
  theme: { label: 'Theme', color: 'bg-violet-500/20 text-violet-300 border-violet-500/40 ring-violet-500/30', fill: '#8b5cf6', icon: Compass },
  emotion: { label: 'Emotion', color: 'bg-amber-500/20 text-amber-300 border-amber-500/40 ring-amber-500/30', fill: '#f59e0b', icon: Flame },
  decision_pattern: { label: 'Decision Pattern', color: 'bg-rose-500/20 text-rose-300 border-rose-500/40 ring-rose-500/30', fill: '#f43f5e', icon: Brain },
};

export const LifeGraph: React.FC<LifeGraphProps> = ({ nodes, edges, onSelectNode }) => {
  const [selectedNode, setSelectedNode] = useState<LifeGraphNode | null>(nodes[0] || null);

  // Position nodes radially or use pre-assigned coordinates
  const width = 640;
  const height = 400;
  const centerX = width / 2;
  const centerY = height / 2;

  const nodeCoordinates = nodes.map((node, i) => {
    if (typeof node.x === 'number' && typeof node.y === 'number') {
      return { ...node, posX: node.x, posY: node.y };
    }
    const angle = (i / Math.max(nodes.length, 1)) * 2 * Math.PI - Math.PI / 2;
    const radius = 130 + (i % 2 === 0 ? 30 : -20);
    return {
      ...node,
      posX: centerX + Math.cos(angle) * radius,
      posY: centerY + Math.sin(angle) * radius,
    };
  });

  const nodeMap = new Map(nodeCoordinates.map((n) => [n.id, n]));

  const handleNodeClick = (node: LifeGraphNode) => {
    setSelectedNode(node);
    if (onSelectNode) onSelectNode(node);
  };

  return (
    <div className="bg-white/[0.025] backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden shadow-2xl flex flex-col lg:flex-row">
      {/* Left: SVG Canvas Graph */}
      <div className="flex-1 p-5 relative min-h-[380px] sm:min-h-[420px] flex flex-col">
        <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-2">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Network className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Interactive Life Graph</h3>
              <p className="text-[11px] text-slate-400">Visual topology of recurring themes, values, goals, and emotional feedback loops</p>
            </div>
          </div>

          <div className="hidden sm:flex items-center space-x-3 text-[11px] text-slate-400">
            <span className="flex items-center space-x-1"><span className="w-2 h-2 rounded-full bg-emerald-400" /><span>Value</span></span>
            <span className="flex items-center space-x-1"><span className="w-2 h-2 rounded-full bg-blue-400" /><span>Goal</span></span>
            <span className="flex items-center space-x-1"><span className="w-2 h-2 rounded-full bg-violet-400" /><span>Theme</span></span>
            <span className="flex items-center space-x-1"><span className="w-2 h-2 rounded-full bg-amber-400" /><span>Emotion</span></span>
            <span className="flex items-center space-x-1"><span className="w-2 h-2 rounded-full bg-rose-400" /><span>Pattern</span></span>
          </div>
        </div>

        {/* SVG Container */}
        <div className="flex-1 relative flex items-center justify-center overflow-hidden">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="w-full h-full max-h-[400px] select-none"
          >
            <defs>
              <radialGradient id="graph-glow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#34d399" stopOpacity="0.18" />
                <stop offset="45%" stopColor="#10b981" stopOpacity="0.08" />
                <stop offset="80%" stopColor="#064e3b" stopOpacity="0.02" />
                <stop offset="100%" stopColor="#042f2e" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* Ambient Background Glow / Radar Ring */}
            <circle
              id="life-graph-ambient-glow"
              cx={centerX}
              cy={centerY}
              r="175"
              fill="url(#graph-glow)"
              stroke="#34d399"
              strokeWidth="1"
              strokeOpacity="0.2"
              strokeDasharray="4 6"
              className="pointer-events-none transition-all duration-500"
            />

            {/* Edges */}
            {edges.map((edge) => {
              const src = nodeMap.get(edge.source);
              const tgt = nodeMap.get(edge.target);
              if (!src || !tgt) return null;

              const isConnectedToSelected =
                selectedNode && (selectedNode.id === edge.source || selectedNode.id === edge.target);

              return (
                <g key={edge.id} className="transition-all duration-300">
                  <line
                    x1={src.posX}
                    y1={src.posY}
                    x2={tgt.posX}
                    y2={tgt.posY}
                    stroke={isConnectedToSelected ? '#34d399' : '#475569'}
                    strokeWidth={isConnectedToSelected ? 2 : Math.max(1, edge.strength * 0.4)}
                    strokeOpacity={isConnectedToSelected ? 0.8 : 0.35}
                    strokeDasharray={edge.strength <= 2 ? '4 3' : undefined}
                  />
                  {/* Subtle edge label */}
                  {edge.relation && (
                    <text
                      x={(src.posX + tgt.posX) / 2}
                      y={(src.posY + tgt.posY) / 2 - 4}
                      fill={isConnectedToSelected ? '#a7f3d0' : '#64748b'}
                      fontSize="9"
                      textAnchor="middle"
                      className="select-none font-mono"
                    >
                      {edge.relation}
                    </text>
                  )}
                </g>
              );
            })}

            {/* Nodes */}
            {nodeCoordinates.map((node) => {
              const isSelected = selectedNode?.id === node.id;
              const config = TYPE_CONFIG[node.type] || TYPE_CONFIG.theme;
              const radius = 18 + Math.min(node.mentions, 6);

              return (
                <g
                  key={node.id}
                  onClick={() => handleNodeClick(node)}
                  className="cursor-pointer group"
                  transform={`translate(${node.posX}, ${node.posY})`}
                >
                  {/* Outer pulse if selected */}
                  {isSelected && (
                    <circle
                      r={radius + 6}
                      fill="none"
                      stroke={config.fill}
                      strokeWidth="1.5"
                      strokeOpacity="0.6"
                      className="animate-pulse"
                    />
                  )}

                  {/* Main Node Circle */}
                  <circle
                    id={`life-graph-node-circle-${node.id}`}
                    r={radius}
                    fill="#0d1527"
                    stroke={isSelected ? '#ffffff' : config.fill}
                    strokeWidth={isSelected ? 2.5 : 2}
                    className="transition-all duration-200 group-hover:stroke-white group-hover:scale-105"
                  />

                  {/* Reflection count inside Circle */}
                  <text
                    y="4"
                    fill={isSelected ? '#ffffff' : '#f1f5f9'}
                    fontSize="11"
                    fontWeight="700"
                    textAnchor="middle"
                    className="select-none pointer-events-none font-mono"
                  >
                    {node.mentions}
                  </text>

                  {/* Node Label & Category Badge positioned cleanly below the circle to eliminate overlay */}
                  <g transform={`translate(0, ${radius + 13})`} className="pointer-events-none select-none">
                    <rect
                      x={-Math.min(Math.max(node.label.length * 3.6, 36), 72)}
                      y={-9}
                      width={Math.min(Math.max(node.label.length * 7.2, 72), 144)}
                      height={24}
                      rx={5}
                      fill="#090b10"
                      fillOpacity="0.88"
                      stroke="rgba(255, 255, 255, 0.12)"
                      strokeWidth="1"
                    />
                    {/* Node Label Text */}
                    <text
                      y="2"
                      fill="#f8fafc"
                      fontSize="10"
                      fontWeight={isSelected ? '700' : '600'}
                      textAnchor="middle"
                    >
                      {node.label.length > 20 ? node.label.slice(0, 18) + '…' : node.label}
                    </text>

                    {/* Category Label */}
                    <text
                      y="11"
                      fill={config.fill}
                      fontSize="8"
                      fontWeight="600"
                      textAnchor="middle"
                      className="font-mono tracking-wider uppercase"
                    >
                      {config.label}
                    </text>
                  </g>
                </g>
              );
            })}
          </svg>
        </div>

        <p className="text-[11px] text-slate-500 text-center pt-2">
          Click any node to inspect recurring triggers, emotional links, and supporting evidence.
        </p>
      </div>

      {/* Right: Node Detail Panel */}
      <div className="w-full lg:w-80 border-t lg:border-t-0 lg:border-l border-white/10 bg-white/[0.015] p-5 flex flex-col justify-between space-y-4">
        {selectedNode ? (
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span
                  className={`inline-flex items-center space-x-1 text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full border ${
                    TYPE_CONFIG[selectedNode.type]?.color || 'bg-white/10 text-white'
                  }`}
                >
                  <span>{TYPE_CONFIG[selectedNode.type]?.label || selectedNode.type}</span>
                </span>
                <h4 className="text-base font-bold text-white mt-1.5">{selectedNode.label}</h4>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-slate-400 uppercase font-mono">Confidence</span>
                <p className="text-xs font-bold text-emerald-400">{selectedNode.confidence}%</p>
              </div>
            </div>

            {/* Common Triggers */}
            {selectedNode.commonTriggers && selectedNode.commonTriggers.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-[11px] font-semibold text-slate-400 flex items-center space-x-1">
                  <Flame className="w-3 h-3 text-amber-400" />
                  <span>Observed Triggers:</span>
                </span>
                <div className="flex flex-wrap gap-1">
                  {selectedNode.commonTriggers.map((trig, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-slate-300"
                    >
                      {trig}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Associated Emotions */}
            {selectedNode.associatedEmotions && selectedNode.associatedEmotions.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-[11px] font-semibold text-slate-400 flex items-center space-x-1">
                  <Compass className="w-3 h-3 text-emerald-400" />
                  <span>Associated Emotional States:</span>
                </span>
                <div className="flex flex-wrap gap-1">
                  {selectedNode.associatedEmotions.map((emo, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300"
                    >
                      {emo}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Chronological Evolution Timeline */}
            {selectedNode.timeline && selectedNode.timeline.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-white/10">
                <span className="text-[11px] font-semibold text-slate-400 flex items-center space-x-1">
                  <Clock className="w-3 h-3 text-blue-400" />
                  <span>Timeline Evolution:</span>
                </span>
                <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                  {selectedNode.timeline.map((item, idx) => (
                    <div key={idx} className="text-xs bg-white/[0.03] p-2.5 rounded-xl border border-white/5 space-y-0.5">
                      <span className="text-[10px] text-slate-500 font-mono">
                        {new Date(item.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </span>
                      <p className="text-[11px] text-slate-300 leading-relaxed">{item.note}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="py-12 text-center text-xs text-slate-400">
            Select a node in the graph to inspect evidence and associations.
          </div>
        )}

        <div className="pt-3 border-t border-white/10 text-[11px] text-slate-400 flex items-center justify-between">
          <span>{nodes.length} mapped nodes</span>
          <span className="font-mono text-emerald-400">{edges.length} connections</span>
        </div>
      </div>
    </div>
  );
};
