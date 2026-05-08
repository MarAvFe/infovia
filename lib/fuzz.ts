export function fuzzLocation(lat: number, lng: number, radiusMeters = 300) {
  const radiusDeg = radiusMeters / 111320
  const angle = Math.random() * 2 * Math.PI
  const distance = Math.random() * radiusDeg
  return {
    lat: lat + distance * Math.cos(angle),
    lng: lng + distance * Math.sin(angle),
  }
}
