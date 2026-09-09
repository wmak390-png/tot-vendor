// This is a basic Flutter widget test.
//
// To perform an interaction with a widget in your test, use the WidgetTester
// utility in the flutter_test package. For example, you can send tap and scroll
// gestures. You can also use WidgetTester to find child widgets in the widget
// tree, read text, and verify that the values of widget properties are correct.

import 'package:flutter_test/flutter_test.dart';

import 'package:takeontime_admin_app/main.dart';

void main() {
  testWidgets('TakeOnTime admin app renders and shows operations overview', (WidgetTester tester) async {
    await tester.pumpWidget(const AdminApp());
    expect(find.text('TakeOnTime Admin'), findsWidgets);
    expect(find.text('Operations overview'), findsOneWidget);
  });
}
