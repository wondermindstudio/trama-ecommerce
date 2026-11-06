export const brand = {
  name: 'Trama',
  nav: { all: 'Colección' },
  categories: {
    remeras: 'Remeras',
    camisas: 'Camisas',
    pantalones: 'Pantalones',
    abrigos: 'Abrigos',
    vestidos: 'Vestidos',
  },
  categoryIntro: {
    all: 'Prendas de lino, algodón orgánico y lana, cortadas y cosidas en talleres de Buenos Aires.',
    abrigos: 'Paño, canvas y lana para todo el invierno. Este cambio de estación, con 15% de descuento.',
    remeras: 'Las de todos los días. Llevá tres y pagá dos.',
  },
  searchPlaceholder: 'Lino, merino, camisa…',
  cardDetail: (p) => p.attributes?.Composición,
  copy: {
    emptyCart: 'Mirá la colección: cada prenda indica su fibra, su calce y dónde se cosió.',
    notFound: 'Puede que la prenda se haya agotado o que el enlace esté mal escrito.',
  },
  footer: {
    about: 'Ropa esencial de fibras naturales. Pocas prendas, bien hechas, pensadas para durar más de una temporada.',
    help: ['Cambios dentro de los 30 días', 'Envíos a todo el país', 'hola@trama.com.ar'],
  },
};
