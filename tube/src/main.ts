interface RoadParameterObject extends g.EParameterObject {
	posY: number;
	map: number[];
	mapWidth: number;
	surfaces: g.Surface[];
}

/**
 * タイルマップ描画役。
 */
class Road extends g.E {
	/** スクロール位置 */
	posY: number;

	/** マップデータ */
	map: number[];

	/** マップの横のタイル数 */
	mapWidth: number;

	/** マップの縦のタイル数 */
	mapHeight: number;

	/** タイル画像 */
	surfaces: g.Surface[];

	constructor(param: RoadParameterObject) {
		super(param);

		this.posY = param.posY;
		this.map = param.map;
		this.mapWidth = param.mapWidth;
		this.mapHeight = param.map.length / param.mapWidth;
		this.surfaces = param.surfaces;
	}

	renderSelf(renderer: g.Renderer, camera?: g.Camera): boolean {
		const tileWidth = this.width / this.mapWidth;
		const tileHeight = tileWidth; // ここではタイルを常に正方形に描画する。

		let mapPosY = (this.posY / tileHeight) % this.mapHeight;
		if (mapPosY < 0) {
			mapPosY += this.mapHeight;
		}

		let yi = mapPosY | 0;
		const yf = mapPosY - yi;

		renderer.save();

		for (let y = this.height - tileHeight * yf; y > -tileHeight; y -= tileHeight) {
			for (let i = 0; i < this.mapWidth; i++) {
				const tileId = this.map[(yi * this.mapWidth + i) % this.map.length];
				const surface = this.surfaces[tileId];

				renderer.setTransform([
					tileWidth / surface.width, 0,
					0, tileHeight / surface.height,
					i * tileWidth, y
				]);

				renderer.drawImage(
					surface,
					0, 0,
					surface.width, surface.height,
					0, 0
				);
			}

			yi -= 1;
			if (yi < 0) {
				yi += this.mapHeight;
			}
		}

		renderer.restore();

		return true;
	}
}

