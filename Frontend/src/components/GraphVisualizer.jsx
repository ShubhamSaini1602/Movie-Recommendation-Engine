import { useMemo } from 'react';
import ReactFlow, { Background, Controls, MarkerType } from 'reactflow';
import 'reactflow/dist/style.css';

export default function GraphVisualizer({ rawData }) {
  const pathData = rawData && rawData[0]?.pathNodes ? rawData[0] : null;

  const { nodes, edges } = useMemo(() => {
    if (!pathData) return { nodes: [], edges: [] };

    const flowNodes = [];
    const flowEdges = [];

    const colorMap = {
      Movie: { bg: '#1e3a8a', border: '#3b82f6', shadow: 'rgba(59, 130, 246, 0.5)' },
      Actor: { bg: '#4c1d95', border: '#8b5cf6', shadow: 'rgba(139, 92, 246, 0.5)' },
      Director: { bg: '#064e3b', border: '#10b981', shadow: 'rgba(16, 185, 129, 0.5)' },
      Genre: { bg: '#7f1d1d', border: '#ef4444', shadow: 'rgba(239, 68, 68, 0.5)' },
      Default: { bg: '#334155', border: '#94a3b8', shadow: 'rgba(148, 163, 184, 0.5)' }
    };

    pathData.pathNodes.forEach((node, index) => {
      const labelType = node.labels[0];
      const colors = colorMap[labelType] || colorMap.Default;

      flowNodes.push({
        id: `node-${index}`,
        data: { 
          label: (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '1px', color: '#cbd5e1', marginBottom: '4px' }}>
                {labelType}
              </span>
              <strong style={{ fontSize: '0.9rem', color: 'white' }}>
                {node.name}
              </strong>
              {node.year && <span style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '2px' }}>{node.year}</span>}
            </div>
          ) 
        },
        position: { x: index * 250, y: 100 },
        style: {
          background: colors.bg,
          border: `2px solid ${colors.border}`,
          borderRadius: '12px',
          padding: '10px 15px',
          boxShadow: `0 0 15px ${colors.shadow}`,
          color: 'white',
          minWidth: '150px',
        }
      });
    });

    pathData.pathRels.forEach((rel, index) => {
      flowEdges.push({
        id: `edge-${index}`,
        source: `node-${index}`,
        target: `node-${index + 1}`,
        label: rel,
        animated: true,
        labelStyle: { fill: '#94a3b8', fontWeight: 'bold', fontSize: 12 },
        labelBgStyle: { fill: '#0f172a', fillOpacity: 0.8 },
        style: { stroke: '#3b82f6', strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#3b82f6' },
      });
    });

    return { nodes: flowNodes, edges: flowEdges };
  }, [pathData]);

  if (!pathData) return null;

  return (
    <div className="graph-container">
      <ReactFlow 
        nodes={nodes} 
        edges={edges} 
        fitView
        attributionPosition="bottom-right"
      >
        <Background color="#334155" gap={20} size={1} />
        <Controls style={{ button: { backgroundColor: '#1e293b', border: '1px solid #334155', fill: '#94a3b8' } }} />
      </ReactFlow>
    </div>
  );
}