/**
 * Mapa provincia/ciudad → términos que pueden aparecer en el campo location de una oferta.
 * Permite filtrar por provincia aunque la oferta especifique una ciudad concreta.
 */
export const PROVINCE_TERMS: Record<string, string[]> = {
  Madrid: ['madrid'],
  Barcelona: ['barcelona'],
  Valencia: ['valencia'],
  Sevilla: ['sevilla', 'seville'],
  Málaga: ['málaga', 'malaga', 'marbella', 'torremolinos', 'fuengirola', 'vélez'],
  Alicante: ['alicante', 'elche', 'elx', 'benidorm', 'orihuela', 'torrevieja'],
  Murcia: ['murcia', 'cartagena', 'lorca'],
  Zaragoza: ['zaragoza'],
  Bilbao: ['bilbao', 'vizcaya', 'bizkaia', 'barakaldo', 'getxo', 'basauri'],
  'San Sebastián': ['san sebastián', 'donostia', 'guipúzcoa', 'gipuzkoa', 'irún'],
  Vitoria: ['vitoria', 'gasteiz', 'álava', 'alava'],
  Pamplona: ['pamplona', 'iruña', 'navarra'],
  Santander: ['santander', 'cantabria', 'torrelavega'],
  Asturias: ['asturias', 'oviedo', 'gijón', 'gijon', 'avilés', 'aviles'],
  'A Coruña': ['a coruña', 'coruña', 'ferrol', 'santiago de compostela'],
  Vigo: ['vigo', 'pontevedra', 'ourense'],
  León: ['león', 'leon', 'ponferrada', 'astorga', 'bierzo'],
  Valladolid: ['valladolid', 'palencia'],
  Burgos: ['burgos', 'aranda de duero'],
  Salamanca: ['salamanca'],
  Toledo: ['toledo', 'talavera de la reina'],
  Granada: ['granada', 'motril'],
  Córdoba: ['córdoba', 'cordoba'],
  Jaén: ['jaén', 'jaen', 'linares'],
  Cádiz: ['cádiz', 'cadiz', 'jerez', 'algeciras'],
  Huelva: ['huelva'],
  Almería: ['almería', 'almeria'],
  Palma: ['palma', 'mallorca', 'baleares', 'balears', 'ibiza', 'menorca'],
  'Las Palmas': ['las palmas', 'gran canaria'],
  Tenerife: ['tenerife', 'santa cruz de tenerife'],
}

/**
 * Devuelve los términos de búsqueda para un valor de filtro de ubicación.
 * Si no hay mapeo específico, usa el propio valor como término.
 */
export function getLocationTerms(location: string): string[] {
  return PROVINCE_TERMS[location] ?? [location.toLowerCase()]
}
