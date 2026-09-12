import 'package:flutter/material.dart';

class TotTheme {
  static ThemeData customerTheme = ThemeData(
    useMaterial3: true,
    colorScheme: ColorScheme.fromSeed(
      seedColor: const Color(0xFF16A34A),
      brightness: Brightness.light,
    ),
    appBarTheme: const AppBarTheme(
      centerTitle: false,
    ),
  );
}
