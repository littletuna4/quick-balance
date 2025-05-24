'use client'
import React, { useState, useCallback, useMemo, useContext, createContext } from 'react';
import { 
  ReactFlow, 
  Handle, 
  Position, 
  useNodesState, 
  useEdgesState,
  addEdge,
  useReactFlow,
  ReactFlowProvider
} from '@xyflow/react';
import type { Node, Edge, Connection, OnConnect, OnNodesChange, OnEdgesChange } from '@xyflow/react';

// ===== REACT FLOW V12 SPECIFIC PATTERNS =====

// Base handler compatible with React Flow v12
class BaseNodeHandler {
  nodeId: string;
  reactFlowInstance: ReturnType<typeof useReactFlow>;
  updateNodeData: (nodeId: string, newData: any) => void;

  constructor(nodeId: string, reactFlowInstance: ReturnType<typeof useReactFlow>, updateNodeData: (nodeId: string, newData: any) => void) {
    this.nodeId = nodeId;
    this.reactFlowInstance = reactFlowInstance;
    this.updateNodeData = updateNodeData;
  }
  
  // Default implementations using v12 APIs
  onConnect(params: Connection) {
    console.log(`Node ${this.nodeId} connected:`, params);
    
    // Update node data using v12 pattern
    this.updateNodeData(this.nodeId, {
      lastAction: 'connect',
      connectionParams: params,
      timestamp: Date.now()
    });
    
    // Access React Flow instance methods (v12)
    const { getNode, getNodes, getEdges } = this.reactFlowInstance;
    const currentNode = getNode(this.nodeId);
    
    console.log(`Node ${this.nodeId} current state:`, currentNode);
  }
  
  onConnectStart(event: React.MouseEvent, params: Connection) {
    console.log(`Connection started from ${this.nodeId}:`, params);
    this.updateNodeData(this.nodeId, {
      connectionInProgress: true,
      sourceHandle: params.sourceHandle
    });
  }
  
  onConnectEnd(event: React.MouseEvent) {
    console.log(`Connection ended for ${this.nodeId}`);
    this.updateNodeData(this.nodeId, {
      connectionInProgress: false,
      sourceHandle: null
    });
  }
  
  onNodeClick(event: React.MouseEvent) {
    console.log(`Node ${this.nodeId} clicked`);
    this.updateNodeData(this.nodeId, {
      selected: true,
      lastClicked: Date.now()
    });
  }
  
  onNodeDoubleClick(event: React.MouseEvent) {
    console.log(`Node ${this.nodeId} double clicked`);
    this.updateNodeData(this.nodeId, {
      editing: true
    });
  }
  
  onNodeDrag(event: React.MouseEvent, node: Node) {
    // Handle drag events - v12 provides node position
    this.updateNodeData(this.nodeId, {
      isDragging: true,
      position: node.position
    });
  }
  
  onNodeDragStop(event: React.MouseEvent, node: Node) {
    this.updateNodeData(this.nodeId, {
      isDragging: false,
      finalPosition: node.position
    });
  }
  
  validate() {
    const { getNode } = this.reactFlowInstance;
    const node = getNode(this.nodeId);
    return node !== undefined;
  }
}

// Specialized handler for React Flow v12
class ProcessingNodeHandler extends BaseNodeHandler {
  onConnect(params: Connection) {
    console.log(`Processing node ${this.nodeId} processing connection`);
    
    // Call parent default
    super.onConnect(params);
    
    // Custom processing logic
    this.processConnection(params);
  }
  
  processConnection(params: Connection) {
    // Use React Flow v12 APIs
    const { getEdges, getNode } = this.reactFlowInstance;
    const sourceNode = getNode(params.source);
    
    this.updateNodeData(this.nodeId, {
      processing: true,
      sourceType: sourceNode?.type,
      inputHandle: params.targetHandle
    });
    
    // Simulate processing
    setTimeout(() => {
      this.updateNodeData(this.nodeId, {
        processing: false,
        result: `Processed input from ${params.source}`,
        status: 'complete'
      });
    }, 1500);
  }
  
  validate() {
    const { getEdges } = this.reactFlowInstance;
    const incomingEdges = getEdges().filter(edge => edge.target === this.nodeId);
    return incomingEdges.length > 0;
  }
}

// ===== REACT FLOW V12 CONTEXT INTEGRATION =====

interface FlowContextType {
  updateNodeData: (nodeId: string, newData: any) => void;
  nodes: Node[];
  edges: Edge[];
}

const FlowContext = createContext<FlowContextType | undefined>(undefined);

// Hook for React Flow v12 integration
function useNodeHandler(nodeId: string, HandlerClass: typeof BaseNodeHandler = BaseNodeHandler) {
  const reactFlowInstance = useReactFlow();
  const context = useContext(FlowContext);
  if (!context) throw new Error('FlowContext not found');
  const { updateNodeData } = context;
  return useMemo(() => {
    return new HandlerClass(nodeId, reactFlowInstance, updateNodeData);
  }, [nodeId, HandlerClass, reactFlowInstance, updateNodeData]);
}

// ===== REACT FLOW V12 COMPONENTS =====

