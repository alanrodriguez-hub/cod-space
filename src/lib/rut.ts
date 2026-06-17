export function cleanRut(rut: string): string {
  return rut.replace(/\./g, "").replace(/-/g, "").toUpperCase()
}

export function formatRut(rut: string): string {
  const cleaned = cleanRut(rut)
  if (!cleaned) return ""

  const numberPart = cleaned.slice(0, -1)
  const verifier = cleaned.slice(-1)

  const formattedNumber = numberPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".")

  return `${formattedNumber}-${verifier}`
}

export function validateChileanRut(rut: string): string | null {
  const cleaned = cleanRut(rut)
  if (!cleaned) return "El RUT es obligatorio"

  if (cleaned.length < 3) return "RUT incompleto"

  const numberPart = cleaned.slice(0, -1)
  const verifier = cleaned.slice(-1)

  if (!/^\d+$/.test(numberPart)) return "RUT inválido"
  if (!/^[0-9K]$/.test(verifier)) return "Dígito verificador inválido"

  let sum = 0
  let multiplier = 2

  for (let i = numberPart.length - 1; i >= 0; i--) {
    sum += parseInt(numberPart[i], 10) * multiplier
    multiplier = multiplier === 7 ? 2 : multiplier + 1
  }

  const remainder = sum % 11
  const expected = 11 - remainder
  const expectedVerifier = expected === 11 ? "0" : expected === 10 ? "K" : String(expected)

  if (verifier !== expectedVerifier) return "RUT inválido: dígito verificador no coincide"

  return null
}
