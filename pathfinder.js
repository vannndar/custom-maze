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

}