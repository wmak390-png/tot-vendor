class CustomerVendorSummary {
  const CustomerVendorSummary({
    required this.id,
    required this.name,
    required this.cuisines,
    required this.status,
    required this.eta,
    required this.rating,
  });

  final String id;
  final String name;
  final String cuisines;
  final String status;
  final String eta;
  final String rating;
}

class CustomerAlertSummary {
  const CustomerAlertSummary({
    required this.title,
    required this.message,
    required this.time,
  });

  final String title;
  final String message;
  final String time;
}

class CustomerAppService {
  const CustomerAppService();

  List<CustomerVendorSummary> get vendors => const [
    CustomerVendorSummary(
      id: 'demo-vendor-1',
      name: 'Little Fern Kitchen',
      cuisines: 'South Indian · Healthy bowls',
      status: 'Open',
      eta: 'Ready in 18 mins',
      rating: '4.8 ★',
    ),
    CustomerVendorSummary(
      id: 'demo-vendor-2',
      name: 'Bamboo Bowl',
      cuisines: 'Rice bowls · Curries',
      status: 'Closed',
      eta: 'Not accepting orders',
      rating: '4.7 ★',
    ),
    CustomerVendorSummary(
      id: 'demo-vendor-3',
      name: 'Saffron Bites',
      cuisines: 'North Indian · Snacks',
      status: 'Open',
      eta: 'Ready in 12 mins',
      rating: '4.9 ★',
    ),
  ];

  List<CustomerAlertSummary> get alerts => const [
    CustomerAlertSummary(title: 'Little Fern Kitchen', message: 'Your order #1041 is being prepared.', time: '12 mins ago'),
    CustomerAlertSummary(title: 'Rewards', message: 'You unlocked a ₹60 cashback reward.', time: '1 hour ago'),
    CustomerAlertSummary(title: 'Delivery', message: 'Your driver is 6 minutes away.', time: '2 hours ago'),
  ];
}
