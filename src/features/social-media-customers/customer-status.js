export const CUSTOMER_STATUSES = [
  {value:'new', label:'New'},
  {value:'active', label:'Active'},
  {value:'hold', label:'Hold'},
  {value:'inactive', label:'Inactive'},
];
export const customerStatusLabel = value => CUSTOMER_STATUSES.find(item => item.value === value)?.label || value || 'Unknown';
