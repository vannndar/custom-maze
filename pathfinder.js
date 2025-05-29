import { ANIMATION_SPEED } from './constants.js';

export class Pathfinder {

    static reconstructPath(endNode) {
        let current = endNode;
        while (current && current.previous) {
            if (!current.isStart && !current.isEnd) {
                current.isPath = true;
                current.element.classList.add('node-path');
            }
            current = current.previous;
        }
    }

    static async bfs(grid, UI) {
        const { startNode, endNode } = grid;
        const queue = [startNode];
        startNode.isVisited = true;
        let foundEnd = false;

        while (queue.length > 0 && !foundEnd && UI.isRunning) {
            const currentNode = queue.shift();

            if (currentNode === endNode) {
                foundEnd = true;
                this.reconstructPath(currentNode);
                UI.showMessage("Path found! (BFS)");
                return true;
            }

            const neighbors = grid.getNeighbors(currentNode);
            for (const neighbor of neighbors) {
                if (!neighbor.isVisited && !neighbor.isWall) {
                    neighbor.isVisited = true;
                    neighbor.previous = currentNode;
                    neighbor.element.classList.add('node-visited');
                    queue.push(neighbor);
                }
            }
            // Add a small delay for visualization
            await new Promise(resolve => setTimeout(resolve, ANIMATION_SPEED));
        }

        if (!foundEnd) {
            UI.showMessage(UI.isRunning ? "No path found! (BFS)" : "Search canceled");
            return false;
        }
    }

    static async dfs(grid, UI) {
        const { startNode, endNode } = grid;
        const stack = [startNode];
        startNode.isVisited = true;
        let foundEnd = false;

        while (stack.length > 0 && !foundEnd && UI.isRunning) {
            const currentNode = stack.pop();

            if (currentNode === endNode) {
                foundEnd = true;
                this.reconstructPath(currentNode);
                UI.showMessage("Path found! (DFS)");
                return true;
            }

            const neighbors = grid.getNeighbors(currentNode);
            for (const neighbor of neighbors) {
                if (!neighbor.isVisited && !neighbor.isWall) {
                    neighbor.isVisited = true;
                    neighbor.previous = currentNode;
                    neighbor.element.classList.add('node-visited');
                    stack.push(neighbor);
                }
            }
            // Add a small delay for visualization
            await new Promise(resolve => setTimeout(resolve, ANIMATION_SPEED));
        }

        if (!foundEnd) {
            UI.showMessage(UI.isRunning ? "No path found! (DFS)" : "Search canceled");
            return false;
        }
    }

    static async dijkstra(grid, UI) {
        const { startNode, endNode } = grid;

        // Initialize distances
        for (let i = 0; i < grid.rows; i++) {
            for (let j = 0; j < grid.cols; j++) {
                grid.nodes[i][j].distance = Infinity;
                grid.nodes[i][j].previous = null;
            }
        }

        startNode.distance = 0;

        // "PQueue" (tho it is simple array for now, will be sorted later)
        const unvisitedNodes = [];
        for (let i = 0; i < grid.rows; i++) {
            for (let j = 0; j < grid.cols; j++) {
                unvisitedNodes.push(grid.nodes[i][j]);
            }
        }

        let foundEnd = false;

        while (unvisitedNodes.length > 0 && !foundEnd && UI.isRunning) {
            // Sort by distance and get closest node
            unvisitedNodes.sort((a, b) => a.distance - b.distance);
            const currentNode = unvisitedNodes.shift();

            // Skip walls and already processed nodes
            if (currentNode.isWall || currentNode.distance === Infinity) continue;

            // Mark as visited for visualization
            if (!currentNode.isStart && !currentNode.isEnd) {
                currentNode.isVisited = true;
                currentNode.element.classList.add('node-visited');
            }

            // Check if we reached the end
            if (currentNode === endNode) {
                foundEnd = true;
                this.reconstructPath(currentNode);
                UI.showMessage("Path found! (Dijkstra)");
                return true;
            }

            // Process neighbors
            const neighbors = grid.getNeighbors(currentNode);
            for (const neighbor of neighbors) {
                if (!neighbor.isWall) {
                    // All edges have weight 1 since this is a grid
                    const distance = currentNode.distance + 1;
                    if (distance < neighbor.distance) {
                        neighbor.distance = distance;
                        neighbor.previous = currentNode;
                    }
                }
            }

            // Add delay for visualization
            await new Promise(resolve => setTimeout(resolve, ANIMATION_SPEED));
        }

        if (!foundEnd) {
            UI.showMessage(UI.isRunning ? "No path found! (Dijkstra)" : "Search canceled");
            return false;
        }
    }

    static async bellmanFord(grid, UI) {
        const { startNode, endNode } = grid;

        // Initialize distances
        for (let i = 0; i < grid.rows; i++) {
            for (let j = 0; j < grid.cols; j++) {
                grid.nodes[i][j].distance = Infinity;
                grid.nodes[i][j].previous = null;
            }
        }

        startNode.distance = 0;

        // Get all nodes as a flat array
        const allNodes = [];
        for (let i = 0; i < grid.rows; i++) {
            for (let j = 0; j < grid.cols; j++) {
                if (!grid.nodes[i][j].isWall) {
                    allNodes.push(grid.nodes[i][j]);
                }
            }
        }

        // Bellman-Ford relaxation
        const numNodes = allNodes.length;

        // Relax all edges |V|-1 times
        for (let i = 0; i < numNodes - 1 && UI.isRunning; i++) {
            let relaxed = false;

            for (const node of allNodes) {
                if (node.distance === Infinity) continue;

                const neighbors = grid.getNeighbors(node);
                for (const neighbor of neighbors) {
                    if (!neighbor.isWall) {
                        const distance = node.distance + 1;

                        if (distance < neighbor.distance) {
                            neighbor.distance = distance;
                            neighbor.previous = node;
                            relaxed = true;

                            // Visualize visited nodes
                            if (!neighbor.isStart && !neighbor.isEnd && !neighbor.isVisited) {
                                neighbor.isVisited = true;
                                neighbor.element.classList.add('node-visited');
                            }
                        }
                    }
                }
            }

            // If no relaxation happened, stop early
            if (!relaxed) break;

            // Add a delay for visualization
            await new Promise(resolve => setTimeout(resolve, ANIMATION_SPEED));
        }

        // Check if we found a path to the end node
        if (endNode.distance !== Infinity) {
            this.reconstructPath(endNode);
            UI.showMessage("Path found! (Bellman-Ford)");
            return true;
        } else {
            UI.showMessage(UI.isRunning ? "No path found! (Bellman-Ford)" : "Search canceled");
            return false;
        }
    }
}