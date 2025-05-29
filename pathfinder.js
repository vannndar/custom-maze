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

    static async floydWarshall(grid, UI) {
        const { startNode, endNode } = grid;

        // For Floyd-Warshall, we'll use a different approach since it's an all-pairs algorithm
        // We'll focus on just finding the path from start to end

        // Create a distance matrix for nodes
        const dist = new Map();
        const next = new Map();

        // Initialize maps with node references as keys
        for (let i = 0; i < grid.rows; i++) {
            for (let j = 0; j < grid.cols; j++) {
                const node = grid.nodes[i][j];

                if (node.isWall) continue;

                // Use a string key for the maps based on node coordinates
                const nodeKey = `${node.row},${node.col}`;

                dist.set(nodeKey, new Map());
                next.set(nodeKey, new Map());

                // Initialize distances and next pointers
                for (let r = 0; r < grid.rows; r++) {
                    for (let c = 0; c < grid.cols; c++) {
                        const otherNode = grid.nodes[r][c];
                        if (otherNode.isWall) continue;

                        const otherKey = `${otherNode.row},${otherNode.col}`;

                        if (nodeKey === otherKey) {
                            dist.get(nodeKey).set(otherKey, 0);
                        } else {
                            dist.get(nodeKey).set(otherKey, Infinity);
                        }
                        next.get(nodeKey).set(otherKey, null);
                    }
                }
            }
        }

        // Set up direct neighbors with weight 1
        for (let i = 0; i < grid.rows; i++) {
            for (let j = 0; j < grid.cols; j++) {
                const node = grid.nodes[i][j];
                if (node.isWall) continue;

                const nodeKey = `${node.row},${node.col}`;
                const neighbors = grid.getNeighbors(node);

                for (const neighbor of neighbors) {
                    if (!neighbor.isWall) {
                        const neighborKey = `${neighbor.row},${neighbor.col}`;
                        dist.get(nodeKey).set(neighborKey, 1);
                        next.get(nodeKey).set(neighborKey, neighbor);
                    }
                }
            }
        }

        // Since Floyd-Warshall is O(V^3), we'll visualize progress differently
        UI.showMessage("Running Floyd-Warshall (this may take longer)...");

        const allKeys = [];
        for (let i = 0; i < grid.rows; i++) {
            for (let j = 0; j < grid.cols; j++) {
                if (!grid.nodes[i][j].isWall) {
                    allKeys.push(`${i},${j}`);
                }
            }
        }

        // To make it more visual and faster, we'll:
        // 1. Prioritize paths that could lead to the end node
        // 2. Skip unnecessary calculations for visualizing the start-to-end path
        // 3. Periodically visualize the current best path

        let iteration = 0;
        for (const k of allKeys) {
            if (!UI.isRunning) break;

            for (const i of allKeys) {
                if (i === k) continue;

                for (const j of allKeys) {
                    if (j === k || j === i) continue;

                    const directDist = dist.get(i).get(j);
                    const throughKDist = dist.get(i).get(k) + dist.get(k).get(j);

                    if (throughKDist < directDist) {
                        dist.get(i).set(j, throughKDist);
                        next.get(i).set(j, next.get(i).get(k));
                    }
                }
            }

            // Visualize iterations
            iteration++;
            if (iteration % 5 === 0 || k === `${endNode.row},${endNode.col}`) {
                // Visualize the current best path from start to end
                const startKey = `${startNode.row},${startNode.col}`;
                const endKey = `${endNode.row},${endNode.col}`;

                // Clear previous visualization first
                for (let r = 0; r < grid.rows; r++) {
                    for (let c = 0; c < grid.cols; c++) {
                        const node = grid.nodes[r][c];
                        if (!node.isStart && !node.isEnd && !node.isWall) {
                            node.element.classList.remove('node-visited', 'node-path');
                            node.isVisited = false;
                            node.isPath = false;
                        }
                    }
                }

                // Mark nodes on the path if it exists
                if (dist.get(startKey).get(endKey) < Infinity) {
                    let pathNode = next.get(startKey).get(endKey);
                    let currentKey = startKey;

                    while (pathNode && currentKey !== endKey) {
                        // Mark node as on the path
                        const nextKey = `${pathNode.row},${pathNode.col}`;

                        if (!pathNode.isStart && !pathNode.isEnd) {
                            pathNode.isVisited = true;
                            pathNode.element.classList.add('node-visited');
                        }

                        currentKey = nextKey;
                        pathNode = next.get(currentKey).get(endKey);
                    }

                    UI.showMessage(`Computing all paths... Found path of length ${dist.get(startKey).get(endKey)}`);
                } else {
                    UI.showMessage("Computing all paths... No path found yet");
                }

                await new Promise(resolve => setTimeout(resolve, ANIMATION_SPEED * 2));
            }
        }

        // Reconstruct the final path if it exists
        const startKey = `${startNode.row},${startNode.col}`;
        const endKey = `${endNode.row},${endNode.col}`;

        if (dist.get(startKey).get(endKey) < Infinity) {
            // Clear previous visualization
            for (let r = 0; r < grid.rows; r++) {
                for (let c = 0; c < grid.cols; c++) {
                    const node = grid.nodes[r][c];
                    if (!node.isStart && !node.isEnd && !node.isWall) {
                        node.element.classList.remove('node-visited', 'node-path');
                        node.isVisited = false;
                        node.isPath = false;
                    }
                }
            }

            // Construct the path
            let pathNode = next.get(startKey).get(endKey);
            let currentKey = startKey;

            while (pathNode && currentKey !== endKey) {
                const nextKey = `${pathNode.row},${pathNode.col}`;

                if (!pathNode.isStart && !pathNode.isEnd) {
                    pathNode.isVisited = true;
                    pathNode.element.classList.add('node-visited');
                }

                currentKey = nextKey;
                pathNode = next.get(currentKey).get(endKey);
            }

            UI.showMessage(`Path found! (Floyd-Warshall) Length: ${dist.get(startKey).get(endKey)}`);
            return true;
        } else {
            UI.showMessage(UI.isRunning ? "No path found! (Floyd-Warshall)" : "Search canceled");
            return false;
        }
    }
}