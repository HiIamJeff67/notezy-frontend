export function choiceRandom<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

export const randomColor = () =>
  `rgb(${Math.floor(Math.random() * 256)}, ${Math.floor(
    Math.random() * 256
  )}, ${Math.floor(Math.random() * 256)})`;