const ProcessingNode = ({ id, data, selected }: { id: string; data: any; selected?: boolean }) => {
  const handler = useNodeHandler(id, ProcessingNodeHandler);
  const handleConnect = useCallback((params: Connection) => {
    handler.onConnect(params);
  }, [handler]);
  const handleClick = useCallback((event: React.MouseEvent) => {
    handler.onNodeClick(event);
  }, [handler]);
  const handleDoubleClick = useCallback((event: React.MouseEvent) => {
    handler.onNodeDoubleClick(event);
  }, [handler]);
  return (
    <div 
      className={`px-4 py-3 shadow-lg rounded-lg border-2 transition-all ${
        selected ? 'border-blue-500 bg-blue-50' : 'border-gray-400 bg-white'
      } ${data.processing ? 'animate-pulse' : ''}`}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
    >
      {/* Input handles (left, top) */}
      <Handle
        id="left"
        type="target"
        position={Position.Left}
        onConnect={handleConnect}
        className="w-3 h-3 bg-blue-500"
        isConnectable={!data.processing}
      />
      <Handle
        id="top"
        type="target"
        position={Position.Top}
        onConnect={handleConnect}
        className="w-3 h-3 bg-blue-400"
        isConnectable={!data.processing}
      />
      <div className="text-sm font-bold mb-1">{data.label}</div>
      <div className="text-xs text-gray-600 space-y-1">
        <div className="flex justify-between">
          <span>Status:</span>
          <span className={`font-semibold ${
            data.processing ? 'text-yellow-600' : 
            data.status === 'complete' ? 'text-green-600' : 'text-gray-500'
          }`}>
            {data.processing ? 'Processing...' : data.status || 'idle'}
          </span>
        </div>
        {data.result && (
          <div className="text-green-600 text-xs mt-1 p-1 bg-green-50 rounded">
            {data.result}
          </div>
        )}
        {data.connectionInProgress && (
          <div className="text-blue-600 font-semibold">
            Connection in progress...
          </div>
        )}
      </div>
      {/* Output handles (right, bottom) */}
      <Handle
        id="right"
        type="source"
        position={Position.Right}
        className="w-3 h-3 bg-red-500"
        isConnectable={data.status === 'complete'}
      />
      <Handle
        id="bottom"
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 bg-red-400"
        isConnectable={data.status === 'complete'}
      />
    </div>
  );
};

const DataSourceNode = ({ id, data }: { id: string; data: any }) => {
  const handler = useNodeHandler(id);
  return (
    <div className="px-4 py-3 shadow-md rounded-lg border-2 border-green-400 bg-green-50">
      <div className="text-sm font-bold mb-1">{data.label}</div>
      <div className="text-xs text-gray-600">
        Ready to provide data
      </div>
      {/* Output handles (right, bottom) */}
      <Handle
        id="right"
        type="source"
        position={Position.Right}
        className="w-3 h-3 bg-green-500"
      />
      <Handle
        id="bottom"
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 bg-green-400"
      />
    </div>
  );
};

// ===== MAIN REACT FLOW V12 COMPONENT =====

const FlowWithV12Handlers = () => {
  // React Flow v12 state management hooks
  const [nodes, setNodes, onNodesChange] = useNodesState([
    {
      id: 'source-1',
      type: 'dataSource',
      position: { x: 50, y: 100 },
      data: { label: 'Data Source' }
    },
    {
      id: 'process-1',
      type: 'processing',
      position: { x: 300, y: 100 },
      data: { label: 'Processor 1', status: 'idle' }
    },
    {
      id: 'process-2',
      type: 'processing',
      position: { x: 550, y: 100 },
      data: { label: 'Processor 2', status: 'idle' }
    }
  ]);
  
  const [edges, setEdges, onEdgesChange] = useEdgesState([
    {
      id: 'source-1-right-process-1-left',
      source: 'source-1',
      sourceHandle: 'right',
      target: 'process-1',
      targetHandle: 'left',
      type: 'smoothstep',
      animated: true
    }
  ] as Edge[]);
  
  // Function to update node data (v12 pattern)
  const updateNodeData = useCallback((nodeId: string, newData: any) => {
    setNodes(nds => 
      nds.map(node => 
        node.id === nodeId 
          ? { ...node, data: { ...node.data, ...newData } }
          : node
      )
    );
  }, [setNodes]);
  
  // Handle new connections (v12)
  const onConnect = useCallback((params: Connection) => {
    const newEdge: Edge = {
      ...params,
      id: `${params.source}-${params.sourceHandle || 'default'}-${params.target}-${params.targetHandle || 'default'}`,
      type: 'smoothstep',
      animated: true
    } as Edge;
    setEdges(eds => addEdge(newEdge, eds));
  }, [setEdges]);
  
  // Node types for v12
  const nodeTypes = useMemo(() => ({
    processing: ProcessingNode,
    dataSource: DataSourceNode
  }), []);
  
  // Context value
  const contextValue = useMemo(() => ({
    updateNodeData,
    nodes,
    edges
  }), [updateNodeData, nodes, edges]);
  
  return (
    <FlowContext.Provider value={contextValue}>
      <div className="w-full h-96 bg-gray-50 border rounded-lg">
        <div className="p-4 bg-white border-b">
          <h3 className="font-bold text-lg mb-2">React Flow v12 with Node Handlers</h3>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <strong>Nodes:</strong> {nodes.length}
            </div>
            <div>
              <strong>Edges:</strong> {edges.length}
            </div>
            <div>
              <strong>Processing:</strong> {nodes.filter(n => n.data && 'processing' in n.data && n.data.processing).length}
            </div>
          </div>
        </div>
        
        <div className="h-80">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            fitView
            className="bg-blue-50"
          >
            {/* React Flow v12 supports additional components */}
          </ReactFlow>
        </div>
        
        <div className="p-4 bg-gray-100 border-t">
          <p className="text-sm text-gray-600">
            <strong>Instructions:</strong> Drag from green handles to blue handles to create connections. 
            Watch the processing animations and state updates.
          </p>
        </div>
      </div>
    </FlowContext.Provider>
  );
};

// Wrapper with ReactFlowProvider (required for v12)
const App = () => {
  return (
    <ReactFlowProvider>
      <FlowWithV12Handlers />
    </ReactFlowProvider>
  );
};

export default App;