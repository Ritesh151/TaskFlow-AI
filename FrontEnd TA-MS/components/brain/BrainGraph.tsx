'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { Expand, Orbit } from 'lucide-react';
import type { BrainGraphData, BrainGraphNode } from '@/lib/types';
import { BRAIN_CATEGORY_META } from '@/lib/brain';

const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), {
  ssr: false,
  loading: () => (
    <div className="flex h-[420px] items-center justify-center rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-400">
      Building knowledge graph...
    </div>
  ),
});

interface BrainGraphProps {
  graph: BrainGraphData | null;
  activeNoteId?: string | null;
  onOpenNote: (noteId: string) => void;
}

interface GraphHandle {
  zoomToFit: (durationMs?: number, padding?: number) => void;
  centerAt: (x?: number, y?: number, durationMs?: number) => void;
}

interface PositionedNode extends BrainGraphNode {
  x?: number;
  y?: number;
}

function graphColor(category: BrainGraphNode['category']) {
  if (category === 'task') return '#3b82f6';
  return BRAIN_CATEGORY_META[category].graph;
}

function graphNodeId(value: string | BrainGraphNode) {
  return typeof value === 'string' ? value : value.id;
}

export function BrainGraph({ graph, activeNoteId, onOpenNote }: BrainGraphProps) {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const graphRef = useRef<GraphHandle | null>(null);
  const [size, setSize] = useState({ width: 0, height: 420 });
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

  useEffect(() => {
    if (!wrapperRef.current) return;

    const element = wrapperRef.current;
    const observer = new ResizeObserver(entries => {
      const entry = entries[0];
      setSize({
        width: Math.max(280, Math.floor(entry.contentRect.width)),
        height: Math.max(360, Math.floor(entry.contentRect.height)),
      });
    });

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!graph || !graphRef.current) return;
    const timeoutId = window.setTimeout(() => {
      graphRef.current?.zoomToFit(500, 60);
    }, 240);
    return () => window.clearTimeout(timeoutId);
  }, [graph]);

  const adjacentIds = useMemo(() => {
    const map = new Map<string, Set<string>>();
    for (const link of graph?.links || []) {
      const source = String(link.source);
      const target = String(link.target);
      if (!map.has(source)) map.set(source, new Set());
      if (!map.has(target)) map.set(target, new Set());
      map.get(source)?.add(target);
      map.get(target)?.add(source);
    }
    return map;
  }, [graph]);

  const highlightedIds = useMemo(() => {
    if (!hoveredNodeId) return new Set(activeNoteId ? [`note:${activeNoteId}`] : []);
    return new Set([hoveredNodeId, ...(adjacentIds.get(hoveredNodeId) || [])]);
  }, [activeNoteId, adjacentIds, hoveredNodeId]);

  if (!graph || graph.nodes.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-gray-50 p-6 text-sm text-gray-400">
        The graph will light up as soon as your notes begin connecting.
      </div>
    );
  }

  return (
    <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-gray-400">
            <Orbit className="h-3.5 w-3.5 text-blue-500" />
            Knowledge Graph
          </div>
          <p className="mt-1 text-sm text-gray-500">
            Hover to highlight relationships. Click a note node to jump to its card.
          </p>
        </div>

        <button
          type="button"
          onClick={() => graphRef.current?.zoomToFit(500, 70)}
          className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-600 shadow-sm transition hover:bg-gray-50"
        >
          <Expand className="h-3.5 w-3.5" />
          Fit graph
        </button>
      </div>

      <div ref={wrapperRef} className="h-[420px] overflow-hidden rounded-xl border border-gray-100 bg-gray-50/80">
        {size.width > 0 && (
          <ForceGraph2D
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ref={graphRef as any}
            width={size.width}
            height={size.height}
            graphData={graph}
            cooldownTicks={90}
            warmupTicks={50}
            backgroundColor="rgba(248,250,252,0.95)"
            nodeLabel={(node: object) => {
              const item = node as BrainGraphNode;
              return `${item.label}\n${item.category}`;
            }}
            linkColor={(link: object) => {
              const item = link as { source: string | BrainGraphNode; target: string | BrainGraphNode; kind: 'note' | 'task' };
              const sourceId = graphNodeId(item.source);
              const targetId = graphNodeId(item.target);
              const active = highlightedIds.has(sourceId) && highlightedIds.has(targetId);
              return active
                ? item.kind === 'task'
                  ? 'rgba(59,130,246,0.8)'
                  : 'rgba(37,99,235,0.9)'
                : 'rgba(148,163,184,0.25)';
            }}
            linkWidth={(link: object) => {
              const item = link as { source: string | BrainGraphNode; target: string | BrainGraphNode; strength: number };
              const sourceId = graphNodeId(item.source);
              const targetId = graphNodeId(item.target);
              const active = highlightedIds.has(sourceId) && highlightedIds.has(targetId);
              return active ? Math.min(4, Math.max(1.5, item.strength / 24)) : 1;
            }}
            onNodeHover={(node: object | null) => {
              setHoveredNodeId(node ? (node as BrainGraphNode).id : null);
            }}
            onNodeClick={(node: object) => {
              const item = node as PositionedNode;
              if (item.type === 'note') {
                onOpenNote(item.entityId);
              }
              graphRef.current?.centerAt(item.x, item.y, 500);
            }}
            nodeCanvasObject={(node, ctx, globalScale) => {
              const item = node as PositionedNode;
              const active = highlightedIds.size === 0
                ? item.id === `note:${activeNoteId}`
                : highlightedIds.has(item.id);
              const color = graphColor(item.category);
              const radius = Math.max(4, item.weight * 0.55) + (active ? 4 : 0);

              ctx.save();
              ctx.beginPath();
              ctx.arc(item.x || 0, item.y || 0, radius, 0, 2 * Math.PI, false);
              ctx.fillStyle = color;
              ctx.shadowColor = color;
              ctx.shadowBlur = active ? 18 : 8;
              ctx.fill();

              if (item.pinned || item.favorite) {
                ctx.lineWidth = 2;
                ctx.strokeStyle = item.pinned ? '#f59e0b' : '#8b5cf6';
                ctx.stroke();
              }

              if (globalScale > 1.4 || active) {
                const fontSize = active ? 13 : 11;
                ctx.font = `${fontSize / globalScale}px Sans-Serif`;
                ctx.fillStyle = active ? '#1e293b' : 'rgba(71,85,105,0.8)';
                ctx.fillText(item.label, (item.x || 0) + radius + 6, (item.y || 0) + 3);
              }
              ctx.restore();
            }}
          />
        )}
      </div>
    </section>
  );
}
