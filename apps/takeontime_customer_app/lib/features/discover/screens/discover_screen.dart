import 'package:flutter/material.dart';

import 'vendor_detail_screen.dart';

class DiscoverScreen extends StatelessWidget {
  const DiscoverScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final cards = [
      const _VendorCard(
        name: 'Little Fern Kitchen',
        eta: 'Ready in 18 mins',
        status: 'Open',
        cuisines: 'South Indian · Healthy bowls',
        delivery: 'Pickup · 4.8 ★',
      ),
      const SizedBox(height: 12),
      const _VendorCard(
        name: 'Bamboo Bowl',
        eta: 'Closed for lunch break',
        status: 'On break',
        cuisines: 'Rice bowls · Curries',
        delivery: 'Pickup · 4.6 ★',
      ),
      const SizedBox(height: 12),
      const _VendorCard(
        name: 'Saffron Bites',
        eta: 'Ready in 10 mins',
        status: 'Open',
        cuisines: 'North Indian · Snacks',
        delivery: 'Pickup · 4.9 ★',
      ),
    ];

    return Scaffold(
      appBar: AppBar(title: const Text('Discover vendors')),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const _SearchBar(),
              const SizedBox(height: 16),
              const _QuickFilterRow(),
              const SizedBox(height: 16),
              const _SectionHeader(title: 'Popular near you'),
              ...cards,
              const SizedBox(height: 20),
              const _SectionHeader(title: 'Saved favorites'),
              const _FavoriteRow(),
              const SizedBox(height: 20),
              const _SectionHeader(title: 'Loyalty rewards'),
              const _RewardsCard(),
              const SizedBox(height: 20),
              const _SectionHeader(title: 'Today\'s deals'),
              const _TodayDealsCard(),
              const SizedBox(height: 20),
              const _SectionHeader(title: 'Delivery status'),
              const _DeliveryCard(),
              const SizedBox(height: 20),
              const _SectionHeader(title: 'Saved routines'),
              const _RoutineCard(),
              const SizedBox(height: 20),
              const _SectionHeader(title: 'Membership perks'),
              const _MembershipCard(),
              const SizedBox(height: 20),
              const _SectionHeader(title: 'Quick reorders'),
              const _ReorderCard(),
              const SizedBox(height: 20),
              const _SectionHeader(title: 'Your cart'),
              const _CartSummaryCard(),
            ],
          ),
        ),
      ),
    );
  }
}

class _SearchBar extends StatelessWidget {
  const _SearchBar();

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 52,
      padding: const EdgeInsets.symmetric(horizontal: 16),
      decoration: BoxDecoration(
        color: Colors.grey.shade100,
        borderRadius: BorderRadius.circular(16),
      ),
      child: const Row(
        children: [
          Icon(Icons.search, color: Colors.grey),
          SizedBox(width: 12),
          Text('Search for cuisines or dishes'),
        ],
      ),
    );
  }
}

class _QuickFilterRow extends StatelessWidget {
  const _QuickFilterRow();

  @override
  Widget build(BuildContext context) {
    final chips = ['Healthy', 'Quick', 'Budget', 'Veg'];
    return Wrap(
      spacing: 8,
      runSpacing: 8,
      children: chips
          .map(
            (chip) => FilterChip(
              label: Text(chip),
              selected: chip == 'Healthy',
              onSelected: (_) {},
            ),
          )
          .toList(),
    );
  }
}

class _FavoriteRow extends StatelessWidget {
  const _FavoriteRow();

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 120,
      child: ListView(
        scrollDirection: Axis.horizontal,
        children: const [
          _FavoriteCard(title: 'Little Fern', subtitle: 'Healthy bowls'),
          SizedBox(width: 12),
          _FavoriteCard(title: 'Bamboo Bowl', subtitle: 'Rice bowls'),
          SizedBox(width: 12),
          _FavoriteCard(title: 'Saffron', subtitle: 'Snacks'),
        ],
      ),
    );
  }
}

class _FavoriteCard extends StatelessWidget {
  const _FavoriteCard({required this.title, required this.subtitle});

  final String title;
  final String subtitle;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 160,
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.primaryContainer,
        borderRadius: BorderRadius.circular(16),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Icon(Icons.favorite_border),
          const Spacer(),
          Text(title, style: Theme.of(context).textTheme.titleSmall),
          Text(subtitle, style: Theme.of(context).textTheme.bodySmall),
        ],
      ),
    );
  }
}

class _SectionHeader extends StatelessWidget {
  const _SectionHeader({required this.title});

  final String title;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Text(
        title,
        style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w700),
      ),
    );
  }
}

class _VendorCard extends StatelessWidget {
  const _VendorCard({
    required this.name,
    required this.eta,
    required this.status,
    required this.cuisines,
    required this.delivery,
  });

  final String name;
  final String eta;
  final String status;
  final String cuisines;
  final String delivery;

