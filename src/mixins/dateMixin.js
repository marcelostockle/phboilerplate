import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default {
  methods: {
    customDate(date) {
      if (!date) return '';
      return format(date, "d 'de' MMMM 'del' yyyy", { locale: es });
    },
    customTime(date) {
      if (!date) return '';
      return format(date, 'HH:mm');
    }
  }
};

// Usage: formatDate(new Date(date))
// Usage: formatTime(new Date(date))