import 'package:flutter/material.dart';
import '../authService.dart';

class HabitsScreen extends StatefulWidget {
  final int userId; // Pass the user's ID to the screen
  const HabitsScreen({super.key, required this.userId});

  @override
  State<HabitsScreen> createState() => _HabitsScreenState();
}

class _HabitsScreenState extends State<HabitsScreen> {
  final AuthService _authService = AuthService();
  late Future<List<Map<String, dynamic>>> _habitsFuture;

  @override
  void initState() {
    super.initState();
    // Fetch habits for the logged-in user
    _habitsFuture = _authService.fetchHabits(widget.userId);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Your Habits'),
      ),
      body: FutureBuilder<List<Map<String, dynamic>>>(
        future: _habitsFuture,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          } else if (snapshot.hasError) {
            return Center(
              child: Text('Error: ${snapshot.error}'),
            );
          } else if (snapshot.hasData && snapshot.data!.isEmpty) {
            return const Center(
              child: Text('No habits found. Add a new habit to get started!'),
            );
          } else if (snapshot.hasData) {
            final habits = snapshot.data!;
            return ListView.builder(
              itemCount: habits.length,
              itemBuilder: (context, index) {
                final habit = habits[index];
                return ListTile(
                  title: Text(habit['name'] ?? 'Unnamed Habit'),
                  subtitle: Text(habit['description'] ?? 'No description'),
                  trailing: Text(
                    habit['frequency'] ?? 'Daily', // Example field
                    style: const TextStyle(color: Colors.grey),
                  ),
                );
              },
            );
          }
          return const SizedBox.shrink(); // Should not reach here
        },
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          // Navigate to Add Habit screen (to be implemented)
        },
        child: const Icon(Icons.add),
      ),
    );
  }
}