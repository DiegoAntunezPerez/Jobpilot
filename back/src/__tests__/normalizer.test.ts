import { normalizeModalidad } from '../../lib/normalizer'

describe('normalizeModalidad', () => {
  test('detecta teletrabajo', () => {
    expect(normalizeModalidad('Puesto en teletrabajo 100%')).toBe('remoto')
  })

  test('detecta híbrido', () => {
    expect(normalizeModalidad('Modelo híbrido, 3 días en oficina')).toBe(
      'hibrido'
    )
  })

  test('detecta presencial', () => {
    expect(normalizeModalidad('Trabajo presencial en Madrid')).toBe(
      'presencial'
    )
  })

  test('devuelve no_especificado por defecto', () => {
    expect(normalizeModalidad('Oferta de trabajo interesante')).toBe(
      'no_especificado'
    )
  })

  test('título influye en la detección', () => {
    expect(
      normalizeModalidad('Descripción básica', 'Desarrollador remoto senior')
    ).toBe('remoto')
  })
})
