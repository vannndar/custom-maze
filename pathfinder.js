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
}