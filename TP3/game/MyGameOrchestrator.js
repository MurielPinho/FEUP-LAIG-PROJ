/*
Manages the entire game:
    • Load of new scenes
    • Manage gameplay (game states)
    • Manages undo•Manages movie play
    • Manage object selection
*/

class MyGameOrchestrator {
    constructor(scene) {
        this.scene = scene;
        this.gameSequence = new MyGameSequence();
        this.animator = new MyAnimator();
        this.gameboard = new MyGameBoard();
        this.theme = new MySceneGraph('jinli.xml', scene);
        this.prolog = new MyPrologInterface();

        this.prolog.testConnection();

        this.displayMenu = false;
        //this.startGame(1, 1, 'Player vs. Player');
        this.initGame = false;
        this.level = 1;
        this.modes = ['Player vs. Player', 'Player vs. CPU', 'CPU vs. CPU'];
        this.mode = 'Player vs. CPU';
        this.menu = new Menu(this, scene, this.level, this.mode);
        this.score = new ScoreClock(this.scene, this.level);
        this.gameStateStack = [];

        this.state = 'start';
        this.currPlayer = 'r';
    }

    onGraphLoaded() {
        this.gameboard.setTiles(this.theme.tiles);
        this.gameboard.setPieces(this.theme.pieces);
        this.score.setLevel(this.level);
    }

    startGame(ambient, level, game_mode) {
        this.level = level;
        this.mode = game_mode;

        let filename;
        switch (ambient) {
            case 1:
                filename = "jinli.xml";
                break;
            case 2:
                filename = "jinli.xml";
                break;
            default:
                filename = "menu.xml";
                break;
        }
        this.scene.sceneInitiated = false;
        this.displayMenu = false;

        this.theme = new MySceneGraph(filename, this.scene);
    }

    update(time) {
        this.lastTime = this.lastTime || 0;
        this.deltaTime = time - this.lastTime;
        this.lastTime = time;
        switch (this.state) {
            case 'start':
                this.prolog.testConnection();
                this.state = 'testing connection';
                break;

            case 'testing connection':
                if (this.prolog.connectionStablished === true)
                    this.state = 'connected';
                if (this.prolog.connectionStablished === false)
                    this.state = 'connection error';
                break;

            case 'connection error':
                alert('Could not connect to server');
                this.state = 'broken';
                break;

            case 'connected':
                this.prolog.sendInitial();
                this.state = 'waiting initial';
                break;

            case 'waiting initial':
                if (this.prolog.requestReady)
                    this.state = 'initial parsed';
                break;

            case 'initial parsed':
                this.displayMenu = true;
                this.gameboard.gameState = this.prolog.parsedResult;
                this.gameStateStack.push(this.prolog.parsedResult);
                this.state = 'waiting select piece';
                break;

            case 'waiting select piece':
                break;

            case 'waiting valid moves':
                this.state = this.prolog.requestReady ? 'received valid moves' : 'waiting valid moves';
                break;

            case 'received valid moves':
                this.gameboard.showValidMoves(this.prolog.parsedResult);
                this.state = 'waiting move tile';
                break;

            case 'waiting move tile':
                break;

            case 'waiting move result':
                if (this.prolog.requestReady)
                    this.state = 'move piece';
                break;

            case 'move piece':
                let gameState = new MyGameState(this.prolog.parsedResult[0]);
                this.gameStateStack.push(gameState);
                this.gameboard.gameState = gameState;
                this.gameboard.movePiece(this.fromTile, this.toTile);
                this.state = 'waiting select piece';
                this.currPlayer = this.currPlayer == 'r' ? 'y' : 'r';
                this.score.updateScore(this.gameboard.getScore());
                console.log(this.prolog.parsedResult[1]);
                break;
        }

        if (!this.displayMenu) {
            if (this.sceneInited) {
                if (!this.initGame) {
                    let mode;
                    for (let i = 0; i < this.modes.length; i++) {
                        if (this.modes[i] === this.mode) {
                            mode = i + 1;
                            break;
                        }
                    }
                    this.initGame = true;
                }
            }  
            //console.log(this.deltaTime);
            this.score.updateTime(this.deltaTime,this.currPlayer);
        }  
        
        this.theme.update(time);
        this.checkKeys();
    }

    display() {
        //...

        this.theme.displayScene();
        this.score.display();
        if (this.displayMenu) {
            this.menu.display();
        }
        else {
            this.managePick(this.scene.pickMode, this.scene.pickResults);
        }
        //this.gameboard.display();
        //this.animator.display();
        //...
    }
    checkKeys() {
        if (this.scene.gui.isKeyPressed("Escape") || this.scene.gui.isKeyPressed("KeyM")) {
            this.menu.toggleMenu();
        }
        if (this.scene.gui.isKeyPressed("KeyR")) {
            this.undoMove();
        }
    }

    managePick(mode, results) {
        if (mode == false /* && some other game conditions */)
            if (results != null && results.length > 0)  // any results? 
            {
                for (var i = 0; i < results.length; i++) {
                    var obj = results[i][0]; // get object from result
                    if (obj)  // exists? 
                    {
                        var uniqueId = results[i][1] // get idt
                        this.onObjectSelected(obj, uniqueId);
                    }
                }

                // clear results 

                results.splice(0, results.length);
            }
    }
    undoMove()
    {
        console.log('UndoMove');
        console.log(this.gameboard.getScore());
    }
    onObjectSelected(obj, id) {

        if (obj instanceof MyPiece) {

            switch (this.state) {
                case 'waiting select piece':
                    if (obj.color == this.currPlayer) {
                        this.prolog.sendValidMoves(this.gameboard.gameState, obj.tile.line, obj.tile.column);
                        this.state = 'waiting valid moves';
                        this.fromTile = obj.tile;
                    }
                    break;

                case 'waiting move tile':
                    if (obj.color != this.currPlayer) {
                        this.gameboard.unselectAllTiles();
                        this.state = 'waiting select piece';
                    }
                    break;
            }

        }
        else if (obj instanceof MyTile) {
            switch (this.state) {
                case 'waiting select piece':
                    if (obj.hasPlayer(this.currPlayer)) {
                        this.prolog.sendValidMoves(this.gameboard.gameState, obj.line, obj.column);
                        this.state = 'waiting valid moves';
                        this.fromTile = obj;
                    }
                    break;

                case 'waiting move tile':
                    if (obj.selected) {
                        this.prolog.sendMove(this.gameboard.gameState, this.currPlayer, this.fromTile.line, this.fromTile.column, obj.line, obj.column);
                        this.state = 'waiting move result';
                        this.toTile = obj;
                    }
                    else if (!obj.hasPlayer(this.currPlayer)) {
                        this.gameboard.unselectAllTiles();
                        this.state = 'waiting select piece';
                    }
                    break;
            }
        }
        else if (obj instanceof MyUndoButton) {
            this.undoMove();
        }
        else {
            console.log("Picked object of type: " + obj.constructor.name + ", with pick id " + id);
            console.log(obj);
        }
    }

}