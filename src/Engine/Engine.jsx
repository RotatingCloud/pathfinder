import React, { Component } from "react";
import Node from "./Node/Node";

import { dijkstra, getNodesInShortestPathOrder } from "../Algorithms/dijkstra";
import { aStar } from "../Algorithms/astar";

import "./Engine.css";


export default class Engine extends Component {
  
  constructor() {
    
    super();

    this.state = {
      grid: [],
      destinationNodes: [],
      isAnimating: false,
    };

    this.clearGrid = this.clearGrid.bind(this);
    this.addDestinationNode = this.addDestinationNode.bind(this);
    this.handleMouseDown = this.handleMouseDown.bind(this);
    this.handleMouseEnter = this.handleMouseEnter.bind(this);
  }

  addDestinationNode = (row, col) => {
    const { grid, destinationNodes, isAnimating } = this.state;
    const newGrid = grid.slice();
    const node = newGrid[row][col];

    if (isAnimating) {
      return;
    }
  
    console.log("Clicked node:", node);
  
    // Check if the node is already selected
    if (node.isSelected) {
      console.log("Node is already selected, deselecting it...");
      node.color = "destination";
      node.isSelected = false;
      node.isDestination = false; // Reset isDestination when deselecting node
      const nodeIndex = destinationNodes.findIndex(
        (n) => n.row === row && n.col === col
      );
      if (nodeIndex !== -1) {
        // Remove the node from the destinationNodes array
        destinationNodes.splice(nodeIndex, 1);
      }
    } else {
      console.log("Node is not selected, selecting it...");
  
      // Check if there are already two destination nodes selected
      const selectedNodes = newGrid
        .flat()
        .filter((node) => node.color === "node-destination" && node.isSelected);
      if (selectedNodes.length === 2) {
        // Deselect the oldest selected node
        const oldestNode = selectedNodes.reduce((prev, curr) =>
          prev.isSelectedAt < curr.isSelectedAt ? prev : curr
        );
        oldestNode.color = "destination";
        oldestNode.isSelected = false;
        oldestNode.isDestination = false; // Reset isDestination when deselecting node
        const nodeIndex = destinationNodes.findIndex(
          (n) => n.row === oldestNode.row && n.col === oldestNode.col
        );
        if (nodeIndex !== -1) {
          // Remove the node from the destinationNodes array
          destinationNodes.splice(nodeIndex, 1);
        }
      }
  
      // Select the new destination node
      node.color = "node-destination";
      node.isSelected = true;
      node.isSelectedAt = Date.now();
      node.isDestination = true;
      node.className = node.isSelected ? "node node-destination" : "node destination";
      destinationNodes.push(node);
    }
  
    this.setState({ grid: newGrid, destinationNodes });
  
    console.log("Destination nodes:");
    destinationNodes.forEach((node) => {
      console.log(`(${node.row}, ${node.col})`);
    });
  };
  

  componentDidMount() {

    const grid = getInitialGrid();
    this.setState({ grid });
    document.addEventListener("keydown", this.handleKeyDown);
    document.addEventListener("keyup", this.handleKeyUp);
  }

  componentWillUnmount() {
    document.removeEventListener("keydown", this.handleKeyDown);
    document.removeEventListener("keyup", this.handleKeyUp);
  }
  
  handleMouseDown = (row, col, e) => {

    if (this.state.isAnimating) {
      // If animation is running, do nothing
      return;
    }

    if (!this.state.shiftKeyPressed) {
      this.addDestinationNode(row, col);
    } else {
      const newGrid = getNewGridWithWallToggled(this.state.grid, row, col, e);
      this.setState({ grid: newGrid, mouseIsPressed: true });
    }
  };

  handleMouseEnter(row, col, e) {
    if (this.state.isAnimating || !this.state.mouseIsPressed || !this.state.shiftKeyPressed) {return;}
    const newGrid = getNewGridWithWallToggled(this.state.grid, row, col, e);
    this.setState({ grid: newGrid });
  }

  handleMouseUp() {
    this.setState({ mouseIsPressed: false });
  }

  handleMouseLeave(row, col) {
    if (!this.state.mouseIsPressed) return;
    this.setState({ mouseIsPressed: false });
  }

  handleKeyDown = (e) => {
    if (e.key === "Shift") {
      this.setState({ shiftKeyPressed: true });
    }
  };

  handleKeyUp = (e) => {
    if (e.key === "Shift") {
      this.setState({ shiftKeyPressed: false });
    }
  };

