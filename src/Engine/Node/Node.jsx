import React, {Component} from 'react';

import './Node.css';

export default class Node extends Component {

    constructor(props) {

        super(props); 
        this.state = {};
    }

    render() {

        const {

            col,
            isDestination,
            isWall,
            onMouseDown,
            onMouseEnter,
            onMouseUp,
            row,
            isVisited, // Add isVisited here
            distance, // Add distance here
        
        } = this.props;

        const extraClassName =

            isDestination ? "node-destination" : isWall ? "node-wall" : "";

            return <div id={
            
            `node-${row}-${col}`}
            className={`node ${extraClassName}`}
            onMouseDown={(e) => onMouseDown(row, col, e)}
            onMouseEnter={(e) => onMouseEnter(row, col, e)}
            onMouseUp={() => onMouseUp()}>
                

            {isVisited && distance !== Infinity && (
                <span className="node-distance">{distance}</span>
            )}

        </div>;
    }
}