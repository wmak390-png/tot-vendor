import 'package:flutter/material.dart';

import '../../../core/supabase/auth_repository.dart';

class VendorVerificationScreen extends StatelessWidget {
  const VendorVerificationScreen({
    super.key,
    required this.isRejected,
    this.reason,
  });

  final bool isRejected;
  final String? reason;

  String get _headline => isRejected
      ? 'Your vendor application was not approved during our verification process.'
      : 'Your vendor application is currently under review.';

  Future<void> _signOut(BuildContext context) async {
    try {
      await const AuthRepository().signOut();
    } catch (_) {
      // Sign out is best-effort here; the screen remains usable for the user to retry.
    }
  }

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    final statusColor = isRejected ? const Color(0xFFE53935) : const Color(0xFF3F9D5A);

    return Scaffold(
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(20),
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 500),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  const SizedBox(height: 8),
                  IconButton(
                    alignment: Alignment.centerLeft,
                    onPressed: () => Navigator.of(context).maybePop(),
                    icon: const Icon(Icons.arrow_back_ios_new_rounded, size: 28),
                  ),
                  const SizedBox(height: 12),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 28),
                    decoration: BoxDecoration(
                      color: statusColor,
                      borderRadius: BorderRadius.circular(24),
                    ),
                    child: Row(
                      children: [
                        Container(
                          width: 42,
                          height: 42,
                          decoration: BoxDecoration(
                            color: Colors.white.withValues(alpha: 0.2),
                            shape: BoxShape.circle,
                          ),
                          child: Icon(
                            isRejected ? Icons.block_rounded : Icons.pending_actions_rounded,
                            color: Colors.white,
                          ),
                        ),
                        const SizedBox(width: 16),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                isRejected ? 'Account Rejected' : 'Application under review',
                                style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                                  color: Colors.white,
                                  fontWeight: FontWeight.w700,
                                ),
                              ),
                              const SizedBox(height: 8),
                              Text(
                                _headline,
                                style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                                  color: Colors.white,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 24),
                  Text(
                    isRejected ? 'Rejection reason' : 'Next steps',
                    style: Theme.of(context).textTheme.titleLarge?.copyWith(
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                  const SizedBox(height: 12),
                  if (isRejected && (reason?.trim().isNotEmpty ?? false))
                    Container(
                      padding: const EdgeInsets.all(20),
                      decoration: BoxDecoration(
                        color: scheme.surfaceContainerHighest,
                        borderRadius: BorderRadius.circular(16),
                      ),
                      child: Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Icon(Icons.error_outline_rounded, color: Colors.red.shade700),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Text(
                              reason ?? 'Your application needs additional documentation before approval.',
                              style: Theme.of(context).textTheme.bodyLarge,
                            ),
                          ),
                        ],
                      ),
                    )
                  else
                    Container(
                      padding: const EdgeInsets.all(20),
                      decoration: BoxDecoration(
                        color: scheme.surfaceContainerHighest,
                        borderRadius: BorderRadius.circular(16),
                      ),
                      child: Text(
                        'We are checking your business documentation and store profile. Please keep your application details up to date while we review it.',
                        style: Theme.of(context).textTheme.bodyLarge,
                      ),
                    ),
                  const SizedBox(height: 24),
                  ...[
                    _ActionTile(
                      icon: Icons.upload_file_outlined,
                      title: 'Update documents',
                      subtitle: isRejected ? 'Re-upload valid GST and FSSAI files' : 'Upload or verify the latest compliance docs',
                    ),
                    _ActionTile(
                      icon: Icons.gavel_outlined,
                      title: 'Appeal decision',
                      subtitle: 'Request a manual review of your case',
                    ),
                  ].expand((tile) => [tile, const SizedBox(height: 12)]),
                  const SizedBox(height: 20),
                  FilledButton.icon(
                    style: FilledButton.styleFrom(
                      backgroundColor: const Color(0xFFFF7A2E),
                      padding: const EdgeInsets.symmetric(vertical: 18),
                    ),
                    onPressed: () async {
                      await _signOut(context);
                      if (context.mounted) {
                        Navigator.of(context).popUntil((route) => route.isFirst);
                      }
                    },
                    icon: const Icon(Icons.chat_bubble_outline_rounded),
                    label: const Text('Chat with onboarding team'),
                  ),
                  const SizedBox(height: 16),
                  OutlinedButton.icon(
                    onPressed: () async {
                      await _signOut(context);
                      if (context.mounted) {
                        Navigator.of(context).popUntil((route) => route.isFirst);
                      }
                    },
                    icon: const Icon(Icons.logout_rounded),
                    label: const Text('Go back to login'),
                  ),
                  const SizedBox(height: 24),
                  Center(
                    child: Text(
                      'TakeOnTime Verification System\nReference ID: #VND-88291-REJ',
                      textAlign: TextAlign.center,
                      style: Theme.of(context).textTheme.bodyMedium,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class _ActionTile extends StatelessWidget {
  const _ActionTile({required this.icon, required this.title, required this.subtitle});

  final IconData icon;
  final String title;
  final String subtitle;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.surfaceContainerHighest,
        borderRadius: BorderRadius.circular(16),
      ),
      child: Row(
        children: [
          Container(
            width: 52,
            height: 52,
            decoration: BoxDecoration(
              color: const Color(0xFF1F2937),
              borderRadius: BorderRadius.circular(14),
            ),
            child: Icon(icon, color: Colors.white),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: Theme.of(context).textTheme.titleLarge,
                ),
                const SizedBox(height: 4),
                Text(subtitle, style: Theme.of(context).textTheme.bodyMedium),
              ],
            ),
          ),
          const Icon(Icons.chevron_right_rounded),
        ],
      ),
    );
  }
}