  animatePathfinding(visitedNodesInOrderList, nodesInShortestPathOrder) {
    this.setState({ isAnimating: true });
  
    for (let i = 0; i <= visitedNodesInOrderList.length; i++) {
      if (i === visitedNodesInOrderList.length) {
        setTimeout(() => {
          this.animateShortestPath(nodesInShortestPathOrder);
          this.setState({ isAnimating: false });
        }, 10 * i);
  
        return;
      }
  
      setTimeout(() => {
        const node = visitedNodesInOrderList[i];
        const element = document.getElementById(`node-${node.row}-${node.col}`);
  
        if (
          element.className !== "node node-start" &&
          element.className !== "node node-finish"
        ) {
          document.getElementById(`node-${node.row}-${node.col}`).className =
            "node node-visited";
        }
      }, 10 * i);
    }
  }
  
  animateShortestPath(nodesInShortestPathOrder) {

    for (let i = 0; i < nodesInShortestPathOrder.length; i++) {
      setTimeout(() => {
        const node = nodesInShortestPathOrder[i];
        const element = document.getElementById(`node-${node.row}-${node.col}`);
  
        if (
          element.className !== "node node-start" &&
          element.className !== "node node-finish"
        ) {
          document.getElementById(`node-${node.row}-${node.col}`).className =
            "node node-shortest-path";
        }
      }, 20 * i);
    }
  
    this.setState({ isAnimating: false });
  }

  isEmpty() {

    const { grid } = this.state;

    for (let row = 0; row < grid.length; row++) {

      for (let col = 0; col < grid[0].length; col++) {

        const node = grid[row][col];

        console.log(`Node at row ${row} col ${col} has class ${node.className}`);

        if (node.className !== "node" || node.className !== null) {

          console.log("Node is not empty!");
          return false;
        }
      }
    }

    console.log("Grid is empty!");
    return true;
  }

  isDestination(node) {
    return node.className === "node node-destination";
  }

  visualizeDijkstra() {

    console.log("Starting visualizeDijkstra()...");
    const { grid, destinationNodes } = this.state;

    if(this.isEmpty()) {
  
        alert("Please add some walls to the grid!");
    }


    if(destinationNodes.length !== 2) {

      alert("Please select two destination nodes!");
      return;

    }
    
    const startNode = grid[destinationNodes[0].row][destinationNodes[0].col];
    const finishNode = grid[destinationNodes[1].row][destinationNodes[1].col];
    const visitedNodesInOrder = dijkstra(grid, startNode, finishNode);
    const nodesInShortestPathOrder = getNodesInShortestPathOrder(finishNode);
    this.animatePathfinding(visitedNodesInOrder, nodesInShortestPathOrder);
    this.setState({ isAnimating: true });
  }

  visualizeAStar() {

    console.log("Starting visualizeAStar()...");
    const { grid, destinationNodes } = this.state;

    if(this.isEmpty()) {
  
        alert("Please add some walls to the grid!");
    }


    if(destinationNodes.length !== 2) {

      alert("Please select two destination nodes!");
      return;

    }
    
    const startNode = grid[destinationNodes[0].row][destinationNodes[0].col];
    const finishNode = grid[destinationNodes[1].row][destinationNodes[1].col];
    const visitedNodesInOrder = aStar(grid, startNode, finishNode);
    const nodesInShortestPathOrder = getNodesInShortestPathOrder(finishNode);
    this.animatePathfinding(visitedNodesInOrder, nodesInShortestPathOrder);
    this.setState({ isAnimating: true });
  }

  clearGrid = () => {
    console.log("Clearing grid...");
    
    // Reset the grid
    const newGrid = getInitialGrid();
  
    this.setState({ grid: newGrid }, () => {
      const nodes = document.getElementsByClassName("node");
  
      for (let i = 0; i < nodes.length; i++) {
        const nodeClassName = nodes[i].className;
        console.log("Node class name:", nodeClassName);
  
        if (
          nodeClassName !== "node node-destination"
        ) {
          nodes[i].className = "node"; // Reset the className of each Node
          nodes[i].setAttribute("key", `${nodes[i].id}`); // Update the key prop value of each Node
          console.log("Node reset.");
        } else {
          console.log("Node is Start or Finish");
          continue;
        }
      }
  
      this.setState({ destinationNodes: [] });
      console.log("Destination nodes cleared.");
    });
  };

