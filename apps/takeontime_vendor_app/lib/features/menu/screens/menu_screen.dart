import 'package:flutter/material.dart';

import '../../../core/supabase/supabase_bootstrap.dart';
import '../../store/data/vendor_operations_repository.dart';

const _fallbackVendorId = 'demo-vendor-1';

class MenuScreen extends StatefulWidget {
  const MenuScreen({super.key});

  @override
  State<MenuScreen> createState() => _MenuScreenState();
}

class _MenuScreenState extends State<MenuScreen> {
  final _repository = const VendorOperationsRepository();
  String _vendorId = _fallbackVendorId;
  final _searchController = TextEditingController();
  final _demoCategories = const [
    VendorMenuCategory(id: 'cat-1', name: 'Breakfast'),
    VendorMenuCategory(id: 'cat-2', name: 'Main Course'),
    VendorMenuCategory(id: 'cat-3', name: 'Beverages'),
    VendorMenuCategory(id: 'cat-4', name: 'Desserts'),
  ];
  final _demoItems = const [
    VendorMenuItem(id: 'item-1', categoryId: 'cat-2', name: 'Paneer Tikka Bowl', description: 'Smoky paneer, roasted vegetables, mint chutney', price: 189, prepMinutes: 12, isAvailable: true),
    VendorMenuItem(id: 'item-2', categoryId: 'cat-2', name: 'Butter Chicken Rice', description: 'Creamy tomato gravy, basmati rice, pickled onions', price: 249, prepMinutes: 15, isAvailable: true),
    VendorMenuItem(id: 'item-3', categoryId: 'cat-2', name: 'Dal Makhani Combo', description: 'Slow-cooked black lentils with two rotis', price: 169, prepMinutes: 10, isAvailable: false),
    VendorMenuItem(id: 'item-4', categoryId: 'cat-3', name: 'Cold Brew', description: '18-hour steeped coffee with orange peel', price: 129, prepMinutes: 3, isAvailable: true),
    VendorMenuItem(id: 'item-5', categoryId: 'cat-1', name: 'Masala Omelette', description: 'Three eggs, onion, coriander, toasted pav', price: 139, prepMinutes: 8, isAvailable: true),
  ];

  List<VendorMenuCategory> _categories = [];
  List<VendorMenuItem> _items = [];
  VendorMenuCategory? _selectedCategory;
  String _filter = 'All';
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _loadMenu();
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _loadMenu() async {
    try {
      final resolvedVendorId = await _repository.resolveVendorId(fallback: _fallbackVendorId);
      if (resolvedVendorId == null || resolvedVendorId.isEmpty) {
        if (!mounted) return;
        setState(() {
          _categories = SupabaseBootstrap.client == null ? _demoCategories : const [];
          _items = SupabaseBootstrap.client == null ? _demoItems : const [];
          _loading = false;
        });
        return;
      }
      _vendorId = resolvedVendorId;
      final snapshot = await _repository.fetchMenu(_vendorId);
      if (!mounted) return;
      setState(() {
        _categories = snapshot.categories;
        _items = snapshot.items;
        _loading = false;
      });
    } catch (_) {
      if (!mounted) return;
      setState(() {
        _categories = SupabaseBootstrap.client == null ? _demoCategories : const [];
        _items = SupabaseBootstrap.client == null ? _demoItems : const [];
        _loading = false;
      });
    }
  }

  List<VendorMenuItem> get _filteredItems {
    final query = _searchController.text.trim().toLowerCase();
    return _items.where((item) {
      final inCategory = item.categoryId == _selectedCategory?.id;
      final matchesQuery = query.isEmpty || item.name.toLowerCase().contains(query) || item.description.toLowerCase().contains(query);
      final matchesFilter = _filter == 'All' || (_filter == 'Active' ? item.isAvailable : !item.isAvailable);
      return inCategory && matchesQuery && matchesFilter;
    }).toList();
  }

  void _openItems(VendorMenuCategory category) => setState(() {
        _selectedCategory = category;
        _filter = 'All';
        _searchController.clear();
      });

  Future<void> _toggleItem(VendorMenuItem item, bool isAvailable) async {
    final index = _items.indexWhere((candidate) => candidate.id == item.id);
    setState(() => _items[index] = item.copyWith(isAvailable: isAvailable));
    try {
      final updated = await _repository.updateItem(vendorId: _vendorId, item: item, isAvailable: isAvailable);
      if (mounted) setState(() => _items[index] = updated);
    } catch (_) {
      if (mounted) setState(() => _items[index] = item);
      _showMessage('Could not update live availability.');
    }
  }

