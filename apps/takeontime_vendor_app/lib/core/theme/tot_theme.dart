import 'package:flutter/material.dart';

class TotTheme {
  static ThemeData vendorTheme = ThemeData(
    useMaterial3: true,
    scaffoldBackgroundColor: const Color(0xFFF8F9FA),
    colorScheme: const ColorScheme.light(
      primary: Color(0xFFFF6B35),
      onPrimary: Colors.white,
      primaryContainer: Color(0xFFFFE8DE),
      onPrimaryContainer: Color(0xFF7A270D),
      secondary: Color(0xFF2F3A34),
      onSecondary: Colors.white,
      surface: Colors.white,
      onSurface: Color(0xFF1F2937),
      outline: Color(0xFFE5E7EB),
    ),
    cardTheme: const CardThemeData(
      color: Colors.white,
      elevation: 0,
      margin: EdgeInsets.zero,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.all(Radius.circular(16))),
    ),
    appBarTheme: const AppBarTheme(
      backgroundColor: Color(0xFFF8F9FA),
      surfaceTintColor: Colors.transparent,
      elevation: 0,
      centerTitle: false,
      titleTextStyle: TextStyle(color: Color(0xFF1F2937), fontSize: 20, fontWeight: FontWeight.w800),
      iconTheme: IconThemeData(color: Color(0xFF1F2937)),
    ),
    navigationBarTheme: const NavigationBarThemeData(
      height: 76,
      backgroundColor: Colors.white,
      surfaceTintColor: Colors.transparent,
      indicatorColor: Color(0xFFFFE8DE),
      labelTextStyle: WidgetStatePropertyAll(TextStyle(fontSize: 11, fontWeight: FontWeight.w700)),
      iconTheme: WidgetStatePropertyAll(IconThemeData(size: 22)),
    ),
  );
}
