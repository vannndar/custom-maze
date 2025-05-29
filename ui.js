import { Grid } from './grid.js';
import { Pathfinder } from './pathfinder.js';
import { GRID_ROWS, GRID_COLS } from './constants.js';

export class UI {
    static grid = new Grid(GRID_ROWS, GRID_COLS);
    static currentMode = 'none'; // 'start', 'end', 'wall', or 'none'
    static isRunning = false;

    static initialize() {
        this.startButton = document.getElementById('start-button');
        this.endButton = document.getElementById('end-button');
        this.wallButton = document.getElementById('wall-button');
        this.runButton = document.getElementById('run-button');
        this.resetButton = document.getElementById('reset-button');
        this.messageBox = document.getElementById('message-box');
        this.algorithmSelect = document.getElementById('algorithm-select');

        this.startButton.addEventListener('click', () => this.setMode('start'));
        this.endButton.addEventListener('click', () => this.setMode('end'));
        this.wallButton.addEventListener('click', () => this.setMode('wall'));
        this.runButton.addEventListener('click', () => this.runAlgorithm());
        this.resetButton.addEventListener('click', () => {
            this.isRunning = false;
            this.grid.reset(this);
        });

        this.initializeAlgorithmSelect();

        this.grid.createGrid(this);
        this.updateButtonStates();
    }

    static initializeAlgorithmSelect() {
        const algorithms = ['BFS', 'DFS', 'Dijkstra', 'Bellman-Ford', 'Floyd-Warshall'];
        
        algorithms.forEach(algo => {
            const option = document.createElement('option');
            option.value = algo.toLowerCase();
            option.textContent = algo;
            this.algorithmSelect.appendChild(option);
        });
    }

    static setMode(mode) {
        this.currentMode = mode;

        if (mode === 'start') {
            this.showMessage("Click on the grid to select the start node.");
        } else if (mode === 'end') {
            this.showMessage("Click on the grid to select the end node.");
        } else if (mode === 'wall') {
            this.showMessage("Click and drag on the grid to draw walls.");
        }

        this.updateButtonStates();
    }

    static updateButtonStates() {
        this.startButton.disabled = this.grid.startNode !== null;
        this.endButton.disabled = this.grid.startNode === null || this.grid.endNode !== null;
        this.wallButton.disabled = this.grid.startNode === null;
        this.runButton.disabled = this.grid.startNode === null || this.grid.endNode === null;
    }

    static showMessage(message) {
        this.messageBox.textContent = message;
    }

    static handleNodeClick(event) {
        if (this.isRunning) return;

        const row = parseInt(event.target.dataset.row);
        const col = parseInt(event.target.dataset.col);

        if (this.currentMode === 'start' || (!this.grid.startNode && this.startButton.disabled === false)) {
            if (!this.grid.nodes[row][col].isWall && !this.grid.nodes[row][col].isEnd) {
                this.grid.setStartNode(row, col);
                this.showMessage("Start node set! Now click 'Set End'.");
                this.currentMode = 'none';
            }
        } else if (this.currentMode === 'end' || (this.grid.startNode && !this.grid.endNode && this.endButton.disabled === false)) {
            if (!this.grid.nodes[row][col].isWall && !this.grid.nodes[row][col].isStart) {
                this.grid.setEndNode(row, col);
                this.showMessage("End node set! You can now click 'Set Wall' and draw walls, or click 'Run Algorithm'.");
                this.currentMode = 'none';
            }
        } else if (this.currentMode === 'wall' || this.wallButton.disabled === false) {
            this.grid.toggleWall(row, col);
        }

        this.updateButtonStates();
    }

    static handleNodeMouseDown(event) {
        if (this.isRunning) return;
        if (this.currentMode === 'wall' || this.wallButton.disabled === false) {
            this.grid.isWallDrawing = true;
            this.handleNodeClick(event);
        }
    }

    static handleNodeMouseUp() {
        this.grid.isWallDrawing = false;
    }

    static handleNodeMouseEnter(event) {
        if (this.isRunning) return;
        if (this.grid.isWallDrawing) {
            this.handleNodeClick(event);
        }
    }

    static disableControlsDuringExecution() {
        this.startButton.disabled = true;
        this.endButton.disabled = true;
        this.wallButton.disabled = true;
        this.runButton.disabled = true;
        this.algorithmSelect.disabled = true;
    }

    static async runAlgorithm() {
        if (!this.grid.startNode || !this.grid.endNode) {
            this.showMessage("Please set start and end nodes first!");
            return;
        }

        this.isRunning = true;
        this.disableControlsDuringExecution();

        this.grid.resetVisualization();

        const algorithm = this.algorithmSelect.value;
        let result = false;

        try {
            switch (algorithm) {
                case 'bfs':
                    result = await Pathfinder.bfs(this.grid, this);
                    break;
                case 'dfs':
                    result = await Pathfinder.dfs(this.grid, this);
                    break;
                case 'dijkstra':
                    result = await Pathfinder.dijkstra(this.grid, this);
                    break;
                case 'bellman-ford':
                    result = await Pathfinder.bellmanFord(this.grid, this);
                    break;
                case 'floyd-warshall':
                    result = await Pathfinder.floydWarshall(this.grid, this);
                    break;
                default:
                    this.showMessage("Please select a valid algorithm!");
            }
        } finally {
            this.isRunning = false;
            this.algorithmSelect.disabled = false;
            this.updateButtonStates();
        }
    }
}