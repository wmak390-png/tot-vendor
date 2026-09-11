import '../../../core/supabase/supabase_bootstrap.dart';

class AdminVendor {
  const AdminVendor({required this.id, required this.businessName, required this.businessType, required this.address, this.approvalNote, this.isApproved = false});

  final String id;
  final String businessName;
  final String businessType;
  final String address;
  final String? approvalNote;
  final bool isApproved;

  factory AdminVendor.fromJson(Map<String, dynamic> json) => AdminVendor(
        id: json['id'] as String,
        businessName: json['business_name'] as String? ?? 'Unnamed vendor',
        businessType: json['business_type'] as String? ?? 'Food vendor',
        address: json['address'] as String? ?? 'Address not provided',
        approvalNote: json['approval_note'] as String?,
        isApproved: json['is_approved'] as bool? ?? false,
      );
}

class AdminRepository {
  const AdminRepository();

  Future<List<AdminVendor>> fetchVendors() async {
    final client = SupabaseBootstrap.client;
    if (client == null) throw StateError('Supabase is not configured.');
    final rows = await client
        .from('vendors')
        .select('id, business_name, business_type, address, approval_note, is_approved')
        .order('business_name');
    return rows.map((row) => AdminVendor.fromJson(row)).toList();
  }

  Future<List<AdminVendor>> fetchPendingVendors() async {
    final client = SupabaseBootstrap.client;
    if (client == null) {
      throw StateError('Supabase is not configured. Pass SUPABASE_URL and SUPABASE_ANON_KEY.');
    }

    final rows = await client
        .from('vendors')
        .select('id, owner_id, business_name, business_type, address, approval_note, created_at')
        .eq('is_approved', false)
        .order('created_at');
    return rows.map((row) => AdminVendor.fromJson(row)).toList();
  }

  Future<void> approveVendor(String vendorId) async {
    final client = SupabaseBootstrap.client;
    if (client == null) throw StateError('Supabase is not configured.');
    await client.functions.invoke('approve-vendor', body: {'vendorId': vendorId, 'approved': true});
  }

  Future<void> rejectVendor({required String vendorId, required String reason}) async {
    final client = SupabaseBootstrap.client;
    if (client == null) throw StateError('Supabase is not configured.');
    await client.functions.invoke('approve-vendor', body: {'vendorId': vendorId, 'approved': false, 'approvalNote': reason});
  }
}
