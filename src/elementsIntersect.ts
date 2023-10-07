interface Element {
  top: number;
  left: number;
  width: number;
  height: number;
}

export default function elementsIntersect(
  element1: Element,
  element2: Element
) {
  const element1Right = element1.left + element1.width;
  const element1Bottom = element1.top + element1.height;
  const element2Right = element2.left + element2.width;
  const element2Bottom = element2.top + element2.height;

  const boundingRectLeft = Math.min(element1.left, element2.left);
  const boundingRectTop = Math.min(element1.top, element2.top);
  const boundingRectRight = Math.max(element1Right, element2Right);
  const boundingRectBottom = Math.max(element1Bottom, element2Bottom);

  // Compare width and height of bounding rectangle to the sum of the elements width and height to determine intersection
  return (
    Math.abs(boundingRectRight - boundingRectLeft) <
      element1.width + element2.width &&
    Math.abs(boundingRectTop - boundingRectBottom) <
      element1.height + element2.height
  );
}
