import { Handle, Position, useConnection, Node } from "@xyflow/react";
import { randomUUID } from "crypto";

type SourceSinkNodeProps = {
    type: 'source' | 'sink' | 'connector';
    connections: {
        id: string;
        type: 'out' | 'in';
    }[]
}

const SourceSinkConnectorNode = ({
    data,
}) => {
    const con = useConnection()
    return (
        <>
            <Handle type="source" position={Position.Top} />
        <div className="flex flex-col items-center justify-center">
            {data.id}
            {con.inProgress ? 'Connecting...' : 'Connect'}
        </div>
        </>
    )
}

export default SourceSinkConnectorNode;