  void _showMessage(String message) => ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(message)));

  Future<void> _addCategory() async {
    final controller = TextEditingController();
    final name = await showDialog<String>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('New category'),
        content: TextField(controller: controller, autofocus: true, decoration: const InputDecoration(labelText: 'Category name')),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel')),
          FilledButton(onPressed: () => Navigator.pop(context, controller.text.trim()), child: const Text('Add')),
        ],
      ),
    );
    controller.dispose();
    if (name == null || name.isEmpty) return;
    try {
      final category = await _repository.createCategory(vendorId: _vendorId, name: name);
      if (mounted) setState(() => _categories = [..._categories, category]);
    } catch (_) {
      _showMessage('Could not add category.');
    }
  }

  Future<void> _editItem({VendorMenuItem? item}) async {
    final result = await showModalBottomSheet<VendorMenuItem>(
      context: context,
      isScrollControlled: true,
      builder: (_) => _ItemForm(item: item, category: _selectedCategory!),
    );
    if (result == null) return;
    try {
      final saved = item == null
          ? await _repository.createItem(vendorId: _vendorId, categoryId: result.categoryId, name: result.name, description: result.description, price: result.price, prepMinutes: result.prepMinutes, isAvailable: result.isAvailable)
          : await _repository.updateItem(vendorId: _vendorId, item: item, name: result.name, description: result.description, price: result.price, prepMinutes: result.prepMinutes, isAvailable: result.isAvailable);
      if (!mounted) return;
      setState(() => _items = item == null ? [..._items, saved] : _items.map((current) => current.id == item.id ? saved : current).toList());
    } catch (_) {
      _showMessage('Could not save item.');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        titleSpacing: 16,
        title: const Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('MENU MANAGEMENT', style: TextStyle(fontSize: 10, letterSpacing: 1.4, fontWeight: FontWeight.w800)),
            SizedBox(height: 2),
            Text('Your menu', style: TextStyle(fontSize: 20, fontWeight: FontWeight.w800)),
          ],
        ),
      ),
      body: _loading ? const Center(child: CircularProgressIndicator()) : _selectedCategory == null ? _buildCategories() : _buildItems(),
    );
  }

  Widget _buildCategories() {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Text('Menu categories', style: Theme.of(context).textTheme.headlineSmall),
        const SizedBox(height: 6),
        Text('Keep your menu easy to browse during the rush.', style: Theme.of(context).textTheme.bodyMedium),
        const SizedBox(height: 16),
        FilledButton.icon(onPressed: _addCategory, icon: const Icon(Icons.add_rounded), label: const Text('Add category')),
        const SizedBox(height: 12),
        ..._categories.map((category) => Card(
              child: ListTile(
                leading: Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(color: Theme.of(context).colorScheme.primaryContainer, borderRadius: BorderRadius.circular(12)),
                  child: Icon(_iconForCategory(category.name), color: Theme.of(context).colorScheme.primary),
                ),
                title: Text(category.name, style: const TextStyle(fontWeight: FontWeight.w800)),
                subtitle: Text('${_items.where((item) => item.categoryId == category.id).length} items', style: const TextStyle(fontSize: 12)),
                trailing: const Icon(Icons.arrow_forward_ios_rounded, size: 16),
                onTap: () => _openItems(category),
              ),
            )),
      ],
    );
  }

  Widget _buildItems() {
    final category = _selectedCategory!;
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Row(children: [
          Expanded(child: Text(category.name, style: Theme.of(context).textTheme.headlineSmall)),
          TextButton.icon(onPressed: () => setState(() => _selectedCategory = null), icon: const Icon(Icons.layers_outlined), label: const Text('Categories')),
        ]),
        const SizedBox(height: 8),
        TextField(controller: _searchController, onChanged: (_) => setState(() {}), decoration: const InputDecoration(prefixIcon: Icon(Icons.search_rounded), hintText: 'Search items', filled: true, border: InputBorder.none)),
        const SizedBox(height: 10),
        Row(children: [
          for (final filter in ['All', 'Active', 'Sold Out']) Padding(padding: const EdgeInsets.only(right: 8), child: ChoiceChip(label: Text(filter), selected: _filter == filter, onSelected: (_) => setState(() => _filter = filter))),
          const Spacer(),
          IconButton(onPressed: () => _editItem(), tooltip: 'Add item', icon: const Icon(Icons.add_circle)),
        ]),
        const SizedBox(height: 8),
        if (_filteredItems.isEmpty) const Padding(padding: EdgeInsets.all(32), child: Center(child: Text('No matching items'))),
        ..._filteredItems.map((item) => Card(
              child: ListTile(
                onTap: () => _editItem(item: item),
                leading: Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(color: item.isAvailable ? Theme.of(context).colorScheme.primaryContainer : const Color(0xFFF3F4F6), borderRadius: BorderRadius.circular(12)),
                  child: Icon(Icons.restaurant_rounded, color: item.isAvailable ? Theme.of(context).colorScheme.primary : const Color(0xFF9CA3AF)),
                ),
                title: Text(item.name, style: const TextStyle(fontWeight: FontWeight.w800)),
                subtitle: Text('${item.description}\n₹${item.price.toStringAsFixed(0)} · ${item.prepMinutes} min prep', maxLines: 2, overflow: TextOverflow.ellipsis),
                isThreeLine: true,
                trailing: Switch(value: item.isAvailable, onChanged: (value) => _toggleItem(item, value)),
              ),
            )),
      ],
    );
  }

  IconData _iconForCategory(String name) {
    final normalized = name.toLowerCase();
    if (normalized.contains('beverage') || normalized.contains('drink')) return Icons.local_cafe_outlined;
    if (normalized.contains('dessert')) return Icons.cake_outlined;
    if (normalized.contains('breakfast')) return Icons.wb_sunny_outlined;
    return Icons.eco_outlined;
  }
}

