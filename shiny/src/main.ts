import * as tl from "@akashic-extension/akashic-timeline";

/**
 * キラキラエフェクトパラメタオブジェクト。
 */
interface ShinyEffectParameterObject extends g.CacheableEParameterObject {
	/** キラキラさせたい画像 */
	src: g.ImageAsset;

	/** キラキラの色 */
	effectColor?: string;
}

/**
 * キラキラエフェクト。
 */
class ShinyEffect extends g.CacheableE {
	/** 光沢の強さ(0~1)。 */
	shininess: number;

	/** キラキラの色 */
	effectColor: string;

	private surface: g.Surface;

	constructor(param: ShinyEffectParameterObject) {
		param.width = param.src.width;
		param.height = param.src.height;

		super(param);

		this.shininess = 0;
		this.effectColor = param.effectColor || "white";
		this.surface = param.src.asSurface();
	}

	renderCache(renderer: g.Renderer, camera?: g.Camera): void {
		// 光らせたい画像を最初に描画する。
		renderer.drawImage(this.surface, 0, 0, this.surface.width, this.surface.height, 0, 0);

		renderer.save();

		// SourceAtop に設定。
		renderer.setCompositeOperation(g.CompositeOperation.SourceAtop);

		// 次に描画する矩形の透明度で光沢の強さを表現する。
		renderer.setOpacity(this.shininess);

		// 光らせるため、描画する画像と同じ大きさの白い矩形を描画する。
		renderer.fillRect(0, 0, this.surface.width, this.surface.height, this.effectColor);

		renderer.restore();
	}
}

/**
 * スペクラエフェクトパラメタオブジェクト。
 */
interface SpecularEffectParameterObject extends g.CacheableEParameterObject {
	/** キラッとさせたい画像 */
	src: g.ImageAsset;

	/** 「キラ」の色 */
	effectColor?: string;

	/** 横に移動する光沢の角度 */
	flashAngle?: number;
}

/**
 * スペキュラエフェクト。
 *
 * キラッと光るエフェクトを画像に加える E 。
 */
class SpecularEffect extends g.CacheableE {
	/** アニメー中の時、真。読み取り専用。 */
	animating: boolean;

	/** エフェクトの色 */
	effectColor: string;

	/** 横に移動する光沢の角度 */
	flashAngle: number;

	private surface: g.Surface;
	private timeline: tl.Timeline;
	private flashX: number;
	private flashWidth: number;
	private flashOpacity: number;
	private currentFlashAngle: number;

	constructor(param: SpecularEffectParameterObject) {
		param.width = param.src.width;
		param.height = param.src.height;

		super(param);

		this.animating = false;
		this.surface = param.src.asSurface();
		this.effectColor = param.effectColor || "white";
		this.timeline = new tl.Timeline(param.scene);
		this.flashAngle = typeof param.flashAngle === "number" ? param.flashAngle : -Math.PI / 12;
	}

	/**
	 * エフェクト開始。
	 */
	start(): void {
		this.timeline.clear();

		this.animating = true;
		this.flashX = 0;
		this.flashWidth = this.width * 0.1;
		this.flashOpacity = 0.75;
		this.currentFlashAngle = this.flashAngle;

		this.timeline.create(this, { modified: this.invalidate })
			.every(
				(e, p) => {
					this.flashX = (-this.flashWidth) * (1 - p) + (this.width + this.height * Math.sin(-this.currentFlashAngle)) * p;
				},
				15 * 1000 / g.game.fps,
				tl.Easing.linear
			)
			.call(() => {
				this.flashX = 0;
				this.flashWidth = this.width;
				this.flashOpacity = 1;
				this.currentFlashAngle = 0;
			})
			.con()
			.every(
				(e, p) => {
					this.flashOpacity = 1 - p;
				},
				30 * 1000 / g.game.fps,
				tl.Easing.linear
			)
			.call(() => this.animating = false);
	}

	renderCache(renderer: g.Renderer, camera?: g.Camera): void {
		renderer.drawImage(this.surface, 0, 0, this.surface.width, this.surface.height, 0, 0);

		renderer.save();

		renderer.setCompositeOperation(g.CompositeOperation.SourceAtop);
		renderer.setOpacity(this.flashOpacity);

		const height = this.height;
		renderer.setTransform([
			1, 0,
			Math.sin(this.currentFlashAngle), 1,
			0, 0
		]);
		renderer.fillRect(this.flashX, 0, this.flashWidth, height, this.effectColor);

		renderer.restore();
	}

}

function main(param: g.GameMainParameterObject): void {
	const scene = new g.Scene({
		game: g.game,
		assetIds: ["hw_title", "gw_title"]
	});

	scene.loaded.add(() => {

		// 背景を青くする。
		scene.append(new g.FilledRect({
			scene: scene,
			width: g.game.width,
			height: g.game.height,
			cssColor: "blue"
		}));

		// 光るエフェクト。
		const shinyImage = new ShinyEffect({
			scene: scene,
			src: scene.assets["hw_title"] as g.ImageAsset
		});

		// 画面中央に配置。
		shinyImage.x = (g.game.width - shinyImage.width) / 2;
		shinyImage.y = (g.game.height / 2 - shinyImage.height) / 2;
		shinyImage.modified();

		let cntr = 0;
		scene.update.add(() => {
			cntr++;
			// 光沢の強さを変化させる。
			shinyImage.shininess = 1 - ((cntr % g.game.fps) / g.game.fps);
			shinyImage.invalidate();
		});

		const specularImage = new SpecularEffect({
			scene: scene,
			src: scene.assets["gw_title"] as g.ImageAsset
		});
		specularImage.x = (g.game.width - specularImage.width) / 2;
		specularImage.y = g.game.height / 2 + (g.game.height / 2 - specularImage.height) / 2;
		specularImage.modified();

		scene.update.add(() => {
			if (!specularImage.animating) {
				specularImage.start();
			}
		});

		scene.append(shinyImage);
		scene.append(specularImage);
	});

	g.game.pushScene(scene);
}

export = main;
