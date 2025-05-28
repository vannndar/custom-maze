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
}