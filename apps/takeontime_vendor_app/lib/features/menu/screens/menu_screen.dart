import 'package:flutter/material.dart';

class MenuScreen extends StatelessWidget {
  const MenuScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final items = [
      ('Signature Bowl', '₹189', 'Popular'),
      ('Crispy Tofu Wrap', '₹210', 'New'),
      ('Mango Rice Bowl', '₹165', 'Healthy'),
    ];

    return Scaffold(
      appBar: AppBar(title: const Text('Menu')),
      floatingActionButton: FloatingActionButton(
        onPressed: () {},
        child: const Icon(Icons.add),
      ),
      body: SafeArea(
        child: ListView.separated(
          padding: const EdgeInsets.all(16),
          itemCount: items.length,
          separatorBuilder: (_, __) => const SizedBox(height: 12),
          itemBuilder: (context, index) {
            final item = items[index];
            return InkWell(
              onTap: () {
                Navigator.of(context).push(
                  MaterialPageRoute<void>(
                    builder: (_) => MenuItemDetailScreen(
                      name: item.$1,
                      price: item.$2,
                      tag: item.$3,
                    ),
                  ),
                );
              },
              child: Card(
                child: ListTile(
                  title: Text(item.$1),
                  subtitle: Text(item.$3),
                  trailing: Text(item.$2, style: Theme.of(context).textTheme.titleMedium),
                ),
              ),
            );
          },
        ),
      ),
    );
  }
}

class MenuItemDetailScreen extends StatelessWidget {
  const MenuItemDetailScreen({
    super.key,
    required this.name,
    required this.price,
    required this.tag,
  });

  final String name;
  final String price;
  final String tag;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(name)),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: ListView(
            children: [
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(name, style: Theme.of(context).textTheme.headlineSmall),
                      const SizedBox(height: 8),
                      Text(tag),
                      const SizedBox(height: 12),
                      Text('Price: $price'),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 16),
              const _SettingsRow(label: 'Stock status', value: 'In stock'),
              const _SettingsRow(label: 'Ingredients', value: 'Tofu, rice, greens'),
              const _SettingsRow(label: 'Prep time', value: '12 mins'),
            ],
          ),
        ),
      ),
    );
  }
}

class _SettingsRow extends StatelessWidget {
  const _SettingsRow({required this.label, required this.value});

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: ListTile(
        title: Text(label),
        trailing: Text(value),
      ),
    );
  }
}