function main(param: g.GameMainParameterObject): void {
	const map = [
		// 1  2  3  4  5  6  7  8  9
		2, 2, 2, 2, 2, 2, 2, 2, 2, 2,
		2, 2, 2, 2, 2, 2, 2, 2, 2, 2,
		2, 2, 2, 2, 2, 2, 2, 2, 2, 2,
		2, 2, 2, 2, 2, 2, 2, 2, 2, 2,
		0, 0, 1, 1, 1, 1, 1, 1, 0, 0,
		0, 0, 0, 1, 1, 1, 1, 0, 0, 0,
		0, 0, 0, 0, 1, 1, 0, 0, 0, 0,
		0, 0, 1, 1, 1, 1, 0, 0, 0, 0,
		0, 0, 1, 1, 1, 1, 1, 0, 0, 0,

		// 1  2  3  4  5  6  7  8  9
		0, 1, 1, 1, 0, 0, 1, 0, 0, 0,
		0, 1, 1, 1, 0, 0, 1, 0, 0, 0,
		0, 0, 1, 1, 1, 0, 1, 0, 0, 0,
		0, 0, 1, 1, 1, 0, 1, 0, 0, 0,
		0, 0, 1, 1, 1, 1, 1, 0, 0, 0,
		0, 0, 1, 1, 1, 1, 0, 0, 0, 0,
		0, 1, 1, 0, 1, 1, 0, 0, 0, 0,
		0, 1, 1, 0, 1, 1, 0, 0, 0, 0,
		0, 1, 1, 0, 1, 1, 0, 0, 0, 0,
		0, 1, 1, 0, 1, 1, 1, 0, 0, 0,

		// 1  2  3  4  5  6  7  8  9
		0, 0, 0, 0, 1, 1, 1, 0, 0, 0,
		0, 1, 1, 0, 0, 1, 1, 0, 0, 0,
		0, 1, 1, 0, 0, 1, 1, 0, 0, 0,
		0, 1, 1, 0, 0, 0, 1, 1, 0, 0,
		0, 1, 1, 0, 0, 0, 1, 1, 0, 0,
		0, 1, 1, 1, 1, 1, 1, 1, 1, 0,
		0, 1, 1, 1, 1, 1, 1, 1, 1, 0,
		0, 1, 1, 1, 1, 1, 1, 1, 1, 0,
		0, 1, 1, 1, 1, 1, 1, 1, 1, 0,
		1, 1, 1, 1, 0, 0, 0, 1, 1, 1,

		// 1  2  3  4  5  6  7  8  9
		1, 1, 1, 1, 0, 0, 0, 1, 1, 1,
		0, 0, 0, 0, 1, 1, 1, 0, 0, 0,
		0, 1, 1, 0, 0, 1, 1, 0, 0, 0,
		0, 1, 1, 0, 0, 1, 1, 0, 0, 0,
		0, 1, 1, 0, 0, 0, 1, 1, 0, 0,
		0, 1, 1, 0, 0, 0, 1, 1, 0, 0,
		0, 1, 1, 1, 1, 1, 1, 1, 1, 0,
		0, 1, 1, 1, 1, 1, 1, 1, 1, 0,
		0, 1, 1, 1, 1, 1, 1, 1, 1, 0,
		0, 1, 1, 1, 1, 1, 1, 1, 1, 0,

		// 1  2  3  4  5  6  7  8  9
		1, 1, 1, 1, 0, 0, 0, 1, 1, 1,
		0, 0, 0, 0, 1, 1, 1, 0, 0, 0,
		0, 1, 1, 0, 0, 1, 1, 0, 0, 0,
		0, 1, 1, 0, 0, 1, 1, 0, 0, 0,
		0, 1, 1, 0, 0, 0, 1, 1, 0, 0,
		0, 1, 1, 0, 0, 0, 1, 1, 0, 0,
		0, 1, 1, 1, 1, 1, 1, 1, 1, 0,
		0, 1, 1, 1, 1, 1, 1, 1, 1, 0,
		0, 1, 1, 1, 1, 1, 1, 1, 1, 0,
		0, 1, 1, 1, 1, 1, 1, 1, 1, 0,

		// 1  2  3  4  5  6  7  8  9
		1, 1, 1, 1, 0, 0, 0, 1, 1, 1,
		0, 0, 0, 0, 1, 1, 1, 0, 0, 0,
		0, 1, 1, 0, 0, 1, 1, 0, 0, 0,
		0, 1, 1, 0, 0, 1, 1, 0, 0, 0,
		0, 1, 1, 0, 0, 0, 1, 1, 0, 0,
		0, 1, 1, 0, 0, 0, 1, 1, 0, 0,
		0, 1, 1, 1, 1, 1, 1, 1, 1, 0,
		0, 1, 1, 1, 1, 1, 1, 1, 1, 0,
		0, 1, 1, 1, 1, 1, 1, 1, 1, 0,
		0, 1, 1, 1, 1, 1, 1, 1, 1, 0,

		// 1  2  3  4  5  6  7  8  9
		1, 1, 1, 1, 0, 0, 0, 1, 1, 1,
		0, 0, 0, 0, 1, 1, 1, 0, 0, 0,
		0, 1, 1, 0, 0, 1, 1, 0, 0, 0,
		0, 1, 1, 0, 0, 1, 1, 0, 0, 0,
		0, 1, 1, 0, 0, 0, 1, 1, 0, 0,
		0, 1, 1, 0, 0, 0, 1, 1, 0, 0,
		0, 1, 1, 1, 1, 1, 1, 1, 1, 0,
		0, 1, 1, 1, 1, 1, 1, 1, 1, 0,
		0, 1, 1, 1, 1, 1, 1, 1, 1, 0,
		0, 1, 1, 1, 1, 1, 1, 1, 1, 0,

		// 1  2  3  4  5  6  7  8  9
		1, 1, 1, 1, 0, 0, 0, 1, 1, 1,
		0, 0, 0, 0, 1, 1, 1, 0, 0, 0,
		0, 1, 1, 0, 0, 1, 1, 0, 0, 0,
		0, 1, 1, 0, 0, 1, 1, 0, 0, 0,
		0, 1, 1, 0, 0, 0, 1, 1, 0, 0,
		0, 1, 1, 0, 0, 0, 1, 1, 0, 0,
		0, 1, 1, 1, 1, 1, 1, 1, 1, 0,
		0, 1, 1, 1, 1, 1, 1, 1, 1, 0,
		0, 1, 1, 1, 1, 1, 1, 1, 1, 0,
		0, 1, 1, 1, 1, 1, 1, 1, 1, 0
	];

	const scene = new g.Scene({
		game: g.game,
		assetIds: [
			"vehicle",
			"block",
			"road",
			"gradation",
			"tube" // glsl
		]
	});

	scene.loaded.add(() => {
		const road = new Road({
			scene: scene,
			width: 640,
			height: 480,
			posY: map.length / 10 * (640 / 10),
			map: map,
			mapWidth: 10,
			surfaces: [
				g.Util.asSurface(scene.assets["block"]),
				g.Util.asSurface(scene.assets["road"]),
				g.Util.asSurface(scene.assets["gradation"])
			]
		});

		const roadPane = new g.Pane({
			scene: scene,
			width: 640,
			height: 480
		});

		const tubedRoadPane = new g.Pane({
			scene: scene,
			width: 640,
			height: 480,
			shaderProgram: new g.ShaderProgram({
				fragmentShader: (scene.assets["tube"] as g.TextAsset).data,
				uniforms: {
					rotZ:         { type: "float", value: 0 },
					image_width:  { type: "float", value: 640 },
					image_height: { type: "float", value: 480 }
				}
			})
		});

		const vehicle = new g.Sprite({
			scene: scene,
			src: scene.assets["vehicle"],
			x: g.game.width / 2 - 16,
			y: g.game.height - 128,
			scaleX: 2,
			scaleY: 2
		});

		const kartSprOy = vehicle.y;

		const bar = new g.FilledRect({
			scene: scene,
			x: g.game.width * 0.1,
			y: g.game.height * 0.85,
			width: g.game.width * 0.8,
			height: 8,
			cssColor: "white"
		});

		const knob = new g.FilledRect({
			scene: scene,
			x: g.game.width / 2 - 32,
			y: bar.y + bar.height / 2 - 8,
			width: 64,
			height: 16,
			cssColor: "green",
			touchable: true
		});

		// 車両の左右移動操作。
		knob.pointMove.add(ev => {
			const xmin = bar.x;
			const xmax = bar.x + bar.width - knob.width;
			knob.x += ev.prevDelta.x;
			knob.x = Math.max(Math.min(knob.x, xmax), xmin);
			knob.modified();

			let t = (knob.x - xmin) / (xmax - xmin);
			t = t * 2 - 1;
			tubedRoadPane.shaderProgram.uniforms.rotZ.value = Math.PI * t;
		});

		scene.append(tubedRoadPane);
		tubedRoadPane.append(roadPane);
		roadPane.append(road);

		scene.append(vehicle);
		scene.append(bar);
		scene.append(knob);

		scene.update.add(() => {
			// 車両を揺らして雰囲気を出す。
			vehicle.y = kartSprOy + Math.random() * 4 - 2;
			vehicle.modified();

			// スクロール位置更新。
			road.posY -= 16;
			road.modified();

			roadPane.invalidate();
			tubedRoadPane.invalidate();
		});
	});

	g.game.pushScene(scene);
}

export = main;
