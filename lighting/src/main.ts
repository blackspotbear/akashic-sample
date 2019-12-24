/**
 * 十字カーソルの生成。
 *
 * @param scene シーン。
 * @param x X座標。
 * @param y Y座標。
 * @param callback カーソル移動時に呼び出されるコールバック関数。
 */
function createCursor(scene: g.Scene, x: number, y: number, callback: (e: g.E) => void): g.E {
	const cursorColor = "yellow";

	const root = new g.E({
		scene: scene,
		x: x,
		y: y
	});

	const touchArea = new g.E({
		scene: scene,
		x: -16, y: -16,
		width: 32, height: 32,
		touchable: true
	});

	root.append(touchArea);
	root.append(new g.FilledRect({
		scene: scene,
		x: -(4 + 12), y: -2,
		width: 12, height: 4,
		cssColor: cursorColor
	}));
	root.append(new g.FilledRect({
		scene: scene,
		x: +4, y: -2,
		width: 12, height: 4,
		cssColor: cursorColor
	}));
	root.append(new g.FilledRect({
		scene: scene,
		y: -(4 + 12), x: -2,
		width: 4, height: 12,
		cssColor: cursorColor
	}));
	root.append(new g.FilledRect({
		scene: scene,
		y: +4, x: -2,
		width: 4, height: 12,
		cssColor: cursorColor
	}));

	let pointDown = false;
	touchArea.pointDown.add(() => { pointDown = true; });
	touchArea.pointUp.add(() => { pointDown = false; });
	touchArea.pointMove.add(ev => {
		if (! pointDown) return;
		root.x += ev.prevDelta.x;
		root.y += ev.prevDelta.y;
		root.modified();
		callback(root);
	});

	return root;
}

function main(param: g.GameMainParameterObject): void {
	const scene = new g.Scene({
		game: g.game,
		assetIds: [
			"dotalpha",
			"wall_brick",
			"lighting"
		]
	});

	scene.loaded.add(() => {
		// 光源の位置。画面内を 0 ~ 1 で表す。
		let lightPosX = 0.1;
		let lightPosY = 0.1;
		const lightPosZ = 0.05;

		// ライティングを行うシェーダ。
		const shaderProgram = new g.ShaderProgram({
			fragmentShader: (scene.assets["lighting"] as g.TextAsset).data,
			uniforms: {
				image_width:     { type: "float", value: g.game.width },
				image_height:    { type: "float", value: g.game.height },
				light_pos_x:     { type: "float", value: lightPosX },
				light_pos_y:     { type: "float", value: lightPosY },
				light_pos_z:     { type: "float", value: lightPosZ },
				light_dir_x:     { type: "float", value: 0 },
				light_dir_y:     { type: "float", value: 0 },
				light_dir_z:     { type: "float", value: -1 },
				light_intensity: { type: "float", value: 2 },
				light_cutoff:    { type: "float", value: Math.cos(Math.PI / 8) },
				light_exp:       { type: "float", value: 16 },
				light_ambient:   { type: "float", value: 0.1 },
				show_normal:     { type: "int",   value: 0 }
			}
		});

		const root = scene;

		// 子要素にシェーダを適用するペイン。
		const pane = new g.Pane({
			scene: scene,
			shaderProgram: shaderProgram,
			width: g.game.width,
			height: g.game.height
		});

		// シェーダを適用する画像のスプライト。
		const sprites = [
			new g.Sprite({ scene: scene, src: scene.assets["wall_brick"] }),
			new g.Sprite({ scene: scene, src: scene.assets["dotalpha"], hidden: true })
		];

		const cursor = createCursor(
			scene,
			lightPosX * g.game.width,
			lightPosY * g.game.height,
			e => {
				lightPosX = e.x / g.game.width;
				lightPosY = e.y / g.game.height;
				shaderProgram.uniforms.light_pos_x.value = lightPosX;
				shaderProgram.uniforms.light_pos_y.value = lightPosY;
				pane.invalidate();
			}
		);

		const button = new g.FilledRect({
			scene: scene,
			x: g.game.width - 32 - 8,
			y: g.game.height - 32 - 8,
			width: 32,
			height: 32,
			cssColor: "skyblue",
			touchable: true
		});

		root.append(pane);
		sprites.forEach(spr => pane.append(spr));
		root.append(cursor);
		root.append(button);

		// ボタンをクリックした時、シェーダを適用するスプライトを切り替える。
		let sprIndex = 0;
		button.pointDown.add(ev => {
			sprites[sprIndex].hide();
			sprIndex = (sprIndex + 1) % sprites.length;
			sprites[sprIndex].show();
		});

		// 時間とともにスポットライトの向きを変更する。
		let cntr = 0;
		scene.update.add(() => {
			cntr++;
			const t = cntr / g.game.fps;
			const x = (Math.cos(Math.PI * t / 2) + 1) / 2;
			const y = (Math.cos(Math.PI * t / 8) + 1) / 2;
			shaderProgram.uniforms.light_dir_x.value = x - lightPosX;
			shaderProgram.uniforms.light_dir_y.value = y - lightPosY;
			shaderProgram.uniforms.light_dir_z.value = 0 - lightPosZ;
			pane.invalidate();
		});
	});

	g.game.pushScene(scene);
}

export = main;
