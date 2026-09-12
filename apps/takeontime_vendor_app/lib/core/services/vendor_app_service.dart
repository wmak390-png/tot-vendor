class VendorDashboardSnapshot {
  const VendorDashboardSnapshot({
    required this.statusLabel,
    required this.activeOrders,
    required this.revenue,
    required this.performanceSummary,
    required this.recentOrders,
  });

  final String statusLabel;
  final int activeOrders;
  final double revenue;
  final String performanceSummary;
  final List<VendorRecentOrder> recentOrders;
}

class VendorRecentOrder {
  const VendorRecentOrder({
    required this.orderId,
    required this.customer,
    required this.total,
    required this.status,
  });

  final String orderId;
  final String customer;
  final String total;
  final String status;
}

class VendorAppService {
  const VendorAppService();

  VendorDashboardSnapshot get dashboard => const VendorDashboardSnapshot(
        statusLabel: 'Open · Accepting orders',
        activeOrders: 24,
        revenue: 3840,
        performanceSummary: 'Peak demand is building over lunch; prep 10 extra signature bowls.',
        recentOrders: [
          VendorRecentOrder(orderId: '#TOT-4814', customer: 'Aarav Sharma', total: '₹482', status: 'Preparing'),
          VendorRecentOrder(orderId: '#TOT-4811', customer: 'Meera Iyer', total: '₹349', status: 'Ready'),
          VendorRecentOrder(orderId: '#TOT-4808', customer: 'Rohan Kapoor', total: '₹421', status: 'Confirmed'),
        ],
      );
}
