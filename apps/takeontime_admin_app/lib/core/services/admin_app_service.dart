class AdminPendingVendor {
  const AdminPendingVendor({
    required this.id,
    required this.businessName,
    required this.businessType,
    required this.address,
    required this.note,
    required this.isApproved,
  });

  final String id;
  final String businessName;
  final String businessType;
  final String address;
  final String note;
  final bool isApproved;
}

class AdminOperationsSummary {
  const AdminOperationsSummary({
    required this.pendingApprovals,
    required this.activeVendors,
    required this.ordersToday,
    required this.riskSummary,
  });

  final int pendingApprovals;
  final int activeVendors;
  final int ordersToday;
  final String riskSummary;
}

class AdminAppService {
  const AdminAppService();

  AdminOperationsSummary get summary => const AdminOperationsSummary(
        pendingApprovals: 3,
        activeVendors: 146,
        ordersToday: 1204,
        riskSummary: 'Vendor compliance checks are reviewed before publication. Follow-up is required for two new registrations.',
      );

  List<AdminPendingVendor> get pendingVendors => const [
    AdminPendingVendor(
      id: 'demo-1',
      businessName: 'Little Fern Kitchen',
      businessType: 'Veg & healthy bowls',
      address: 'Bengaluru',
      note: 'Documents checked: GST, FSSAI, bank proof.',
      isApproved: false,
    ),
    AdminPendingVendor(
      id: 'demo-2',
      businessName: 'Bamboo Bowl',
      businessType: 'Rice bowls & curries',
      address: 'Hyderabad',
      note: 'Awaiting final compliance note.',
      isApproved: false,
    ),
    AdminPendingVendor(
      id: 'demo-3',
      businessName: 'Saffron Bites',
      businessType: 'North Indian snacks',
      address: 'Chennai',
      note: 'Quality checklist passed with minor documentation follow-up.',
      isApproved: true,
    ),
  ];
}
