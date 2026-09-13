import 'package:flutter/material.dart';

class TotTheme {
  static ThemeData adminTheme = ThemeData(
    useMaterial3: true,
    brightness: Brightness.dark,
    scaffoldBackgroundColor: const Color(0xFF1E2420),
    colorScheme: const ColorScheme.dark(
      primary: Color(0xFFED6C2D),
      onPrimary: Colors.white,
      primaryContainer: Color(0xFF4A2E20),
      onPrimaryContainer: Color(0xFFFFD9C7),
      secondary: Color(0xFF55CF79),
      onSecondary: Color(0xFF102016),
      surface: Color(0xFF242D27),
      onSurface: Color(0xFFE8F0EB),
      outline: Color(0xFF3B4B40),
    ),
    cardTheme: const CardThemeData(
      color: Color(0xFF242D27),
      elevation: 0,
      margin: EdgeInsets.zero,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.all(Radius.circular(16))),
    ),
    appBarTheme: const AppBarTheme(
      backgroundColor: Color(0xFF1E2420),
      surfaceTintColor: Colors.transparent,
      elevation: 0,
      centerTitle: false,
      titleTextStyle: TextStyle(color: Color(0xFFE8F0EB), fontSize: 20, fontWeight: FontWeight.w800),
      iconTheme: IconThemeData(color: Color(0xFFE8F0EB)),
    ),
    navigationBarTheme: const NavigationBarThemeData(
      height: 76,
      backgroundColor: Color(0xFF151A17),
      surfaceTintColor: Colors.transparent,
      indicatorColor: Color(0xFF4A2E20),
      labelTextStyle: WidgetStatePropertyAll(TextStyle(fontSize: 11, fontWeight: FontWeight.w700)),
      iconTheme: WidgetStatePropertyAll(IconThemeData(size: 22)),
    ),
  );
}
