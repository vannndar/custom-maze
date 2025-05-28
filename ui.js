import { GRID_ROWS, GRID_COLS } from './constants.js';

export class UI {
    static initialize() {
        this.startButton = document.getElementById('start-button');
        this.endButton = document.getElementById('end-button');
        this.wallButton = document.getElementById('wall-button');
        this.runButton = document.getElementById('run-button');
        this.resetButton = document.getElementById('reset-button');
        this.messageBox = document.getElementById('message-box');
        this.algorithmSelect = document.getElementById('algorithm-select');
        
        this.initializeGrid();
        
        this.currentMode = 'none'; // 'start', 'end', 'wall', or 'none'
        this.startNode = null;
        this.endNode = null;
        this.isWallDrawing = false;
        
        this.startButton.addEventListener('click', () => this.setMode('start'));
        this.endButton.addEventListener('click', () => this.setMode('end'));
        this.wallButton.addEventListener('click', () => this.setMode('wall'));
        this.runButton.addEventListener('click', () => this.showMessage("not implemented yet"));
        this.resetButton.addEventListener('click', () => this.resetGrid());
        
        this.initializeAlgorithmSelect();
        
        this.updateButtonStates();
    }
    
    static initializeGrid() {
        const gridContainer = document.getElementById('grid-container');
        gridContainer.innerHTML = '';
        gridContainer.style.display = 'grid';
        
        this.grid = [];
        
        for (let i = 0; i < GRID_ROWS; i++) {
            this.grid[i] = [];
            for (let j = 0; j < GRID_COLS; j++) {
                const cell = document.createElement('div');
                cell.classList.add('node');
                cell.dataset.row = i;
                cell.dataset.col = j;
                
                cell.addEventListener('click', (e) => this.handleNodeClick(e));
                cell.addEventListener('mousedown', (e) => this.handleNodeMouseDown(e));
                cell.addEventListener('mouseup', () => this.handleNodeMouseUp());
                cell.addEventListener('mouseenter', (e) => this.handleNodeMouseEnter(e));
                
                gridContainer.appendChild(cell);
                
                // Store node information
                this.grid[i][j] = {
                    element: cell,
                    isStart: false,
                    isEnd: false,
                    isWall: false
                };
            }
        }
    }
    
    static initializeAlgorithmSelect() {
        const algorithms = ['BFS', 'DFS'];
        
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
    }
    
    static handleNodeClick(event) {
        const row = parseInt(event.target.dataset.row);
        const col = parseInt(event.target.dataset.col);
        const node = this.grid[row][col];
        
        if (this.currentMode === 'start') {
            this.setStartNode(row, col);
        } else if (this.currentMode === 'end') {
            this.setEndNode(row, col);
        } else if (this.currentMode === 'wall') {
            this.toggleWall(row, col);
        }
        
        this.updateButtonStates();
    }
    
    static handleNodeMouseDown(event) {
        if (this.currentMode === 'wall') {
            this.isWallDrawing = true;
            this.handleNodeClick(event);
        }
    }
    
    static handleNodeMouseUp() {
        this.isWallDrawing = false;
    }
    
    static handleNodeMouseEnter(event) {
        if (this.isWallDrawing) {
            this.handleNodeClick(event);
        }
    }
    
    static setStartNode(row, col) {
        if (this.startNode) {
            const prevNode = this.grid[this.startNode.row][this.startNode.col];
            prevNode.isStart = false;
            prevNode.element.classList.remove('node-start');
        }
        
        const node = this.grid[row][col];
        if (!node.isEnd && !node.isWall) {
            node.isStart = true;
            node.element.classList.add('node-start');
            this.startNode = { row, col };
            this.showMessage("Start node set! Now click 'Set End'.");
            this.currentMode = 'none';
        }
    }
    
    static setEndNode(row, col) {
        if (this.endNode) {
            const prevNode = this.grid[this.endNode.row][this.endNode.col];
            prevNode.isEnd = false;
            prevNode.element.classList.remove('node-end');
        }
        
        const node = this.grid[row][col];
        if (!node.isStart && !node.isWall) {
            node.isEnd = true;
            node.element.classList.add('node-end');
            this.endNode = { row, col };
            this.showMessage("End node set! You can now add walls or click 'Run Algorithm'.");
            this.currentMode = 'none';
        }
    }
    
    static toggleWall(row, col) {
        const node = this.grid[row][col];
        if (!node.isStart && !node.isEnd) {
            node.isWall = !node.isWall;
            node.element.classList.toggle('node-wall');
        }
    }
    
    static resetGrid() {
        this.initializeGrid();
        this.startNode = null;
        this.endNode = null;
        this.currentMode = 'none';
        this.showMessage("Grid reset! Click 'Set Start', then 'Set End', then draw walls!");
        this.updateButtonStates();
    }
    
    static updateButtonStates() {
        this.startButton.disabled = this.startNode !== null;
        this.endButton.disabled = this.startNode === null || this.endNode !== null;
        this.wallButton.disabled = this.startNode === null;
        this.runButton.disabled = this.startNode === null || this.endNode === null;
    }
    
    static showMessage(message) {
        this.messageBox.textContent = message;
    }
}