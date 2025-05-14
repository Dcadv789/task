export const formatDate = (dateString: string): string => {
  // Ajusta o timezone para local
  const date = new Date(dateString);
  const localDate = new Date(date.getTime() + date.getTimezoneOffset() * 60000);
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  // Se for hoje
  if (localDate.toDateString() === today.toDateString()) {
    return 'Hoje';
  }
  
  // Se for amanhã
  if (localDate.toDateString() === tomorrow.toDateString()) {
    return 'Amanhã';
  }
  
  // Formato padrão: dia/mês/ano
  return localDate.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit'
  });
};

export const formatDateRelative = (dateString: string): string => {
  const now = new Date();
  const date = new Date(dateString);
  const localDate = new Date(date.getTime() + date.getTimezoneOffset() * 60000);
  
  const diffMs = now.getTime() - localDate.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffSecs < 60) {
    return 'agora mesmo';
  } else if (diffMins < 60) {
    return `há ${diffMins} ${diffMins === 1 ? 'minuto' : 'minutos'}`;
  } else if (diffHours < 24) {
    return `há ${diffHours} ${diffHours === 1 ? 'hora' : 'horas'}`;
  } else if (diffDays < 7) {
    return `há ${diffDays} ${diffDays === 1 ? 'dia' : 'dias'}`;
  } else {
    return localDate.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit'
    });
  }
};

// Função auxiliar para ajustar timezone
export const adjustTimezone = (date: Date): Date => {
  return new Date(date.getTime() + date.getTimezoneOffset() * 60000);
};

// Função para comparar datas ignorando timezone
export const isSameDay = (date1: Date, date2: Date): boolean => {
  const d1 = new Date(date1.getTime() + date1.getTimezoneOffset() * 60000);
  const d2 = new Date(date2.getTime() + date2.getTimezoneOffset() * 60000);
  
  return d1.getFullYear() === d2.getFullYear() &&
         d1.getMonth() === d2.getMonth() &&
         d1.getDate() === d2.getDate();
};