/*
* Stores the set of tiles that composes the entire game board
Methods:
	* Create a gameboard instance
	* Add piece to a given tile
	* Remove piece from a given tile
	* Get piece on a given tile
	* Get tile given a piece
	* Get tile by board coordinate system (A..H;1..8 on chess or 0..7;0..7)
	* Move piece (piece, starting tile, destination tile)
	* Display the gameboard (render). Calls display of tiles and of pieces.
*/
class MyGameBoard{
	contructor(){
		this.tiles = [];
		this.pieces = [];
		this.red_stones = [];
		this.placed_red_stones = [];
		this.yellow_stones = [];
		this.placed_yellow_stones = [];
		this.gameState;
		
	}

	redefineStones(red_stones, yellow_stones){
		for(let i = 0; i < this.red_stones.length; i++)
		{
			this.red_stones[i] = red_stones[i];
		}
		for(let i = 0; i < this.placed_red_stones.length; i++){
			red_stones[this.red_stones.length + i].tile = this.placed_red_stones[i].tile;
			this.placed_red_stones[i] = red_stones[this.red_stones.length + i];
		}

		for(let i = 0; i < this.yellow_stones.length; i++)
		{
			this.yellow_stones[i] = yellow_stones[i];
		}
		for(let i = 0; i < this.placed_yellow_stones.length; i++){
			yellow_stones[this.yellow_stones.length + i].tile = this.placed_yellow_stones[i].tile;
			this.placed_yellow_stones[i] = yellow_stones[this.yellow_stones.length + i];
		}


	}

	redefinePieces(pieces){
		for(let index in this.pieces){
			let id = this.pieces[index].tile.id;
			
			this.tiles[id].piece = pieces[index];
			pieces[index].tile = this.tiles[id];
			pieces[index].angle = this.pieces[index].angle;
		}
		this.pieces = pieces;
	}

	resetPosition(){
		this.red_stones = [...this.red_stones, ...this.placed_red_stones];
		this.placed_red_stones = [];

		for(let index in this.red_stones){
			this.red_stones[index].tile = null;
		}

		this.yellow_stones = [...this.yellow_stones, ...this.placed_yellow_stones];
		this.placed_yellow_stones = [];

		for(let index in this.yellow_stones){
			this.yellow_stones[index].tile = null;
		}

		for(let piece of this.pieces){
			this.tiles[piece.originalTile].piece = piece 
			piece.tile = this.tiles[piece.originalTile];
		}
	}

	dropStone(currPlayer, tile){
		if(currPlayer == 'r')
		{
			let stone = this.red_stones.pop();
			this.placed_red_stones.push(stone);
			stone.tile = tile;
			stone.animator = null;
		}
		else{
			let stone = this.yellow_stones.pop();
			this.placed_yellow_stones.push(stone);
			stone.tile = tile;
			stone.animator = null;
		}
	}

	isShowingSelected(){
		for(let id in this.tiles){
			if(this.tiles[id].selected)
				return true;
		}
		return false;
	}

	removeStoneAnimator(currPlayer){
		if (currPlayer == 'r') {
			this.red_stones[this.red_stones.length - 1].animator = null;
		}
		else {
			this.yellow_stones[this.yellow_stones.length - 1].animator = null;
		}
	}

	setStoneAnimator(scene, initialMoment, currPlayer, dropTile){

        let start = {
            translation: {x:0, y:0, z:0},
            rotation:    {x:0, y:0, z:0},
            scale:       {x:1, y:1, z:1}
        }; 

        let stone_position = this.getStonePosition(currPlayer);
        
        let middle = {
            translation: {
                x: (stone_position[0] + ((dropTile.line-1)*3.85))/2, 
                y: 30, 
                z: (stone_position[2] - ((dropTile.column-1)*3.85))/2
            },
            rotation:    {x:0, y:0, z:0},
            scale:       {x:1, y:1, z:1}
        }; 


        let end = {
            translation: {
                x: stone_position[0] + ((dropTile.line-1)*3.85), 
                y: 0, 
                z: stone_position[2] - ((dropTile.column-1)*3.85)
            },
            rotation:    {x:0, y:0, z:0},
            scale:       {x:1, y:1, z:1}
        }; 

        let frames = [];
        frames[initialMoment] = start;
        frames[initialMoment+0.3] = middle;
        frames[initialMoment+0.6] = end;

        let animator = new KeyframeAnimator(frames, scene);

		if(currPlayer == 'r')
		{
			this.red_stones[this.red_stones.length - 1].animator = animator;
		}
		else{
			this.yellow_stones[this.yellow_stones.length - 1].animator = animator;
		}
	}

	animateStone(currPlayer, time){
		if(currPlayer == 'r')
		{
			this.red_stones[this.red_stones.length - 1].animator.update(time);
			return !this.red_stones[this.red_stones.length - 1].animator.ended;

		}
		this.yellow_stones[this.yellow_stones.length - 1].animator.update(time);

		return !this.yellow_stones[this.yellow_stones.length - 1].animator.ended;
	}

	getStonePosition(currPlayer){
		if(currPlayer == 'r')
			return [-(-4.9+(this.red_stones.length)*3), 0 ,-6];
		
		return [-(-4.9+(this.yellow_stones.length)*3), 0, 29];
	}

	getTileByPosition(line,column){
		let id = String.fromCharCode(64+column)+(8-line);
		return this.tiles[id];
	}

	getTile(ID){
		return this.tiles[ID];
	}

	setTiles(tiles){

		for(let id in tiles){
			tiles[id].gameboard = this;
		}
		this.tiles = tiles;
	}

	setPieces(pieces){
		this.pieces = pieces;
		for(let piece of this.pieces){
			if (this.tiles[piece.tile])
			{
				this.tiles[piece.tile].piece = piece 
				piece.tile = this.tiles[piece.tile];
			}
		}
	}

	selectTiles(positions){
		for(let position of positions){
			let id = String.fromCharCode(64+position[1])+(8-position[0]);
			this.tiles[id].select();
		}

	}

	movePiece(fromTile, toTile){
		fromTile.piece.tile = toTile;
		toTile.piece = fromTile.piece;
		fromTile.piece = null;
	}

	removeStone(scene,currPlayer,time){
		if (currPlayer == 'y') {

			let stone = this.placed_yellow_stones.pop();
			stone.tile = null;
			this.yellow_stones.push(stone);
		}
		else {
			let stone = this.placed_red_stones.pop();
			stone.tile = null;
			this.red_stones.push(stone);
		}

		this.removeStoneAnimator(currPlayer);
		this.animateStone(currPlayer, time);
	}

	unselectAllTiles(){
		for(let id in this.tiles){
			this.tiles[id].select(false);
		}
	}

	getTile(stringPosition)
	{
		if(this.tiles[stringPosition] != -1)
			return this.tiles[stringPosition];
		return false;
	}

	getScore(){
		return this.gameState['scores'];
	}

	gameEnded()
	{
		if (this.gameState['scores'][0]>= 10)
		{
			return 1;
		}
		else if (this.gameState['scores'][1] >= 10)
		{
			return 2;
		}
			return 0;
	}


}