class _ItemForm extends StatefulWidget {
  const _ItemForm({required this.item, required this.category});

  final VendorMenuItem? item;
  final VendorMenuCategory category;

  @override
  State<_ItemForm> createState() => _ItemFormState();
}

class _ItemFormState extends State<_ItemForm> {
  late final _name = TextEditingController(text: widget.item?.name);
  late final _description = TextEditingController(text: widget.item?.description);
  late final _price = TextEditingController(text: widget.item == null ? '' : widget.item!.price.toStringAsFixed(0));
  late final _prep = TextEditingController(text: '${widget.item?.prepMinutes ?? 10}');
  late bool _isAvailable = widget.item?.isAvailable ?? true;

  @override
  void dispose() {
    _name.dispose();
    _description.dispose();
    _price.dispose();
    _prep.dispose();
    super.dispose();
  }

  void _submit() {
    final price = double.tryParse(_price.text);
    final prep = int.tryParse(_prep.text);
    if (_name.text.trim().isEmpty || price == null || price < 0 || prep == null || prep < 1) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Enter a name, valid price, and prep time.')));
      return;
    }
    Navigator.pop(context, VendorMenuItem(id: widget.item?.id ?? '', categoryId: widget.category.id, name: _name.text.trim(), description: _description.text.trim().isEmpty ? 'Freshly prepared in our kitchen' : _description.text.trim(), price: price, prepMinutes: prep, isAvailable: _isAvailable));
  }

  @override
  Widget build(BuildContext context) {
    final bottom = MediaQuery.viewInsetsOf(context).bottom;
    return Padding(
      padding: EdgeInsets.fromLTRB(16, 20, 16, bottom + 16),
      child: SingleChildScrollView(
        child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
          Text(widget.item == null ? 'Create an item' : 'Edit item', style: Theme.of(context).textTheme.headlineSmall),
          const SizedBox(height: 16),
          TextField(controller: _name, autofocus: true, decoration: const InputDecoration(labelText: 'Item name', border: OutlineInputBorder())),
          const SizedBox(height: 12),
          TextField(controller: _description, maxLines: 2, decoration: const InputDecoration(labelText: 'Description', border: OutlineInputBorder())),
          const SizedBox(height: 12),
          Row(children: [
            Expanded(child: TextField(controller: _price, keyboardType: const TextInputType.numberWithOptions(decimal: true), decoration: const InputDecoration(labelText: 'Price (₹)', border: OutlineInputBorder()))),
            const SizedBox(width: 12),
            Expanded(child: TextField(controller: _prep, keyboardType: TextInputType.number, decoration: const InputDecoration(labelText: 'Prep minutes', border: OutlineInputBorder()))),
          ]),
          SwitchListTile(contentPadding: EdgeInsets.zero, title: const Text('Available to customers'), value: _isAvailable, onChanged: (value) => setState(() => _isAvailable = value)),
          FilledButton.icon(onPressed: _submit, icon: const Icon(Icons.check), label: Text(widget.item == null ? 'Add item' : 'Save changes')),
        ]),
      ),
    );
  }
}
