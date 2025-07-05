// Función para abrir WhatsApp con mensaje predefinido
export const openWhatsApp = (message = 'Hola! Me interesa conocer más sobre sus servicios de máquinas expendedoras.') => {
  const phoneNumber = '5493794267780';
  const encodedMessage = encodeURIComponent(message);
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
  window.open(whatsappUrl, '_blank');
};

// Función para abrir el cliente de correo
export const openEmail = (subject = 'Consulta sobre máquinas expendedoras', body = 'Hola! Me interesa conocer más sobre sus servicios.') => {
  const email = 'nexuscorrientes@gmail.com';
  const encodedSubject = encodeURIComponent(subject);
  const encodedBody = encodeURIComponent(body);
  const mailtoUrl = `mailto:${email}?subject=${encodedSubject}&body=${encodedBody}`;
  window.open(mailtoUrl);
};

// Función para copiar el número de teléfono al portapapeles
export const copyPhoneNumber = () => {
  const phoneNumber = '5493794267780';
  navigator.clipboard.writeText(phoneNumber).then(() => {
    // Opcional: mostrar notificación de que se copió
    alert('Número copiado al portapapeles: +54 9 379 426-7780');
  });
};

// Función para abrir Google Maps con la dirección
export const openLocation = () => {
  const address = 'Jose Ramon Vidal 1768, Corrientes, Argentina';
  const encodedAddress = encodeURIComponent(address);
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
  window.open(mapsUrl, '_blank');
};

// Función para copiar la dirección al portapapeles
export const copyAddress = () => {
  const address = 'Jose Ramon Vidal 1768, Corrientes, Argentina';
  navigator.clipboard.writeText(address).then(() => {
    alert('Dirección copiada al portapapeles: Jose Ramon Vidal 1768, Corrientes, Argentina');
  });
}; 