  @override
  Widget build(BuildContext context) {
    final statusColor = status == 'Open' ? Colors.green : Colors.orange;

    return InkWell(
      borderRadius: BorderRadius.circular(16),
      onTap: () {
        Navigator.of(context).push(
          MaterialPageRoute<void>(
            builder: (_) => VendorDetailScreen(
              name: name,
              eta: eta,
              status: status,
              cuisines: cuisines,
            ),
          ),
        );
      },
      child: Card(
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                width: 56,
                height: 56,
                decoration: BoxDecoration(
                  color: Theme.of(context).colorScheme.primaryContainer,
                  borderRadius: BorderRadius.circular(16),
                ),
                child: const Icon(Icons.storefront, size: 28),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Expanded(child: Text(name, style: Theme.of(context).textTheme.titleMedium)),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                          decoration: BoxDecoration(
                            color: statusColor.withValues(alpha: 0.15),
                            borderRadius: BorderRadius.circular(999),
                          ),
                          child: Text(
                            status,
                            style: TextStyle(
                              color: statusColor,
                              fontWeight: FontWeight.w700,
                              fontSize: 12,
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    Text(cuisines, style: Theme.of(context).textTheme.bodyMedium),
                    const SizedBox(height: 8),
                    Row(
                      children: [
                        const Icon(Icons.access_time, size: 16, color: Colors.grey),
                        const SizedBox(width: 6),
                        Text(eta, style: const TextStyle(color: Colors.grey)),
                      ],
                    ),
                    const SizedBox(height: 6),
                    Text(delivery, style: const TextStyle(color: Colors.grey)),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _RewardsCard extends StatelessWidget {
  const _RewardsCard();

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: const [
            Text('Available rewards', style: TextStyle(fontWeight: FontWeight.w700)),
            SizedBox(height: 8),
            Text('₹180 cashback available for your next healthy bowl order.'),
            SizedBox(height: 8),
            Text('2 stamps left until your next free drink.'),
          ],
        ),
      ),
    );
  }
}

class _TodayDealsCard extends StatelessWidget {
  const _TodayDealsCard();

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: const [
            Text('Lunch special', style: TextStyle(fontWeight: FontWeight.w700)),
            SizedBox(height: 8),
            Text('Buy any combo and get a seasonal fruit cup free.'),
            SizedBox(height: 8),
            Text('Valid until 2:00 PM today for pickup orders.'),
          ],
        ),
      ),
    );
  }
}

class _DeliveryCard extends StatelessWidget {
  const _DeliveryCard();

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: const [
            Text('Next delivery', style: TextStyle(fontWeight: FontWeight.w700)),
            SizedBox(height: 8),
            Text('Estimated arrival: 12:50 PM from Little Fern Kitchen.'),
            SizedBox(height: 8),
            Text('Driver is 6 minutes away and will call on arrival.'),
          ],
        ),
      ),
    );
  }
}

class _RoutineCard extends StatelessWidget {
  const _RoutineCard();

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: const [
            Text('Your lunch rhythm', style: TextStyle(fontWeight: FontWeight.w700)),
            SizedBox(height: 8),
            Text('Mon–Fri: healthy bowl and coffee at 1:00 PM from Little Fern.'),
            SizedBox(height: 8),
            Text('Default pickup location: Home · 16th Main.'),
          ],
        ),
      ),
    );
  }
}

class _MembershipCard extends StatelessWidget {
  const _MembershipCard();

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: const [
            Text('Member status', style: TextStyle(fontWeight: FontWeight.w700)),
            SizedBox(height: 8),
            Text('Gold tier: free delivery over ₹299 and 15% off on third-order weekly bundles.'),
          ],
        ),
      ),
    );
  }
}

class _ReorderCard extends StatelessWidget {
  const _ReorderCard();

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: const [
            Text('Repeat favorites', style: TextStyle(fontWeight: FontWeight.w700)),
            SizedBox(height: 8),
            Text('Classic Bowl • Coconut Curry • Mango Rice Bowl'),
            SizedBox(height: 8),
            Text('Last reordered 2 days ago from Little Fern Kitchen.'),
          ],
        ),
      ),
    );
  }
}

class _CartSummaryCard extends StatelessWidget {
  const _CartSummaryCard();

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('2 items • ₹460', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700)),
            const SizedBox(height: 8),
            const Text('Classic Bowl • ₹220'),
            const Text('Coconut Curry • ₹240'),
            const SizedBox(height: 12),
            const Row(
              children: [
                Icon(Icons.payments_outlined, size: 18),
                SizedBox(width: 8),
                Text('UPI • Razorpay'),
              ],
            ),
            const SizedBox(height: 12),
            SizedBox(
              width: double.infinity,
              child: FilledButton(
                onPressed: () {
                  Navigator.of(context).push(
                    MaterialPageRoute<void>(
                      builder: (_) => const CheckoutScreen(),
                    ),
                  );
                },
                child: const Text('Checkout'),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
