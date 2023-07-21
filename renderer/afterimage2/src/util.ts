export const util = {
  isDev: (): boolean => {
    return util.queries().dev === "true"
  },
  isThumbnail: (): boolean => {
    return util.queries().thumbnail === "true"
  },
  getHexColors: (paletteUrl) => {
    return paletteUrl
      // .split("/")[3]
      .split("-")
      .map((c) => `#${c}`)
  },
  convertHexToRGB: (_color) => {
    _color = _color.replace("#", "")
    const aRgbHex = _color.match(/.{1,2}/g)
    return [
      parseInt(aRgbHex[0], 16) / 255.0,
      parseInt(aRgbHex[1], 16) / 255.0,
      parseInt(aRgbHex[2], 16) / 255.0,
    ]
  },
  shuffle: ([...array]) => {
    for (let i = array.length - 1; i >= 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[array[i], array[j]] = [array[j], array[i]]
    }
    return array
  },
  map: (value: number, beforeMin: number, beforeMax: number, afterMin: number, afterMax: number): number => {
    return afterMin + (afterMax - afterMin) * ((value - beforeMin) / (beforeMax - beforeMin))
  },
  convertIfNumber: (input: number | string): number | string => {
    if (typeof input === "string") {
      const num = parseInt(input, 10)
      if (!isNaN(num)) {
        return num
      } else {
        return input
      }
    } else {
      throw new Error("Input must be a string")
    }
  },
  queries: (): any => {
    return location.search
      .replace("?", "")
      .split("&")
      .map((v) => v.split("="))
      .filter((v: string[]) => v.length > 0 && v[0] !== "")
      .reduce((pre, [key, value]) => ({...pre, [key]: util.convertIfNumber(value)}), {})
  }
}
