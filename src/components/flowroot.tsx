"use client"
import { ReactFlow, Controls, Background, Edge } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useState } from 'react';

function Flow() {

    const [nodes, setNodes] = useState([{
        id: '1',
        type: 'input',
        data: { label: 'Node 1' },
        position: { x: 0, y: 0 }
    }]);
    const [edges, setEdges] = useState([]);
    return (
        <div style={{ height: '100%', width: '90%', maxWidth: '100%', border: '1px solid red' }}>

            <ReactFlow nodes={nodes} edges={edges}>
                <Background />
                <Controls />
            </ReactFlow>
        </div>
    );
}

export default Flow;