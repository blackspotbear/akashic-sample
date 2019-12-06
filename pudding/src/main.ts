interface PuddinizerParameterObject extends g.EParameterObject {
	/** バネ定数 */
	k: number;

	/** 質量 */
	m: number;

	/** 減衰係数 */
	d: number;
}

class Puddinizer extends g.E {
	private k: number;
	private m: number;
	private d: number;
	private px: number;
	private py: number;
	private vx: number;
	private vy: number;

	constructor(param: PuddinizerParameterObject) {
		super(param);

		this.k = param.k;
		this.m = param.m;
		this.d = param.d;
		this.px = 0;
		this.py = 0;
		this.vx = 0;
		this.vy = 0;

		this.update.add(() => this.onUpdate());
	}

	/**
	 * プリンを突っつく。
	 *
	 * @param px 質点の位置(X成分)
	 * @param py　質点の位置(Y成分)
	 * @param vx 質点の速度(X成分)
	 * @param vy 質点の速度(Y成分)
	 */
	poke(px: number, py: number, vx: number, vy: number): void {
		this.px = px;
		this.py = py;
		this.vx = vx;
		this.vy = vy;
	}

	renderSelf(renderer: g.Renderer, camera?: g.Camera): boolean {
		renderer.transform([
			1, 0,
			0 + this.px, 1 + this.py,
			0, 0
		]);
		return true;
	}

	private onUpdate(): void {
		const dt = 1 / g.game.fps;

		const ax = (-this.px * this.k) / this.m;
		const ay = (-this.py * this.k) / this.m;

		this.vx *= this.d;
		this.vy *= this.d;
		this.vx += ax * dt;
		this.vy += ay * dt;
		this.px += this.vx * dt;
		this.py += this.vy * dt;

		this.modified();
	}
}

function main(param: g.GameMainParameterObject): void {
	const scene = new g.Scene({
		game: g.game,
		assetIds: ["pudding"]
	});

	scene.loaded.add(() => {
		// 背景を緑にする。
		scene.append(new g.FilledRect({
			scene: scene,
			width: g.game.width,
			height: g.game.height,
			cssColor: "green"
		}));

		const puddinizer = new Puddinizer({
			scene: scene,
			x: g.game.width / 2,
			y: g.game.height / 4 * 3,
			k: 192,
			m: 1,
			d: 0.95
		});

		// プリンスプライト。
		const spr = new g.Sprite({
			scene: scene,
			src: scene.assets["pudding"],
			touchable: true
		});
		// 変形の軸の位置を画像の中央下にする。
		spr.x = -spr.width / 2;
		spr.y = -spr.height * 1.0;
		spr.modified();

		// プリンをクリックした時、プルプルさせる。
		spr.pointDown.add(ev => {
			const px = 0.1 * g.game.random.get(-100, 100) / 100;
			const py = 0.1 * g.game.random.get(-100 , 100) / 100;
			const vx = 5 * g.game.random.get(-100, 100) / 100;
			const vy = 5 * g.game.random.get(-100, 100) / 100;
			puddinizer.poke(px, py, vx, vy);
		});

		// プルプルさせたいスプライトを接続。
		puddinizer.append(spr);

		scene.append(puddinizer);
	});

	g.game.pushScene(scene);
}

export = main;
