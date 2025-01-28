export const generateNewCode = () => {
  return Math.random().toString(36).substring(2, 7).toLowerCase()
}