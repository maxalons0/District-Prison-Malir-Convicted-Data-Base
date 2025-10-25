export const getStatusColor = (status: string): string => {
    switch (status) {
      case 'Confined': return 'bg-red-900 text-red-200';
      case 'On Bail': return 'bg-yellow-900 text-yellow-200';
      case 'Released': return 'bg-green-900 text-green-200';
      case 'Expired Sentence': return 'bg-blue-900 text-blue-200';
      case 'Detainee': return 'bg-orange-900 text-orange-200';
      default: return 'bg-gray-700 text-gray-200';
    }
};
