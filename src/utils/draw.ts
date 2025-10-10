import { Sprite, TextStyle, Text } from "pixi.js";

export function drawImg(url: string, size: { w: number, h: number }, position: { x: number, y: number }, container: any, alpha: number = 1, zIndex: number = 0, isAutoSize: boolean = false) {
  if (!url) return;
  const sprite = Sprite.from(url);
  sprite.x = position.x
  sprite.y = position.y
  sprite.alpha = alpha
  if (!isAutoSize) {
    sprite.width = size.w
    sprite.height = size.h
  }
  sprite.zIndex = zIndex
  
  const imageName = url.match(/([^/]+)\.\w+$/)?.[1];
  sprite.label = imageName ?? 'sprite'

  container.addChild(sprite);
  return sprite
}

export function drawText(word: string, position: { x: number; y: number }, wordStyle: { wrapWidth?: number, fontSize?: number, lineHeight?: number }, container: any) {
  const baseStyle = new TextStyle({
    fontFamily: 'Microsoft YaHei',
    fontSize: wordStyle.fontSize ?? 10,
    lineHeight: wordStyle.lineHeight ?? 20,
    fill: { color: '#fff' },
    // dropShadow: isActive ? {
    //   color: 'rgba(206, 248, 38, 0.57)',
    //   blur: 4,
    //   angle: Math.PI / 6,
    //   distance: 0.5,
    // } : null,
    align: 'center',
    wordWrap: true,
    wordWrapWidth: wordStyle.wrapWidth ?? 180,
  });
  const basicText = new Text({ text: word, style: baseStyle });

  basicText.x = position.x;
  basicText.y = position.y;
  basicText.resolution = 3;
  basicText.zIndex = 999

  container.addChild(basicText);
  return basicText
}
