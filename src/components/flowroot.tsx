"use client"
import { ReactFlow, Controls, Background, Edge, applyNodeChanges, applyEdgeChanges, addEdge, useNodesState, useEdgesState } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useCallback, useState } from 'react';
import { nodeTypes } from './nodes/nodeTypes';


function Flow() {

    const [nodes, setNodes, onNodesChange] = useNodesState([{
        id: '1',
        type: 'input',
        data: { label: 'Node 1' },
        position: { x: 0, y: 0 }
    },
    {
        id:'2',
        type:'SourceSinkConnector',
        data:{
            label:'Source'
        },
        position:{
            x:10,
            y:10
        }
    }
]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);

    
    
    const onConnect = useCallback(
      (connection: any) => setEdges((eds) => addEdge(connection, eds)),
      [setEdges],
    );
    return (
        <div style={{ height: '100%', width: '90%', maxWidth: '100%', border: '1px solid red' }}> 
            
            <ReactFlow nodes={nodes} edges={edges} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} onConnect={onConnect} nodeTypes={nodeTypes}>
                <Background />
                <Controls />
            </ReactFlow>
        </div>
    );
}

export default Flow;