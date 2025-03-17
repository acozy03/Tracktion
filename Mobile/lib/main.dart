import 'package:flutter/material.dart';
import 'package:tracktion_mobile/screens/addHabit.dart';
import 'screens/login.dart';
import 'screens/register.dart';
import 'screens/home.dart';
import 'package:timezone/data/latest.dart' as tz;
import 'screens/notifi_service.dart';



void main() {
  WidgetsFlutterBinding.ensureInitialized();
  tz.initializeTimeZones();
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Tracktion',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorScheme:
            ColorScheme.fromSeed(seedColor: const Color.fromARGB(255, 0, 0, 0)),
        useMaterial3: true,
      ),
      initialRoute: '/',
      routes: {
        '/': (context) => const Login(),
        'register': (context) => const register(),
      },
      onGenerateRoute: (settings) {
        // Handle dynamic routing based on arguments
        if (settings.name == 'home') {
          final args = settings.arguments as Map<String, dynamic>?;
          if (args != null && args['userId'] != null) {
            return MaterialPageRoute(
              builder: (context) => Home(userId: args['userId']),
            );
          }
        } else if (settings.name == 'addHabit') {
          final args = settings.arguments as Map<String, dynamic>?;
          if (args != null && args['userId'] != null) {
            return MaterialPageRoute(
              builder: (context) => AddHabitScreen(userId: args['userId']),
            );
          }
        }

        // Default to the Login screen if route or arguments are invalid
        return MaterialPageRoute(builder: (context) => const Login());
      },
    );
  }
}
