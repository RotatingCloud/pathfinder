function manhattanDistance(nodeA, nodeB) {

    return Math.abs(nodeA.row - nodeB.row) + Math.abs(nodeA.col - nodeB.col);
  }
  
export function aStar(grid, start, finish) {
    
    const visitedNodesInOrder = [];
    start.distance = 0;
    start.heuristic = manhattanDistance(start, finish);
    const unvisitedNodes = getAllNodes(grid);
  
    console.log('Grid:', grid);
    console.log('Start node:', start);
    console.log('Finish node:', finish);
  
    while (unvisitedNodes.length) {
      sortNodesByHeuristic(unvisitedNodes);
  
      const closestNode = unvisitedNodes.shift();
  
      if (closestNode.isWall) continue;
  
      if (closestNode.distance === Infinity) {
        console.log('Visited nodes in order (trapped):', visitedNodesInOrder);
        return visitedNodesInOrder;
      }
  
      closestNode.isVisited = true;
      visitedNodesInOrder.push(closestNode);
  
      if (closestNode === finish) {
        console.log('Visited nodes in order (path found):', visitedNodesInOrder);
        return visitedNodesInOrder;
      }
  
      updateUnvisitedNeighbors(closestNode, grid, finish);
    }
}
  
function sortNodesByHeuristic(unvisitedNodes) {

    unvisitedNodes.sort(
      (nodeA, nodeB) =>
        nodeA.distance + nodeA.heuristic - (nodeB.distance + nodeB.heuristic)
    );
}
  
function updateUnvisitedNeighbors(node, grid, finish) {

    const unvisitedNeighbors = getUnvisitedNeighbors(node, grid);
  
    for (const neighbor of unvisitedNeighbors) {
      const tentativeDistance = node.distance + 1;
  
      if (tentativeDistance < neighbor.distance) {
        neighbor.distance = tentativeDistance;
        neighbor.heuristic = manhattanDistance(neighbor, finish);
        neighbor.previousNode = node;
      }
    }
}

export function getNodesInShortestPathOrder(finishNode) {

    const nodesInShortestPathOrder = [];

    let currentNode = finishNode;

    while (currentNode !== null) {

      nodesInShortestPathOrder.unshift(currentNode);
      currentNode = currentNode.previousNode;

    }

    return nodesInShortestPathOrder;
}

function getAllNodes(grid) {

    const nodes = [];
    for(const row of grid) {

        for(const node of row) {

            nodes.push(node);
        }
    }

    return nodes;
}

function getUnvisitedNeighbors(node, grid) {

    const neighbors = [];
    const {col, row} = node;

    if (row > 0) 

        neighbors.push(grid[row - 1][col]);

    if (row < grid.length - 1) 
    
        neighbors.push(grid[row + 1][col]);

    if (col > 0) 

        neighbors.push(grid[row][col - 1]);

    if (col < grid[0].length - 1) 

        neighbors.push(grid[row][col + 1]);

    return neighbors.filter(neighbor => !neighbor.isVisited);

}