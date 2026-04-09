export class TodayStatsDto {
  date: Date;
  cars_added: number;
  insurances_added: number;
  leads_created: number;
  total_kpi: number;
}

export class MonthStatsDto {
  total_cars: number;
  total_leads: number;
  total_earned: number;
  daily: DailyStatDto[];
}

export class DailyStatDto {
  date: Date;
  user_name: string;
  cars_added: number;
  leads_closed: number;
  total_earned: number;
}

export class UserRatingDto {
  id: number;
  name: string;
  role: string;
  cars_added: number;
  leads_closed: number;
  total_earned: number;
}

export class PaymentDto {
  user_id: number;
  name: string;
  role: string;
  phone: string;
  amount: number;
  status: 'pending' | 'paid';
}
