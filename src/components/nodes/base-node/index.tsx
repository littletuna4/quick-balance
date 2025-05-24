import { Connection, useReactFlow ,      NodeTypes, useConnection} from "@xyflow/react";


class BaseNodeHandler {
    nodeId: string;
    reactFlowInstance: ReturnType<typeof useReactFlow>;
    updateNodeData: (nodeId: string, newData: any) => void;
    const con = useConnection()

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
    
    onNodeDrag(event: React.MouseEvent, node: NodeType) {
      // Handle drag events - v12 provides node position
      this.updateNodeData(this.nodeId, {
        isDragging: true,
        position: node.position
      });
    }
    
    onNodeDragStop(event: React.MouseEvent, node: NodeType) {
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