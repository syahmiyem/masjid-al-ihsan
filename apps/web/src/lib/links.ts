// Outbound links for contact and directions (plan 3.2, 4.7). Phone numbers come from Tetapan Masjid.

export const whatsappLink = (number: string, text?: string) =>
  `https://wa.me/${number.replace(/\D/g, '')}${text ? `?text=${encodeURIComponent(text)}` : ''}`;

export const telLink = (phone: string) => `tel:${phone.replace(/[^\d+]/g, '')}`;

const MAP_QUERY = 'Masjid Al-Ihsan Felda Sungai Panching Selatan Kuantan';

export const googleMapsLink = (mapUrl?: string) =>
  mapUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(MAP_QUERY)}`;

export const wazeLink = () => `https://waze.com/ul?q=${encodeURIComponent(MAP_QUERY)}&navigate=yes`;