  clearGridExceptDestinations = () => {
    
    // Reset the grid
    const newGrid = getInitialGrid();

    this.setState({ grid: newGrid }, () => {
      const nodes = document.getElementsByClassName("node");

      for (let i = 0; i < nodes.length; i++) {

        const nodeClassName = nodes[i].className;

        if (nodeClassName === "node node-destination") {

          nodes[i].className = "node"; // Reset the className of each Node
          nodes[i].setAttribute("key", `${nodes[i].id}`); // Update the key prop value of each Node

        } else {

          console.log("Node is Start or Finish");
          continue;

        }
      }

      this.setState({ destinationNodes: [] });
    });
  };

  updateGrid = () => {
    const { grid, startNodeRow, startNodeCol, finishNodeRow, finishNodeCol } =
      this.state;
    const newGrid = grid.slice(); // Create a copy of the grid array

    // Remove the old start/finish nodes
    const oldStartNode = grid.find((row) => row.find((node) => node.isStart));
    const oldFinishNode = grid.find((row) => row.find((node) => node.isFinish));

    if (oldStartNode) {
      oldStartNode[
        oldStartNode.findIndex((node) => node.isStart)
      ].isStart = false;
    }

    if (oldFinishNode) {
      oldFinishNode[
        oldFinishNode.findIndex((node) => node.isFinish)
      ].isFinish = false;
    }

    // Update the start and finish nodes in the newGrid array
    newGrid[startNodeRow][startNodeCol].isStart = true;
    newGrid[startNodeRow][startNodeCol].color = "start";
    newGrid[finishNodeRow][finishNodeCol].isFinish = true;
    newGrid[finishNodeRow][finishNodeCol].color = "finish";

    // Update the state with the new grid array
    this.setState({ grid: newGrid });
  };

  render() {
    const { grid } = this.state;

    return (
      <>
        <div id="header">

        <div id="directions">
            <h3>Directions:</h3>
            click on a node to make it a destination node <br />
            hold shift and drag to make a wall <br />
            press the go button to visualize the path <br />
            press the reset button to clear the grid <br />
        </div>

        <div id="destination-node-display">
            <h3>Destination Nodes:</h3>
            {grid.map((row, rowIdx) => {
              return (
                <div key={rowIdx}>
                  {row
                    .filter((node) => node.color === "node-destination")
                    .map((node, nodeIdx) => (
                      <span key={nodeIdx}>
                        ({node.row}, {node.col})
                      </span>
                    ))}
                </div>
              );
            })}
        </div>
        </div>
        <div className="grid">
          {grid.map((row, rowIdx) => {
            return (
              <div key={rowIdx}>
                {row.map((node, nodeIdx) => {
                  const {
                    row,
                    col,
                    isDestination,
                    isWall,
                    isVisited,
                    distance,
                    heuristic,
                  } = node;
                  return (
                    <Node
                      key={`${row}-${col}`}
                      col={col}
                      isDestination={isDestination}
                      isWall={isWall}
                      row={row}
                      isVisited={isVisited}
                      distance={distance}
                      heuristic={heuristic}
                      isAnimating={this.state.isAnimating}
                      onMouseDown={(e) => this.handleMouseDown(row, col, e)}
                      onMouseEnter={(e) => this.handleMouseEnter(row, col, e)}
                      onMouseUp={() => this.handleMouseUp()}
                    ></Node>
                  );
                })}
              </div>
            );
          })}

          <div id="buttons">
            <button onClick={() => this.visualizeDijkstra()} disabled={this.state.isAnimating}>D I J K S T R A</button>
            <button onClick={() => this.visualizeAStar()} disabled={this.state.isAnimating}>A S T A R</button>
            <button onClick={() => this.clearGrid()} disabled={this.state.isAnimating}>R E S E T</button>
          </div>
        </div>
      </>
    );
  }
}

const getInitialGrid = () => {
  const grid = [];
  for (let row = 0; row < 20; row++) {
    const currentRow = [];
    for (let col = 0; col < 50; col++) {
      currentRow.push(createNode(col, row));
    }
    grid.push(currentRow);
  }
  return grid;
};

const createNode = (col, row, isStart, isDestination, color, isSelected) => {
  return {
    col,
    row,
    isStart,
    isDestination,
    distance: Infinity,
    isVisited: false,
    isWall: false,
    previousNode: null,
    heuristic: Infinity,
    color,
    isSelected,
  };
};

const getNewGridWithWallToggled = (grid, row, col) => {
  const newGrid = grid.slice();
  const node = newGrid[row][col];

  const newNode = {
    ...node,
    isWall: !node.isWall,
  };
  newGrid[row][col] = newNode;

  return newGrid;
};
