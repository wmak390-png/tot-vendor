import 'package:flutter/material.dart';

class StaffScreen extends StatelessWidget {
  const StaffScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final staff = const [
      {'name': 'Aditi Rao', 'role': 'Owner', 'status': 'On duty'},
      {'name': 'Nikhil Shah', 'role': 'Kitchen', 'status': 'Cooking'},
      {'name': 'Priya Nair', 'role': 'KDS', 'status': 'Ready'},
      {'name': 'Rohit Jain', 'role': 'Finance', 'status': 'Reviewing'},
    ];

    return Scaffold(
      appBar: AppBar(
        titleSpacing: 16,
        title: const Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('TEAM', style: TextStyle(fontSize: 10, letterSpacing: 1.4, fontWeight: FontWeight.w800)),
            SizedBox(height: 2),
            Text('Staff roster', style: TextStyle(fontSize: 20, fontWeight: FontWeight.w800)),
          ],
        ),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Card(
            color: Theme.of(context).colorScheme.secondaryContainer,
            child: const Padding(
              padding: EdgeInsets.all(16),
              child: Text('Operational staffing and role-based access are maintained here for the store and kitchen teams.'),
            ),
          ),
          const SizedBox(height: 20),
          ...staff.map((member) => Card(
                margin: const EdgeInsets.only(bottom: 12),
                child: ListTile(
                  leading: const CircleAvatar(child: Icon(Icons.person_rounded)),
                  title: Text(member['name'] as String),
                  subtitle: Text(member['role'] as String),
                  trailing: Text(member['status'] as String, style: const TextStyle(fontWeight: FontWeight.w700)),
                ),
              )),
        ],
      ),
    );
  }
}
