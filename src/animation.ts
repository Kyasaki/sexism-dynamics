import { unknownToString } from "./unknown"

/**
* Interpolates between two values.
* If the values are numbers, performs a linear interpolation.
* If the values are not numbers, interpolates between their string representations.
* String interpolation is based on finding the common prefix between the two strings,
 * and gradually transforming the common prefix of the starting string to match the common prefix of the ending string.
 * The interpolated value is obtained by removing characters from the end of the starting string
 * and adding characters from the common prefix of the ending string until reaching the ending string.
* @param {From} from The starting value.
* @param {To} to The ending value.
* @param {number} ratio The interpolation ratio.
* @returns {number | string} The interpolated value.
* @template From, To
*/
export const interpolate = <From, To>(
  from: From,
  to: To,
  ratio: number
): From extends number ? To extends number ? number : string : string => {
  if (typeof from === "number" && typeof to === "number")
    return interpolateNumber(from, to, ratio) as From extends number ? To extends number ? number : string : string
  return interpolateStringEraseAndReplace(unknownToString(from), unknownToString(to), ratio) as From extends number ? To extends number ? number : string : string
}

export const interpolateNumber = (from: number, to: number, ratio: number): number => from + (to - from) * ratio

const stringCommonPrefix = (a: string, b: string): string => {
  let prefix = ""
  const maxLength = Math.max(a.length, b.length)
  while (
    prefix.length < maxLength && a[prefix.length] === b[prefix.length]
  ) prefix += a[prefix.length]
  return prefix
}

export const interpolateStringEraseThenReplace = (from: string, to: string, ratio: number): string => {
  // Calculate the number of characters to change from fromStr to toStr
  const prefix = stringCommonPrefix(from, to)
  const changeLength = to.length + from.length - 2 * prefix.length
  const changeCount = Math.round(changeLength * ratio)
  const fromRemainingLength = from.length - prefix.length - changeCount

  // Interpolate the strings based on the common prefix and change length
  return prefix + (fromRemainingLength > 0
    ? from.slice(prefix.length, prefix.length + fromRemainingLength)
    : to.slice(prefix.length, prefix.length - fromRemainingLength)
  )
}

export const interpolateStringEraseAndReplace = (from: string, to: string, ratio: number): string => {
  // augmenter le nombre de lettres de to et diminuer le nombre de lettres de from
  // si from est plus long que to, il faut diminuer from d"une lettre de plus à chaque fois
  // Calculate the number of characters to change from fromStr to toStr
  const prefix = stringCommonPrefix(from, to)
  // combien de changements à faire?
  // max(nombre de lettre apprès le prefixe de to, nombre de lettres en trop par rapport à to)
  const replaceLength = to.length - prefix.length
  const replaceCount = Math.round(ratio * replaceLength)
  const eraseLength = to.length - from.length
  const eraseCount = Math.min(replaceCount, eraseLength) // Math.round(ratio * eraseLength)

  const toLetters = to.slice(prefix.length, prefix.length + replaceCount)
  const fromLetters = from.slice(prefix.length + replaceCount, from.length + eraseCount)
  return prefix + toLetters + fromLetters
}
