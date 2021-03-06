class MyDefbarrel extends CGFobject {
	//<leaf type=”defbarrel” base=“ff” middle=“ff” height=“ff” slices=“ii” stacks=“ii” />

	constructor(scene, base, middle, height, slices, stacks) {
		super(scene);
		
		stacks = Math.floor(stacks/2)

		let resolution = 50;

		let Vbase = [];
		for(let i = 0; i <= resolution; i++)
			Vbase.push( [base/2 * Math.cos(Math.PI * (i/resolution)), base/2 * Math.sin(Math.PI * (i/resolution)), 0, 1] );

		let Vmiddle = [];
		for(let i = 0; i <= resolution; i++)
			Vmiddle.push( [middle/2 * Math.cos(Math.PI * (i/resolution)), middle/2 * Math.sin(Math.PI * (i/resolution)), height/2, 1] );

		let Vtop = [];
		for(let i = 0; i <= resolution; i++)
			Vtop.push( [base/2 * Math.cos(Math.PI * (i/resolution)), base/2 * Math.sin(Math.PI * (i/resolution)), height, 1] );


		let controlvertexes = [Vtop, Vmiddle, Vbase];

		/*let controlvertexes =
		[
			[
				[-base/2, 	0,	  0, 1],
				[-base/2, base/2, 0, 1],
				[	 0,   base/2, 0, 1],
				[ base/2, base/2, 0, 1],
				[ base/2,  	0,	  0, 1],
				[ base/2, -base/2,0, 1],
				[ 	 0,   -base/2,0, 1],
				[-base/2, -base/2,0, 1],
				[-base/2, 	0,	  0, 1]
			],
			[
				[-middle/2, 	0,	  height/2, 1],
				[-middle/2, middle/2, height/2, 1],
				[	 0,     middle/2, height/2, 1],
				[ middle/2, middle/2, height/2, 1],
				[ middle/2,  	0,	  height/2, 1],
				[ middle/2, -middle/2,height/2, 1],
				[ 	 0,     -middle/2,height/2, 1],
				[-middle/2, -middle/2,height/2, 1],
				[-middle/2, 	0,	  height/2, 1]
			],
			[
				[-base/2, 	0,	  height, 1],
				[-base/2, base/2, height, 1],
				[	 0,   base/2, height, 1],
				[ base/2, base/2, height, 1],
				[ base/2,  	0,	  height, 1],
				[ base/2, -base/2,height, 1],
				[ 	 0,   -base/2,height, 1],
				[-base/2, -base/2,height, 1],
				[-base/2, 	0,	  height, 1]
			]
		];
		this.patch = new MyPatch(scene, slices, stacks, 2, 8, controlvertexes);
		*/


		this.patch = new MyPatch(scene, slices, stacks, 2, resolution, controlvertexes);
	}
	
	display()
	{
		this.patch.display();
		this.scene.pushMatrix();
		this.scene.rotate(Math.PI,0,0,1);
		this.patch.display();
		this.scene.popMatrix();
	}

}

