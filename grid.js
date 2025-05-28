export class Grid {
    constructor(rows, cols) {
        this.rows = rows;
        this.cols = cols;
        this.nodes = [];
        this.startNode = null;
        this.endNode = null;
        this.isWallDrawing = false;
    }

    createGrid(UI) {
        const gridContainer = document.getElementById('grid-container');
        gridContainer.innerHTML = '';
        this.nodes = [];

        for (let i = 0; i < this.rows; i++) {
            this.nodes[i] = [];
            for (let j = 0; j < this.cols; j++) {
                const nodeElement = document.createElement('div');
                nodeElement.classList.add('node');
                nodeElement.dataset.row = i;
                nodeElement.dataset.col = j;

                nodeElement.addEventListener('click', (e) => UI.handleNodeClick(e));
                nodeElement.addEventListener('mousedown', (e) => UI.handleNodeMouseDown(e));
                nodeElement.addEventListener('mouseup', () => UI.handleNodeMouseUp());
                nodeElement.addEventListener('mouseenter', (e) => UI.handleNodeMouseEnter(e));

                gridContainer.appendChild(nodeElement);

                this.nodes[i][j] = {
                    element: nodeElement,
                    row: i,
                    col: j,
                    isStart: false,
                    isEnd: false,
                    isWall: false,
                    isVisited: false,
                    isPath: false,
                    previous: null, // For path reconstruction
                    distance: Infinity,
                };
            }
        }
    }

    reset(UI) {
        this.createGrid(UI);
        this.startNode = null;
        this.endNode = null;
        this.isWallDrawing = false;
        UI.isRunning = false;
        UI.updateButtonStates();
        UI.showMessage("Grid reset! Click 'Set Start', then 'Set End', then draw walls!");
    }

    resetVisualization() {
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) {
                const node = this.nodes[i][j];
                if (!node.isStart && !node.isEnd && !node.isWall) {
                    node.element.classList.remove('node-visited', 'node-path');
                }
                node.isVisited = false;
                node.isPath = false;
                node.previous = null;
                node.distance = Infinity;
            }
        }
    }

    getNeighbors(node) {
        const neighbors = [];
        const { row, col } = node;

        if (row > 0) neighbors.push(this.nodes[row - 1][col]);
        if (row < this.rows - 1) neighbors.push(this.nodes[row + 1][col]);
        if (col > 0) neighbors.push(this.nodes[row][col - 1]);
        if (col < this.cols - 1) neighbors.push(this.nodes[row][col + 1]);

        return neighbors;
    }

    setStartNode(row, col) {
        if (this.startNode) {
            this.startNode.isStart = false;
            this.startNode.element.classList.remove('node-start');
        }

        const node = this.nodes[row][col];
        node.isStart = true;
        node.element.classList.add('node-start');
        this.startNode = node;
    }

    setEndNode(row, col) {
        if (this.endNode) {
            this.endNode.isEnd = false;
            this.endNode.element.classList.remove('node-end');
        }

        const node = this.nodes[row][col];
        node.isEnd = true;
        node.element.classList.add('node-end');
        this.endNode = node;
    }

    toggleWall(row, col) {
        const node = this.nodes[row][col];
        if (!node.isStart && !node.isEnd) {
            node.isWall = !node.isWall;
            node.element.classList.toggle('node-wall');
        }
    }
}