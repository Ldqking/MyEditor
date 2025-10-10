import { Application, Assets, Container, Sprite } from 'pixi.js';
import styles from './index.module.scss'
import { useEffect, useRef } from 'react';
import { IMGLIST } from '../../utils/enum';
import { drawImg, drawText } from '../../utils/draw';

function MyCanvas({ width, height, dragInfo }: { width: number, height: number, dragInfo: { imgUrl: string, position: number[], wh: number[] } }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const appRef = useRef<Application>(null);
  const parentRef = useRef<HTMLDivElement>(null);
  const updateCanvas = useRef<any>(null);
  const dragTarget = useRef<any>(null);

  useEffect(() => {
    init();
  }, [])
  useEffect(() => {
    updateCanvas.current && updateCanvas.current.updateCanvas(dragInfo);
  }, [dragInfo])

  async function initCanvas() {
    if (!canvasRef.current) return;
    const app = appRef.current = new Application();
    app.init({
      width: width * 3,
      height: height * 3,
      backgroundAlpha: 0,
      canvas: canvasRef.current,
      antialias: true,
      resizeTo: parentRef.current!,
      resolution: 2,
      autoDensity: true
    });
    //debug
    (globalThis as any).__PIXI_APP__ = app;

    await Assets.load(IMGLIST);

    const baseContainer = new Container();
    app.stage.addChild(baseContainer);

    app.stage.eventMode = 'static';
    app.stage.hitArea = app.screen;
    app.stage.on('pointerup', onDragEnd);
    app.stage.on('pointerupoutside', onDragEnd);

    drawImg('./images/building/build8.png', { w: 251, h: 156 }, { x: 446, y: 282 }, baseContainer, 1, 1);
    drawImg('./images/building/build9.png', { w: 251, h: 156 }, { x: 558.5, y: 342.5 }, baseContainer, 1, 1);

    const updateCanvas = (info: { imgUrl: string, position: number[], wh: number[] }) => {
      // if (info.imgUrl === '') return
      // app.ticker.destroy();
      // console.log('[ baseContainer ]', baseContainer)
      // baseContainer.removeChildren(0,39);
      // const wh = { w: 124, h: 79 }
      // const BASE_X = 510;
      // const BASE_Y = 210;
      // drawImg('./images/road/road40.png', wh, { x: BASE_X, y: BASE_Y }, baseContainer)

      // // drawImg('./images/road/road75.png', wh, { x: 1553, y: 742.5 }, baseContainer, 1, -1);

      // const car1 = drawImg('./images/car/car1.png', { w: 147 / 3, h: 102 / 3 }, { x: 585, y: 260 }, baseContainer, 1, 1)!;
      // const plane = drawImg('./images/info.png', { w: 100, h: 40 }, { x: car1.x - 30, y: car1.y - 30 }, baseContainer, 1, 99)!;

      // const OFFSET_X = 61.4;
      // const OFFSET_Y = 35.5;
      // drawRoadToB(wh, BASE_X, BASE_Y, OFFSET_X, OFFSET_Y, baseContainer);

      // drawRoadToT(wh, 571, 174.5, OFFSET_X, OFFSET_Y, baseContainer, { img: './images/road/road61.png' })

      // drawRoadToT(wh, 1062, 458.5, OFFSET_X, OFFSET_Y, baseContainer)

      // drawRoadToT(wh, 1553, 742.5, OFFSET_X, OFFSET_Y, baseContainer)

      // drawImg('./images/building/build2.png', { w: 226, h: 164 }, { x: 632, y: 176 }, baseContainer, 1, -1);
      // drawImg('./images/building/build16.png', { w: 226, h: 164 }, { x: 776, y: 236 }, baseContainer, 1, -1);

      drawDragImg(info, baseContainer)
      console.log('[ dragInfo ]', info)

      //   let targetText: any;
      //   let sign = false;
      //   app.ticker.add(() => {
      //     if (car1.x < 1453 && !sign) {
      //       car1.x += 0.52;
      //       car1.y += 0.3;
      //       plane.position.set(car1.x - 30, car1.y - 30);
      //       if (targetText) {
      //         targetText.destroy();
      //       }
      //       targetText = drawText(`x:${(car1.x).toFixed(2)}  y:${(car1.y).toFixed(2)}`, { x: car1.x - 22, y: car1.y - 28 }, {}, baseContainer)
      //     }
      //   })
    }
    updateCanvas(dragInfo)
    return { updateCanvas }
  }

  function drawDragImg(info: { imgUrl: string, position: number[], wh: number[] }, baseContainer: Container) {
    const img = drawImg(`.${info.imgUrl}`, { w: info.wh[0], h: info.wh[0] }, { x: info.position[0] - 120, y: info.position[1] - 120 }, baseContainer, 1, 1, true)!
    img.eventMode = 'static';

    // This button mode will mean the hand cursor appears when you roll over the bunny with your mouse
    img.cursor = 'pointer';

    // Center the bunny's anchor point
    img.anchor.set(0.5);

    // Setup events for mouse + touch using the pointer events
    img.on('pointerdown', onDragStart, img);

  }
  const onDragStart = (event: any) => {
    let img = event.currentTarget as Sprite;
    img.alpha = 0.5;
    dragTarget.current = img;
    appRef.current?.stage.on('pointermove', onDragMove);
  }

  function onDragMove(event: any) {
    if (dragTarget.current) {
      dragTarget.current.parent.toLocal(event.global, null, dragTarget.current.position);
    }
  }

  function onDragEnd() {
    if (dragTarget.current) {
      appRef.current?.stage.off('pointermove', onDragMove);
      dragTarget.current.alpha = 1;
      dragTarget.current = null;
    }
  }

  async function init() {
    updateCanvas.current = await initCanvas();
  }

  function drawRoadToB(wh: { w: number, h: number }, BASE_X: number, BASE_Y: number, OFFSET_X: number, OFFSET_Y: number, baseContainer: Container) {
    const ROAD_IMAGE_60 = './images/road/road60.png';
    const ROAD_IMAGE_53 = './images/road/road53.png';
    const ROAD_IMAGE_63 = './images/road/road63.png';
    const TOTAL_STEPS = 16;
    const SPECIAL_STEP = 8;

    for (let i = 1; i <= TOTAL_STEPS; i++) {
      let imagePath = ROAD_IMAGE_60;
      if (i === TOTAL_STEPS) {
        imagePath = ROAD_IMAGE_63;
      } else if (i === SPECIAL_STEP) {
        imagePath = ROAD_IMAGE_53;
      }
      drawImg(imagePath, wh, { x: BASE_X + OFFSET_X * i, y: BASE_Y + OFFSET_Y * i }, baseContainer);
    }
  }
  function drawRoadToT(wh: { w: number, h: number }, BASE_X: number, BASE_Y: number, OFFSET_X: number, OFFSET_Y: number, baseContainer: Container, special?: { img?: string, steps?: number }) {
    const ROAD_IMAGE_75 = special?.img ?? './images/road/road75.png';
    const TOTAL_STEPS = special?.steps ?? 4;
    // const SPECIAL_STEP = 8;

    for (let i = 0; i <= TOTAL_STEPS; i++) {
      let imagePath = ROAD_IMAGE_75;
      drawImg(imagePath, wh, { x: BASE_X + OFFSET_X * i, y: BASE_Y - OFFSET_Y * i }, baseContainer, 1, -(i + 1));
    }
  }

  return (
    <div className={styles.myCanvas} style={{ width, height }} ref={parentRef}>
      <canvas ref={canvasRef}></canvas>

    </div>
  )
}

export default MyCanvas