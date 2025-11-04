import React, { useCallback } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
} from 'reactflow';

import 'reactflow/dist/style.css';
import { Note } from '@/lib/types';
import { useUser } from '@/context/UserContext';
import { useToast } from '@/hooks/use-toast';

interface MindMapProps {
  notes: Note[];
}

export const MindMap: React.FC<MindMapProps> = ({ notes: userNotes }) => {
  const { addXp, addCoins } = useUser();
  const { toast } = useToast();
  const [rewardedForMindMap, setRewardedForMindMap] = React.useState(false);

  React.useEffect(() => {
    if (userNotes.length > 0 && !rewardedForMindMap) {
      addXp(20);
      addCoins(10);
      setRewardedForMindMap(true);
      toast({
        title: "Mind Mapper!",
        description: "You earned 20 XP and 10 Coins for creating your first mind map.",
        variant: "success",
      });
    }
  }, [userNotes, rewardedForMindMap, addXp, addCoins, toast]);

  const initialNodes = userNotes.map((note, index) => ({
    id: note.id,
    position: { x: index * 200, y: Math.random() * 200 },
    data: { label: note.title },
  }));

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const onConnect = useCallback(
    (params: any) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  return (
    <div style={{ width: '100%', height: '500px' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
      >
        <Controls />
        <MiniMap />
        <Background variant="dots" gap={12} size={1} />
      </ReactFlow>
    </div>
  );
};
